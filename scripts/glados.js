/**
 * GLaDOS / Railgun 自动签到 + 积分兑换（多账号版）
 * @author Curtinp118
 * @update 2026-05-28
 * @description 访问 GLaDOS 任意域名的 /console/account 页面抓包保存 Cookie，定时任务自动签到。
 */

const COOKIES_KEY_PREFIX = "GLaDOS_Cookies";
const DOMAINS_LIST_KEY = "GLaDOS_Domains";
const EXCHANGE_PLAN = "plan500";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const isGetHeader = typeof $request !== "undefined";

function safeJsonParse(str) { try { return JSON.parse(str); } catch (e) { return null; } }
function cookiesKeyFor(d) { return COOKIES_KEY_PREFIX + ":" + d; }

function getSavedDomains() {
  var raw = $persistentStore.read(DOMAINS_LIST_KEY);
  if (!raw) return [];
  var list = safeJsonParse(raw) || [];
  return Array.isArray(list) ? list.filter(Boolean) : [];
}

function addDomain(domain) {
  var list = getSavedDomains();
  if (list.indexOf(domain) === -1) {
    list.push(domain);
    $persistentStore.write(JSON.stringify(list), DOMAINS_LIST_KEY);
  }
}

function getCookiesForDomain(domain) {
  var raw = $persistentStore.read(cookiesKeyFor(domain));
  if (!raw) return [];
  var list = safeJsonParse(raw);
  return Array.isArray(list) ? list.filter(Boolean) : [];
}

function saveCookie(domain, cookie) {
  if (!cookie) return { isNew: false, index: -1 };
  var cookies = getCookiesForDomain(domain);
  var idx = cookies.indexOf(cookie);
  if (idx !== -1) return { isNew: false, index: idx };
  cookies.push(cookie);
  $persistentStore.write(JSON.stringify(cookies), cookiesKeyFor(domain));
  addDomain(domain);
  return { isNew: true, index: cookies.length - 1 };
}

// HTTP 请求封装（回调风格）
function httpReq(url, method, cookie, domain, body, callback) {
  var headers = {
    "Content-Type": "application/json;charset=UTF-8",
    Origin: "https://" + domain,
    Referer: "https://" + domain + "/console/current",
    "User-Agent": UA,
    Cookie: cookie
  };
  var opts = { url: url, headers: headers };
  var cb = function (err, resp, data) {
    if (err) {
      console.log("[GLaDOS] 请求失败: " + url + " | " + err);
      callback({ statusCode: 0, data: null, raw: "", error: String(err) });
    } else {
      var statusCode = resp && resp.statusCode ? resp.statusCode : 0;
      callback({ statusCode: statusCode, data: safeJsonParse(data), raw: data || "" });
    }
  };
  if (method === "POST") {
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
    $httpClient.post(opts, cb);
  } else {
    $httpClient.get(opts, cb);
  }
}

// 签到
function doCheckin(cookie, domain, callback) {
  httpReq("https://" + domain + "/api/user/checkin", "POST", cookie, domain, { token: domain }, function (res) {
    if (res.error) return callback({ status: "签到失败", code: -2, message: res.error, points: "0" });
    if (!res.data) return callback({ status: "签到失败", code: -2, message: res.raw, points: "0" });
    var code = res.data.code !== undefined ? res.data.code : -2;
    var msg = res.data.message || "";
    var pts = String(res.data.points || 0);
    console.log("[GLaDOS] 签到 [" + domain + "] code=" + code + " msg=" + msg);
    if (code === 0) return callback({ status: "签到成功", code: 0, message: msg, points: pts });
    if (code === 1) return callback({ status: "重复签到", code: 1, message: msg, points: "0" });
    callback({ status: "签到失败", code: code, message: msg, points: "0" });
  });
}

// 查询状态
function doGetStatus(cookie, domain, callback) {
  httpReq("https://" + domain + "/api/user/status", "GET", cookie, domain, null, function (res) {
    if (!res.data || !res.data.data || res.data.data.leftDays === undefined) {
      return callback({ leftDays: "N/A" });
    }
    var days = parseInt(parseFloat(res.data.data.leftDays), 10);
    callback({ leftDays: days + " 天" });
  });
}

// 查询积分
function doGetPoints(cookie, domain, callback) {
  httpReq("https://" + domain + "/api/user/points", "GET", cookie, domain, null, function (res) {
    if (!res.data || res.data.points === undefined) return callback({ points: "N/A", pointsNum: 0 });
    var n = parseInt(parseFloat(res.data.points), 10);
    console.log("[GLaDOS] 积分 [" + domain + "] " + n);
    callback({ points: String(n), pointsNum: n });
  });
}

// 积分兑换
function doExchange(cookie, domain, plan, callback) {
  httpReq("https://" + domain + "/api/user/exchange", "POST", cookie, domain, { planType: plan }, function (res) {
    if (!res.data) return callback("兑换失败");
    var code = res.data.code !== undefined ? res.data.code : -2;
    if (code === 0) return callback("兑换成功(" + plan + ")");
    callback("兑换失败: " + (res.data.message || ""));
  });
}

