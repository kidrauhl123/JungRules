# Quantumult X

完整配置，导入后会带上策略组和分流：

```conf
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/JungRules.conf
```

导入后可以先用内置的临时免费节点测试连通性；`自动测速` 会从全部节点里选择延迟最低的一个。长期使用建议换成自己的节点订阅。

下面这些是规则资源，不包含策略组，适合加到已有配置里：

```conf
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/by-policy/ai.list, tag=AI, force-policy=AI, update-interval=86400, opt-parser=true, enabled=true
```

常用文件：

```text
quantumult/by-policy/ai.list
quantumult/by-policy/direct.list
quantumult/by-policy/reject.list
quantumult/by-policy/proxy.list
quantumult/by-policy/apple.list
quantumult/by-policy/spotify.list
```
