# JungRules

适合自己用、也方便新设备一键导入的规则配置。

覆盖：

- Windows：Clash Verge / Clash Verge Rev
- Android：FlClash
- iOS：Quantumult X

## Quantumult X

完整配置，导入后会带上策略组和分流：

```conf
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/JungRules.conf
```

导入后可以先用内置的临时免费节点测试连通性；如果地区组为空，可以先在 `所有节点` 里手动选择。长期使用建议在 QX 的节点资源里换成自己的节点订阅。

策略组命名尽量保持简单：`所有节点`、`香港`、`台湾`、`日本`、`新加坡`、`美国`、`proxy`、`Apple`、`Spotify`、`国际媒体`、`哔哩哔哩`、`兜底分流`。

只想额外引用某个规则资源时，可以使用 `.list` 文件，例如：

```conf
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/by-policy/us.list, tag=美国补充, force-policy=美国, update-interval=86400, opt-parser=true, enabled=true
```

## Clash Verge / FlClash

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

## 文件说明

- `quantumult/profile.conf`：QX 完整配置，包含策略组和分流
- `quantumult/all.list`：QX 规则资源，不包含策略组
- `quantumult/by-policy/`：QX 按策略拆分
- `quantumult/by-resource/`：QX 按原始资源标签拆分
- `clash/by-policy/`：Clash/FlClash 通用，`behavior: classical`
- `clash/domain/`：Clash 域名文本规则，`behavior: domain`
- `clash/ipcidr/`：Clash IP 段文本规则，`behavior: ipcidr`

## 规则数量

见 `RULES_SUMMARY.tsv`。
