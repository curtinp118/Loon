# Loon 配置仓库

个人 Loon 代理配置，包含主配置、插件、脚本和规则集。

## 目录结构

```
Loon/
├── profile/          # 主配置文件
├── plugins/          # 插件模块
├── scripts/          # JavaScript 脚本
└── rules/            # 规则集
```

## 快速开始

### 1. 导入主配置

Loon → 配置 → 所有配置文件 → 点击右上角 `+` → 从链接导入：

```
https://raw.githubusercontent.com/curtinp118/Loon/refs/heads/main/profile/Loon.conf
```

### 2. 添加插件

Loon → 配置 → 所有配置文件 → 点击右上角 `+` → 从链接导入：

```
https://raw.githubusercontent.com/curtinp118/Loon/refs/heads/main/plugins/glados.plugin
```

### 3. 配置节点

**方式一：编辑配置文件**

修改 `profile/Loon.conf` 中的 `[Proxy]` 和 `[Remote Proxy]` 部分，填入订阅链接。

**方式二：UI 配置**

Loon → 配置 → 所有节点 → 点击右上角 `+` → 从链接导入订阅。

### 4. MITM 证书

签到和解锁功能需要 MITM，请在 Loon 中安装并信任 CA 证书。

## 配置说明

- **DNS 优化**：加密 DNS + 域名分流
- **策略组**：手动选择 + 自动测速
- **远程规则**：17 条分类订阅
- **广告拦截**：自动过滤广告请求
- **插件扩展**：签到 / 解锁 / 增强功能

## 鸣谢

### 第三方规则仓库

- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) - 提供主要分流规则
- [Loyalsoldier/geoip](https://github.com/Loyalsoldier/geoip) - GeoIP 数据库
- [Masaiki/GeoIP2-CN](https://gitlab.com/Masaiki/GeoIP2-CN) - 中国 GeoIP 数据库

### 分流图标

- [Koolson/Qure](https://github.com/Koolson/Qure) - 策略组图标
- [Orz-3/mini](https://github.com/Orz-3/mini) - 分流图标
- [fmz200/wool_scripts](https://github.com/fmz200/wool_scripts) - 图标资源

## License

[MIT](LICENSE)