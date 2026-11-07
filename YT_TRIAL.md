# YouTube Premium 购买按钮接管脚本（yt_trial）

让 App 内 YouTube Premium 页**无条件**显示「个人试用 / 家庭试用」两个购买按钮。

## 设计原则：无条件接管

**脚本的唯一目标是：任何账号打开 App 内 Premium 页，都强制把它替换成带购买按钮的页面。**

- 无论页面是正常的方案页、还是「YouTube Premium 在你所在的国家/地区尚未推出」、
  还是「我们无法验证你所在的国家/地区」这类错误页，一律接管。
- 这是**页面外观层面**的强制接管，**不保证 Google 服务端最终放行该笔交易**。
  脚本只负责让按钮出现且可点击；付款是否成功取决于账号地区、令牌归属等
  服务端因素，不属于本脚本职责。

## 三平台文件

| 平台 | 脚本 | 配置 |
|---|---|---|
| Surge | `surge/scripts/yt_trial.js` | 见下「接入方式」 |
| Quantumult X | `quantumult/scripts/yt_trial.js` | `quantumult/yt_trial_qx.conf` |
| 小火箭 Shadowrocket | `shadowrocket/scripts/yt_trial.js` | `shadowrocket/modules/yt_trial.module` |

三份脚本内容**完全相同**（同一份跨平台代码），内部自动识别运行环境。

## 接入方式

### Quantumult X

在配置文件 `[rewrite_local]` 加入：

```conf
^https:\/\/youtubei\.googleapis\.com\/youtubei\/v1\/browse url script-response-body https://raw.githubusercontent.com/kidrauhl123/JungRules/main/quantumult/scripts/yt_trial.js
```

`[mitm]` 的 hostname 要有 `youtubei.googleapis.com`，并开启 MITM、信任证书。

### 小火箭 Shadowrocket

模块 → 添加：
`https://raw.githubusercontent.com/kidrauhl123/JungRules/main/shadowrocket/modules/yt_trial.module`

打开模块，开启 MITM 并信任证书。

### Surge

```conf
[Script]
yt-trial = type=http-response,pattern=^https://youtubei\.googleapis\.com/youtubei/v1/browse,requires-body=1,max-size=-1,binary-body-mode=1,script-path=https://raw.githubusercontent.com/kidrauhl123/JungRules/main/surge/scripts/yt_trial.js

[MITM]
hostname = %APPEND% youtubei.googleapis.com
```

## 工作原理

匹配条件：响应体包含 `premium_page_section_list`（确认是 Premium 页）。
其它页面（首页 / 搜索 / 设置等）一律原样放行。

### Case A —— 页面本身带「个人/家庭」方案卡

就地改造这些卡片的购买命令为 0 元试用：

- 商品号去 `_NFT` 后缀（`_NFT` = No Free Trial 正价无试用）
- `f8.31 = 1`（试用/免费层标志）
- `f8.17` 改为试用获取渠道 `lpr2-acq-c-us-catchall-m`
- 删除 `f8.2`（NFT 商品码）
- 按钮标签改「个人试用 / 家庭试用」，价格文案改「US$0 试用 1 个月」

保留页面原生结构，所以渲染必然正常。

### Case C —— 页面没有任何方案卡（错误页 / 地区未上线）

复用页面自带的 `471037237` 块（App 自己正在渲染它，渲染器 hash 必然匹配
当前版本），复制成个人 / 家庭两块，把按钮命令换成购买命令；若页面块本身
不含按钮，则退化为使用脚本内置的烘焙块模板。

这样即便服务端返回的是「不可购买」的错误页，也能强制显示购买按钮。

## 购买命令来源（Case C）

1. **优先**：当前响应里若能找到真实购买命令 → 转成试用命令使用（令牌属于
   本次会话，最新鲜）。
2. **兜底**：使用脚本内置的烘焙试用命令（令牌来自历史账号，可能过期或不属
   于当前账号——按钮仍显示、可点击，但服务端可能拒绝）。

## 平台 API 差异（脚本已内部处理）

| | 读 body | 写 body |
|---|---|---|
| Surge | `$response.body`（Uint8Array） | `$done({body: u8})` |
| Quantumult X | `$response.bodyBytes`（ArrayBuffer） | `$done({bodyBytes: arrayBuffer})` |
| 小火箭 | `$response.body`（同 Surge） | `$done({body: u8})` |

纯 JS 实现，不依赖 `atob` / `TextDecoder` / `Array.from`（QX 引擎没有 `atob`）。

## 协议要点（改脚本前必读）

- Premium 页路径：`field9 → 58173949 → 1 → 58174010 → 4 → 49399797`
  其下重复 `field1` 为各 section。**组装时必须保留整条包装链，否则白屏。**
- 方案卡：`482325666`（内含 `f3 → 482327878 → f5 → 461054335` 购买按钮）
- 购买按钮：`461054335`（`f4`=购买命令，`f5`=标签，`f19.f1`=无障碍标签）
- 裸按钮块：`471037237`（`f2`=标题，`f4`=按钮 wrapper，`f8/f11`=追踪）

## 已知边界

- 令牌是**产品绑定**的：个人与家庭的令牌不同，不能跨产品搬运。
- 响应改写只能控制**页面长什么样**，不能控制 **Google 服务端是否放行交易**。
  地区未上线或令牌失效时，按钮能显示、能点，但服务端可能报错——这是预期行为，
  不属于脚本故障。
