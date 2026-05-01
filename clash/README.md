# Clash Verge / FlClash

推荐优先使用 `by-policy/*.yaml`，兼容性最好。

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
  - RULE-SET,jung_us,美国节点
```

文本规则集：

```text
clash/domain/*.txt   behavior: domain
clash/ipcidr/*.txt   behavior: ipcidr
```

示例：

```yaml
rule-providers:
  jung_direct:
    type: http
    behavior: domain
    path: ./ruleset/jung_direct.txt
    url: https://raw.githubusercontent.com/kidrauhl123/JungRules/main/clash/domain/direct.txt
    interval: 86400

rules:
  - RULE-SET,jung_direct,DIRECT
```
