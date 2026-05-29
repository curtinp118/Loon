# Loon

个人 Loon 代理配置仓库。

## 目录结构

```
Loon/
├── profile/    # 主配置
├── plugins/    # 插件模块
├── scripts/    # JS 脚本
└── rules/      # 规则集
```

## 使用

### 1. 导入主配置

Loon → 配置 → 下载配置 → 输入：

```
https://raw.githubusercontent.com/curtinp118/Loon/refs/heads/main/profile/Loon.conf
```

### 2. 添加插件

Loon → 插件 → 添加插件 URL，按需启用。

### 3. 配置节点

编辑 `profile/Loon.conf` 的 `[Proxy]` 和 `[Remote Proxy]`，填入订阅链接。

### 4. MITM 证书

签到和解锁功能需要 MITM，请在 Loon 中安装并信任 CA 证书。

## 功能

- DNS 优化（加密 DNS + 域名分流）
- 策略组（手动选择 + 自动测速）
- 远程规则（17 条分类订阅）
- 广告拦截
- 插件扩展（签到 / 解锁 / 增强）

## License

[MIT](LICENSE)
