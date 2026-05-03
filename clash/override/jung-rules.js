// JungRules Clash Verge / Clash Verge Rev override script
// Raw URL: https://raw.githubusercontent.com/kidrauhl123/JungRules/main/clash/override/jung-rules.js
// 用法：在 Clash Verge Rev 的“订阅 / Profiles”里给你的节点订阅添加“覆写 / Script / Parser”。
// 作用：保留原节点订阅，追加 JungRules 的 rule-providers 和策略组，并默认覆盖原 rules。

const JUNG_RULE_BASE = 'https://raw.githubusercontent.com/kidrauhl123/JungRules/main/clash/by-policy';

// 默认覆盖原订阅里的 rules，只保留 JungRules 规则。
// 如果想改成“追加在原规则前面”，把这里改为 true。
const KEEP_ORIGINAL_RULES = false;

const PROVIDERS = {
  jung_reject: ['reject', 'REJECT'],
  jung_us: ['us', '美国'],
  jung_spotify: ['spotify', 'Spotify'],
  jung_bilibili: ['bilibili', '哔哩哔哩'],
  jung_apple: ['apple', 'Apple'],
  jung_media: ['media', '国际媒体'],
  jung_proxy: ['proxy', 'Proxy'],
  jung_direct: ['direct', 'DIRECT'],
};

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function groupNames(config) {
  return new Set(ensureArray(config['proxy-groups']).map((group) => group && group.name).filter(Boolean));
}

function addSelectGroup(config, name, candidates) {
  config['proxy-groups'] = ensureArray(config['proxy-groups']);
  const names = groupNames(config);
  if (names.has(name)) return;

  const proxies = ensureArray(config.proxies).map((proxy) => proxy && proxy.name).filter(Boolean);
  const existingGroups = Array.from(names);
  const all = [...new Set([...candidates.filter((item) => names.has(item) || item === 'DIRECT' || item === 'REJECT'), ...existingGroups, ...proxies])];

  config['proxy-groups'].push({
    name,
    type: 'select',
    proxies: all.length ? all : ['DIRECT'],
  });
}

function provider(file) {
  return {
    type: 'http',
    behavior: 'classical',
    format: 'yaml',
    path: `./ruleset/jung_${file}.yaml`,
    url: `${JUNG_RULE_BASE}/${file}.yaml`,
    interval: 86400,
  };
}

function removeOldJungRules(rules) {
  return ensureArray(rules).filter((rule) => !/^RULE-SET,jung_/.test(String(rule)));
}

function main(config) {
  config = config || {};
  config['rule-providers'] = config['rule-providers'] || {};

  for (const [name, [file]] of Object.entries(PROVIDERS)) {
    config['rule-providers'][name] = provider(file);
  }

  // 如果原订阅没有这些策略组，就自动补上；如果已经有同名策略组，则不覆盖。
  addSelectGroup(config, 'Proxy', ['DIRECT']);
  addSelectGroup(config, '美国', ['Proxy', 'DIRECT']);
  addSelectGroup(config, 'Spotify', ['Proxy', 'DIRECT']);
  addSelectGroup(config, '哔哩哔哩', ['DIRECT', 'Proxy']);
  addSelectGroup(config, 'Apple', ['DIRECT', 'Proxy']);
  addSelectGroup(config, '国际媒体', ['Proxy', 'DIRECT']);
  addSelectGroup(config, '兜底分流', ['Proxy', 'DIRECT']);

  const jungRules = [
    'RULE-SET,jung_reject,REJECT',
    'RULE-SET,jung_us,美国',
    'RULE-SET,jung_spotify,Spotify',
    'RULE-SET,jung_bilibili,哔哩哔哩',
    'RULE-SET,jung_apple,Apple',
    'RULE-SET,jung_media,国际媒体',
    'RULE-SET,jung_proxy,Proxy',
    'RULE-SET,jung_direct,DIRECT',
  ];

  if (KEEP_ORIGINAL_RULES) {
    const rules = removeOldJungRules(config.rules);
    const matchRules = rules.filter((rule) => /^MATCH,/.test(String(rule)));
    const normalRules = rules.filter((rule) => !/^MATCH,/.test(String(rule)));
    config.rules = [...jungRules, ...normalRules, ...matchRules];
  } else {
    config.rules = [...jungRules];
  }

  if (!config.rules.some((rule) => /^MATCH,/.test(String(rule)))) {
    config.rules.push('MATCH,兜底分流');
  }

  return config;
}
