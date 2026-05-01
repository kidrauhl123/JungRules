# Clash / FlClash

推荐使用 `clash/by-policy/*.yaml`，格式是 `classical`。

```yaml
rule-providers:
  jung_us:
    type: http
    behavior: classical
    format: yaml
    path: ./ruleset/jung_us.yaml
    url: https://raw.githubusercontent.com/kidrauhl123/JungRules/main/clash/by-policy/us.yaml
    interval: 86400

rules:
  - RULE-SET,jung_us,美国
```

通用代理规则走 `Proxy`：

```yaml
rule-providers:
  jung_proxy:
    type: http
    behavior: classical
    format: yaml
    path: ./ruleset/jung_proxy.yaml
    url: https://raw.githubusercontent.com/kidrauhl123/JungRules/main/clash/by-policy/proxy.yaml
    interval: 86400

rules:
  - RULE-SET,jung_proxy,Proxy
```

如果想用 Loyalsoldier 那种文本规则集，可以用 `clash/domain/*.txt` 和 `clash/ipcidr/*.txt`。
