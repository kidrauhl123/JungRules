# Mihomo 用法

这个目录参考 MetaCubeX/meta-rules-dat 的组织方式：

- `domain/by-policy/`：域名规则，`behavior: domain`
- `ipcidr/by-policy/`：IP CIDR 规则，`behavior: ipcidr`
- `example-with-metacubex.yaml`：推荐写法，通用规则引用 MetaCubeX，上面叠加我的自定义补充

最省事的方式还是用 `clash/by-policy/*.yaml`，它是 classical 格式，兼容性最好。

如果想更接近 MetaCubeX 的拆法，可以这样引用：

```yaml
rule-providers:
  my_us_domain:
    type: http
    behavior: domain
    format: yaml
    path: ./ruleset/my_us_domain.yaml
    url: https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/mihomo/domain/by-policy/us.yaml
    interval: 86400

rules:
  - RULE-SET,my_us_domain,美国节点
```
