# Quantumult X

完整配置，导入后会带上策略组和分流：

```conf
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/JungRules.conf
```

导入后可以先用内置的临时免费节点测试连通性；如果地区组为空，可以先在 `所有节点` 里手动选择。长期使用建议换成自己的节点订阅。

下面这些是规则资源，不包含策略组，适合加到已有配置里：

```conf
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/by-policy/us.list, tag=美国补充, force-policy=美国, update-interval=86400, opt-parser=true, enabled=true
```

常用文件：

```text
quantumult/by-policy/us.list
quantumult/by-policy/direct.list
quantumult/by-policy/reject.list
quantumult/by-policy/proxy.list
quantumult/by-policy/apple.list
quantumult/by-policy/spotify.list
```
