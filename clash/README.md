# Clash / Mihomo 用法

这些是 `rule-providers` 用的 classical 规则文件。

示例：

```yaml
rule-providers:
  us:
    type: http
    behavior: classical
    format: yaml
    path: ./ruleset/us.yaml
    url: https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/clash/by-policy/us.yaml
    interval: 86400

rules:
  - RULE-SET,us,美国节点
```

可用文件：

```text
clash/by-policy/us.yaml
clash/by-policy/proxy.yaml
clash/by-policy/direct.yaml
clash/by-policy/reject.yaml
clash/by-policy/apple.yaml
clash/by-policy/global.yaml
clash/by-policy/media.yaml
clash/by-policy/spotify.yaml
clash/by-policy/bilibili.yaml
```
