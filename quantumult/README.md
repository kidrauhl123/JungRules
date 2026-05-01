# Quantumult X 用法

完整规则：

```conf
https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/quantumult/all.list, tag=自用分流, update-interval=86400, opt-parser=true, enabled=true
```

按策略拆分：

```text
https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/quantumult/by-policy/us.list
https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/quantumult/by-policy/direct.list
https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/quantumult/by-policy/reject.list
https://raw.githubusercontent.com/kidrauhl123/quantumult-rules/main/quantumult/by-policy/global.list
```

如果引用按策略拆分的文件，建议在 Quantumult X 里用 `force-policy=` 指定对应策略。
