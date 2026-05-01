# Quantumult X

完整配置，导入后会带上策略组和分流：

```conf
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/profile.conf
```

下面这些是规则资源，不包含策略组，适合加到已有配置里：

```conf
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/by-policy/us.list, tag=美国节点补充, force-policy=美国节点, update-interval=86400, opt-parser=true, enabled=true
```

常用文件：

```text
quantumult/by-policy/us.list
quantumult/by-policy/direct.list
quantumult/by-policy/reject.list
quantumult/by-policy/global.list
quantumult/by-policy/apple.list
```
