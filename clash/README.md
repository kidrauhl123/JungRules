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

## Clash Verge Rev 覆写脚本

如果你已经有节点订阅，推荐直接给订阅添加覆写脚本，这样可以保留原订阅节点，同时用 JungRules 覆盖原订阅里的 `rules`：

```text
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/clash/override/jung-rules.js
```

脚本会自动追加 `rule-providers` 和常用策略组，并默认把原订阅的 `rules` 替换成 JungRules 的 `RULE-SET` 规则。
