# GitHub 私有库代理（Cloudflare Worker）

让你的**私有** GitHub 仓库能像公开库一样被 QX / Surge / 小火箭 / Clash **一键更新**，
但别人拿不到链接内容（没有你的密钥用不了）。

## 为什么需要它

| 事实 | 说明 |
|---|---|
| 私有库的 `raw.githubusercontent.com` 匿名访问 | **404**（QX/Surge 拉订阅只能匿名 GET，带不了 token） |
| 把 token 塞进 URL（`https://token@raw...`） | **无效**，raw 域名忽略 URL 里的凭据（实测） |
| `?token=` 临时签名 | 30 分钟就过期，不能用于长期订阅 |
| `raw.githubusercontent.com` + `Authorization: Bearer` header | ✅ **有效**，且无 api 端点 1MB 限制 |

结论：需要一台**能带 header 的中间人**——就是本 Worker。

## 架构

```
QX/Surge/小火箭/Clash
        │  匿名 GET https://<worker域名>/<密钥>/<仓库路径>
        ▼
   Cloudflare Worker（持有 GITHUB_TOKEN）
        │  GET raw.githubusercontent.com/... + Authorization: Bearer <token>
        ▼
   GitHub 私有库
```

## 部署步骤（约 5 分钟）

### 1. 建一个 GitHub 细粒度 Token

GitHub → Settings → Developer settings → **Personal access tokens → Fine-grained tokens** → Generate new token：

- **Repository access**：Only select repositories → 只勾 `JungRules`
- **Permissions → Repository permissions → Contents**：**Read-only**
- 其余全部 No access
- 生成后复制 `github_pat_xxx`（只显示一次）

> 这个 token 只能读你这一个仓库，即使泄露损失也极小，且可随时撤销。

### 2. 部署 Worker

**方式 A：网页控制台（最简单，不用装任何东西）**

1. 打开 https://dash.cloudflare.com → Workers & Pages → Create → Worker
2. 把 `worker/github-private-proxy.js` 的全部内容粘进去，Deploy
3. 进入该 Worker → Settings → **Variables and Secrets**，添加：

   | 名称 | 类型 | 值 |
   |---|---|---|
   | `GITHUB_TOKEN` | Secret | `github_pat_xxx` |
   | `PROXY_SECRET` | Secret | 自己定一串随机字符，如 `k7Xp2qLm9Rt` |
   | `REPO_OWNER` | Text | `kidrauhl123` |
   | `REPO_NAME` | Text | `JungRules` |
   | `BRANCH` | Text | `main` |

4. 记下你的 Worker 域名，如 `jung-proxy.kidrauhl.workers.dev`

**方式 B：命令行 wrangler**

```bash
npm i -g wrangler
wrangler login
cd worker
wrangler deploy
# 然后按 README 提示用 wrangler secret put 设置各变量
```

### 3. 验证

浏览器打开：
```
https://<你的worker域名>/<PROXY_SECRET>/YT_TRIAL.md
```
能显示文档内容 = 成功；`<PROXY_SECRET>` 打错应返回 404。

### 4. 把仓库转私有

GitHub 仓库 → Settings → General → 最下方 Danger Zone → **Change visibility → Private**。

### 5. 把所有订阅链接换成 Worker 地址

用仓库里的 `worker/rewrite-links.py` 批量替换（见下），或者手动把所有

```
https://raw.githubusercontent.com/kidrauhl123/JungRules/main/
```

替换成

```
https://<你的worker域名>/<PROXY_SECRET>/
```

替换后，客户端里的订阅链接、脚本路径全部走 Worker，一键更新照常工作。

## 批量替换工具

```bash
cd /Users/jung/GitHub/JungRules
python3 worker/rewrite-links.py \
  --worker-host jung-proxy.kidrauhl.workers.dev \
  --secret k7Xp2qLm9Rt \
  --dry-run          # 先看会改哪些，确认后去掉 --dry-run 真正执行
```

它会扫描仓库里所有 `raw.githubusercontent.com/kidrauhl123/JungRules/...` 引用，
统一替换成 Worker 地址。

## 注意事项

- **`PROXY_SECRET` 就是你的访问口令**，尽量长且随机。泄露了别人能消耗你的
  Worker 请求额度（免费版每天 10 万次，个人用绰绰有余）。
- Worker 只做**只读转发**，不存储你的仓库内容。
- 上游返回什么状态码就透传什么（404/401 便于排查）。
- 可选：给 Worker 绑定自定义域名，链接更好记。
- 更新流程不变：改仓库 → push → 客户端「更新订阅」即可（Worker 会实时取最新）。

## 文件

- `worker/github-private-proxy.js` —— Worker 源码（复制到 Cloudflare 即可）
- `worker/rewrite-links.py` —— 批量替换仓库内链接的工具
- `worker/wrangler.toml` —— 命令行部署配置（可选）
