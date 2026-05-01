# 自用分流规则

这是从我当前 Quantumult X 规则池导出的分流规则快照。

## Quantumult X

如果你的策略组名字和我一样，可以直接引用完整规则：

```conf
https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/quantumult/all.list, tag=自用分流, update-interval=86400, opt-parser=true, enabled=true
```

如果只想引用某一类规则，用 `quantumult/by-policy/` 里的文件，例如：

```conf
https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/quantumult/by-policy/us.list, tag=美国节点补充, force-policy=美国节点, update-interval=86400, opt-parser=true, enabled=true
```

## Clash / Mihomo

Clash 规则文件不写策略名，需要在配置里指定走哪个策略组：

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

更多按策略拆分的文件在 `clash/by-policy/`。
