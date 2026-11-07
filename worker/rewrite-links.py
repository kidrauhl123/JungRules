#!/usr/bin/env python3
"""
把仓库里所有 raw.githubusercontent.com/<owner>/<repo>/<branch>/... 链接
批量替换成 Cloudflare Worker 代理地址 https://<worker-host>/<secret>/...

用法:
  python3 worker/rewrite-links.py --worker-host jung-proxy.kidrauhl.workers.dev \
                                  --secret k7Xp2qLm9Rt --dry-run
  去掉 --dry-run 真正写入。
"""
import argparse, os, re, sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--worker-host', required=True, help='如 jung-proxy.xxx.workers.dev')
    ap.add_argument('--secret', required=True, help='PROXY_SECRET')
    ap.add_argument('--owner', default='kidrauhl123')
    ap.add_argument('--repo', default='JungRules')
    ap.add_argument('--branch', default='main')
    ap.add_argument('--root', default='.', help='仓库根目录')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--exts', default='.md,.conf,.module,.js,.yaml,.yml,.list,.txt,.tsv,.json',
                    help='要处理的扩展名, 逗号分隔')
    args = ap.parse_args()

    exts = tuple(e.strip() for e in args.exts.split(',') if e.strip())
    old_prefix = f'https://raw.githubusercontent.com/{args.owner}/{args.repo}/{args.branch}/'
    new_prefix = f'https://{args.worker_host}/{args.secret}/'

    # 跳过 .git / worker 自身
    skip_dirs = {'.git', 'node_modules', 'worker', '抓包记录'}

    changed = []
    for dirpath, dirnames, filenames in os.walk(args.root):
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        for fn in filenames:
            if not fn.endswith(exts):
                continue
            p = os.path.join(dirpath, fn)
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    txt = f.read()
            except (UnicodeDecodeError, IsADirectoryError):
                continue
            if old_prefix not in txt:
                continue
            n = txt.count(old_prefix)
            new = txt.replace(old_prefix, new_prefix)
            changed.append((p, n))
            if not args.dry_run:
                with open(p, 'w', encoding='utf-8') as f:
                    f.write(new)

    if not changed:
        print('没有找到需要替换的链接。')
        return
    print(('【预览】' if args.dry_run else '【已写入】') + f' 共 {len(changed)} 个文件：')
    for p, n in changed:
        print(f'  {p}  ({n} 处)')
    if args.dry_run:
        print('\n这是预览，未改动任何文件。确认无误后去掉 --dry-run 再跑一次。')

if __name__ == '__main__':
    main()
