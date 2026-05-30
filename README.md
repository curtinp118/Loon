     1|# Loon 配置仓库
     2|
     3|个人 Loon 代理配置，包含主配置、插件、脚本和规则集。
     4|
     5|## 目录结构
     6|
     7|```
     8|Loon/
     9|├── profile/          # 主配置文件
    10|├── plugins/          # 插件模块
    11|├── scripts/          # JavaScript 脚本
    12|└── rules/            # 规则集
    13|```
    14|
    15|## 快速开始
    16|
    17|### 1. 导入主配置
    18|
    19|Loon → 配置 → 所有配置文件 → 点击右上角 `+` → 从链接导入：
    20|
    21|```
    22|https://raw.githubusercontent.com/curtinp118/Loon/main/profile/Loon.conf
    23|```
    24|
    25|### 2. 添加插件
    26|
    27|Loon → 配置 → 所有配置文件 → 点击右上角 `+` → 从链接导入：
    28|
    29|```
    30|https://raw.githubusercontent.com/curtinp118/Loon/main/plugins/glados.plugin
    31|```
    32|
    33|### 3. 配置节点
    34|
    35|**方式一：编辑配置文件**
    36|
    37|修改 `profile/Loon.conf` 中的 `[Proxy]` 和 `[Remote Proxy]` 部分，填入订阅链接。
    38|
    39|**方式二：UI 配置**
    40|
    41|Loon → 配置 → 所有节点 → 点击右上角 `+` → 从链接导入订阅。
    42|
    43|### 4. MITM 证书
    44|
    45|签到和解锁功能需要 MITM，请在 Loon 中安装并信任 CA 证书。
    46|
    47|## 配置说明
    48|
    49|- **DNS 优化**：加密 DNS + 域名分流
    50|- **策略组**：手动选择 + 自动测速
    51|- **远程规则**：17 条分类订阅
    52|- **广告拦截**：自动过滤广告请求
    53|- **插件扩展**：签到 / 解锁 / 增强功能
    54|
    55|## 鸣谢
    56|
    57|### 第三方规则仓库
    58|
    59|- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) - 提供主要分流规则
    60|- [Loyalsoldier/geoip](https://github.com/Loyalsoldier/geoip) - GeoIP 数据库
    61|- [Masaiki/GeoIP2-CN](https://gitlab.com/Masaiki/GeoIP2-CN) - 中国 GeoIP 数据库
    62|
    63|### 分流图标
    64|
    65|- [Koolson/Qure](https://github.com/Koolson/Qure) - 策略组图标
    66|- [Orz-3/mini](https://github.com/Orz-3/mini) - 分流图标
    67|- [fmz200/wool_scripts](https://github.com/fmz200/wool_scripts) - 图标资源
    68|
    69|## License
    70|
    71|[MIT](LICENSE)