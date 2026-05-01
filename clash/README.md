# Clash / Mihomo Rules

These files are classical rule-provider payloads. The policy is selected in your Clash config, not inside the rule file.

## Claude only

```yaml
rule-providers:
  claude:
    type: http
    behavior: classical
    format: yaml
    path: ./ruleset/claude.yaml
    url: https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/clash/claude.yaml
    interval: 86400

rules:
  - RULE-SET,claude,美国节点
```

## Full AI bundle

```yaml
rule-providers:
  ai:
    type: http
    behavior: classical
    format: yaml
    path: ./ruleset/ai.yaml
    url: https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/clash/ai.yaml
    interval: 86400

rules:
  - RULE-SET,ai,美国节点
```
