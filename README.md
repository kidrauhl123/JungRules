# JungRules

自用分流规则，覆盖：

- Windows：Clash Verge / Clash Verge Rev
- Android：FlClash
- iOS：Quantumult X

规则来自当前 Quantumult X 规则池导出，并按策略拆分。

## Clash Verge / FlClash

最稳妥的用法：使用 `clash/by-policy/*.yaml`，格式是 `classical`。

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

如果想用 Loyalsoldier 那种文本规则集，也可以用：

```yaml
rule-providers:
  jung_us_domain:
    type: http
    behavior: domain
    path: ./ruleset/jung_us_domain.txt
    url: https://raw.githubusercontent.com/kidrauhl123/JungRules/main/clash/domain/us.txt
    interval: 86400

rules:
  - RULE-SET,jung_us_domain,美国节点
```

## Quantumult X

完整配置，导入后会带上策略组和分流：

```conf
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/profile.conf
```

只想额外引用某个规则资源时，再用 `.list` 文件，例如：

```conf
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/by-policy/us.list, tag=美国节点补充, force-policy=美国节点, update-interval=86400, opt-parser=true, enabled=true
```

## 文件说明

- `clash/by-policy/`：Clash/FlClash 通用，`behavior: classical`
- `clash/domain/`：Clash 域名文本规则，`behavior: domain`
- `clash/ipcidr/`：Clash IP 段文本规则，`behavior: ipcidr`
- `quantumult/profile.conf`：QX 完整配置，包含策略组和分流
- `quantumult/all.list`：QX 规则资源，不包含策略组
- `quantumult/by-policy/`：QX 按策略拆分
- `quantumult/by-resource/`：QX 按原始资源标签拆分

## 规则数量

见 `RULES_SUMMARY.tsv`。
