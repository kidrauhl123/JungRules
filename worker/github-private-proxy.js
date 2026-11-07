/**
 * ============================================================================
 * GitHub 私有库代理 Worker（Cloudflare Workers）
 * ============================================================================
 *
 * 作用：让你的私有 GitHub 仓库可以通过一个自己的域名「一键更新」订阅，
 *       而别人即使拿到链接、没有你的密钥也用不了。
 *
 * 原理：
 *   QX / Surge / 小火箭 / Clash 拉订阅只能发匿名 GET，无法携带 GitHub token。
 *   本 Worker 部署在 Cloudflare，持有你的 GitHub token，替你向上游
 *   raw.githubusercontent.com 发起带 Authorization header 的请求，再把
 *   内容原样返回给客户端。
 *
 * 访问格式：
 *   https://<你的worker域名>/<PROXY_SECRET>/<仓库内路径>
 *   例：https://my-proxy.abc.workers.dev/k7Xp2q/quantumult/JungRules.conf
 *
 * 环境变量（在 Cloudflare 后台设置，切勿写进代码）：
 *   GITHUB_TOKEN   —— GitHub 细粒度 PAT，仅授予 Contents: Read（只读该仓库）
 *   PROXY_SECRET   —— 你自己定的路径密钥（相当于访问口令）
 *   REPO_OWNER     —— 仓库所有者，如 kidrauhl123
 *   REPO_NAME      —— 仓库名，如 JungRules
 *   BRANCH         —— 分支名，默认 main
 *
 * 说明：
 *   - raw.githubusercontent.com 接受 Authorization: Bearer <token>，且无
 *     api.github.com 的 1MB 单文件限制，适合大规则文件（几十 MB 也没问题）。
 *   - 只做只读转发，不缓存敏感内容到任何地方；可选 5 分钟边缘缓存减轻上游压力。
 *   - 路径密钥错误统一返回 404（不泄露仓库是否存在）。
 * ============================================================================
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 只允许 GET / HEAD
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // 解析路径：/<PROXY_SECRET>/<repo path...>
    const parts = url.pathname.split('/').filter(Boolean);
    const secret = parts.shift();
    if (!env.PROXY_SECRET || secret !== env.PROXY_SECRET) {
      // 密钥不对：统一 404，不暴露仓库信息
      return new Response('Not Found', { status: 404 });
    }
    const repoPath = parts.join('/');
    if (!repoPath) {
      return new Response('Not Found', { status: 404 });
    }

    const owner = env.REPO_OWNER;
    const repo = env.REPO_NAME;
    const branch = env.BRANCH || 'main';
    if (!owner || !repo || !env.GITHUB_TOKEN) {
      return new Response('Proxy not configured', { status: 500 });
    }

    const upstream = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${repoPath}`;

    let ghResp;
    try {
      ghResp = await fetch(upstream, {
        method: request.method,
        headers: {
          'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
          'User-Agent': 'github-private-proxy-worker',
          'Accept': '*/*'
        },
        // 跟随重定向（raw 一般不会重定向，稳妥起见）
        redirect: 'follow'
      });
    } catch (e) {
      return new Response('Upstream fetch failed: ' + e.message, { status: 502 });
    }

    if (!ghResp.ok) {
      // 透传状态码（404/401 等），便于客户端判断
      return new Response(`Upstream ${ghResp.status}`, { status: ghResp.status });
    }

    // 原样返回内容，保留 content-type
    const headers = new Headers();
    const ct = ghResp.headers.get('content-type');
    if (ct) headers.set('content-type', ct);
    headers.set('cache-control', 'public, max-age=300');
    headers.set('x-proxied-by', 'github-private-proxy');

    return new Response(request.method === 'HEAD' ? null : ghResp.body, {
      status: 200,
      headers
    });
  }
};