// 单账号签到流程（回调链）
function checkinForAccount(cookie, domain, label, callback) {
  console.log("[GLaDOS] === " + label + " | " + domain + " ===");
  doGetStatus(cookie, domain, function (before) {
    doCheckin(cookie, domain, function (result) {
      doGetPoints(cookie, domain, function (pts) {
        var afterCheck = function () {
          doGetStatus(cookie, domain, function (after) {
            callback({
              label: label, domain: domain,
              status: result.status, code: result.code,
              earnedPoints: result.points, totalPoints: pts.points,
              daysBefore: before.leftDays, daysAfter: after.leftDays
            });
          });
        };
        if (pts.pointsNum >= 500) {
          doExchange(cookie, domain, EXCHANGE_PLAN, function (exc) {
            console.log("[GLaDOS] 兑换: " + exc);
            afterCheck();
          });
        } else {
          console.log("[GLaDOS] 积分 " + pts.pointsNum + " < 500，跳过兑换");
          afterCheck();
        }
      });
    });
  });
}

// 顺序执行所有账号签到
function runAllAccounts(allCookies, callback) {
  var results = [];
  var total = 0;
  var domains = Object.keys(allCookies);

  function nextDomain(di) {
    if (di >= domains.length) return callback(results, total);
    var domain = domains[di];
    var cookies = allCookies[domain];

    function nextCookie(ci) {
      if (ci >= cookies.length) return nextDomain(di + 1);
      total++;
      checkinForAccount(cookies[ci], domain, "账号 #" + (ci + 1), function (result) {
        results.push(result);
        nextCookie(ci + 1);
      });
    }
    nextCookie(0);
  }
  nextDomain(0);
}

// === 主逻辑 ===

if (isGetHeader) {
  // 抓包模式：保存 Cookie
  var headers = $request.headers || {};
  var cookie = headers.Cookie || headers.cookie || "";
  var host = headers.Host || headers.host || "";
  if (!cookie || !host) {
    console.log("[GLaDOS] 抓包失败: Cookie=" + (cookie ? "有" : "无") + " Host=" + (host ? "有" : "无"));
    $notification.post("GLaDOS", "抓包失败", "未获取到 Cookie 或 Host");
    $done({});
  } else {
    var r = saveCookie(host, cookie);
    var label = "账号 #" + (r.index + 1);
    console.log("[GLaDOS] " + label + " " + (r.isNew ? "已保存" : "已存在") + " [" + host + "]");
    $notification.post("GLaDOS", label + " " + (r.isNew ? "已保存" : "已存在") + " [" + host + "]",
      r.isNew ? "新账号 Cookie 已记录" : "该 Cookie 已保存过");
    $done({});
  }
} else {
  // 签到模式：随机延迟后执行
  var delay = Math.floor(Math.random() * 11);
  console.log("[GLaDOS] 随机延迟 " + delay + "s");
  setTimeout(function () {
    var domains = getSavedDomains();
    if (domains.length === 0) {
      console.log("[GLaDOS] 无已保存的 Cookie");
      $notification.post("GLaDOS 签到", "无 Cookie", "请先访问 /console/account 抓包");
      $done();
      return;
    }

    // 收集所有 domain 的 cookies
    var allCookies = {};
    for (var i = 0; i < domains.length; i++) {
      var c = getCookiesForDomain(domains[i]);
      if (c.length > 0) allCookies[domains[i]] = c;
    }

    if (Object.keys(allCookies).length === 0) {
      console.log("[GLaDOS] 所有域名均无 Cookie");
      $notification.post("GLaDOS 签到", "无有效 Cookie", "请重新抓包");
      $done();
      return;
    }

    console.log("[GLaDOS] 开始签到...");
    runAllAccounts(allCookies, function (results, total) {
      var ok = 0, dup = 0, fail = 0;
      for (var j = 0; j < results.length; j++) {
        if (results[j].code === 0) ok++;
        else if (results[j].code === 1) dup++;
        else fail++;
      }

      var lines = [];
      for (var k = 0; k < results.length; k++) {
        var r = results[k];
        var icon = r.code === 0 ? "✅" : r.code === 1 ? "🔄" : "❌";
        var pts = r.earnedPoints !== "0" ? " +" + r.earnedPoints : "";
        lines.push(icon + " " + r.label + " " + r.domain + " | " + r.status + pts + " | " + r.daysBefore + "→" + r.daysAfter + " | " + r.totalPoints + "积分");
      }

      var title = "GLaDOS | " + total + "账号 成" + ok + " 重" + dup + " 败" + fail;
      console.log("[GLaDOS] " + title);
      console.log(lines.join("\n"));
      $notification.post(title, "", lines.join("\n"));
      $done();
    });
  }, delay * 1000);
}
