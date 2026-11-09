const TOC_LABEL = '目次';
const HEADING_LEVELS = { h1: 1, h2: 2, h3: 3 };
const MIN_ENTRIES = 2;

/**
 * @typedef {{ type: string, value?: string, children?: HastNode[] }} HastNode
 * @typedef {HastNode & { tagName: string, properties?: Record<string, unknown>, children: HastNode[] }} HastElement
 */

/**
 * 木を文書順に走査し、要素ノードごとに callback を呼ぶ。
 * @param {HastNode} node
 * @param {(element: HastElement) => void} callback
 */
function walkElements(node, callback) {
  if (node.type === 'element') callback(/** @type {HastElement} */ (node));
  for (const child of node.children ?? []) walkElements(child, callback);
}

/**
 * 子孫の text ノードの値を連結する。
 * @param {HastNode} node
 * @returns {string}
 */
function textOf(node) {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

/**
 * id を持つ h1〜h3 を文書順に収集する。
 * @param {HastNode} tree
 * @returns {{ level: number, id: string, text: string }[]}
 */
function collectHeadings(tree) {
  const entries = [];
  walkElements(tree, (node) => {
    const level = HEADING_LEVELS[node.tagName];
    const id = node.properties?.id;
    if (level && typeof id === 'string' && id !== '') {
      entries.push({ level, id, text: textOf(node) });
    }
  });
  return entries;
}

/**
 * 見出しの相対レベルからスタック方式で入れ子構造を組み立てる。
 * @param {{ level: number, id: string, text: string }[]} entries
 * @returns {{ level: number, id: string, text: string, children: any[] }[]}
 */
function buildTree(entries) {
  const roots = [];
  const stack = [];
  for (const entry of entries) {
    const item = { ...entry, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      roots.push(item);
    } else {
      stack[stack.length - 1].children.push(item);
    }
    stack.push(item);
  }
  return roots;
}

/**
 * @param {{ id: string, text: string, children: any[] }[]} items
 * @returns {HastElement}
 */
function toList(items) {
  return {
    type: 'element',
    tagName: 'ol',
    properties: {},
    children: items.map((item) => ({
      type: 'element',
      tagName: 'li',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'a',
          properties: { href: `#${item.id}` },
          children: [{ type: 'text', value: item.text }],
        },
        ...(item.children.length > 0 ? [toList(item.children)] : []),
      ],
    })),
  };
}

/**
 * @param {HastElement} list
 * @returns {HastElement}
 */
function toNav(list) {
  return {
    type: 'element',
    tagName: 'nav',
    properties: { ariaLabel: TOC_LABEL, className: ['toc'] },
    children: [
      {
        type: 'element',
        tagName: 'p',
        properties: { className: ['toc-title'] },
        children: [{ type: 'text', value: TOC_LABEL }],
      },
      list,
    ],
  };
}

/**
 * rehypeHeadingIds の後に置き、h1〜h3 の目次 nav を本文先頭に挿入する。
 * @returns {(tree: HastNode) => void}
 */
export default function rehypeToc() {
  return (tree) => {
    const entries = collectHeadings(tree);
    if (entries.length < MIN_ENTRIES) return;
    tree.children.unshift(toNav(toList(buildTree(entries))));
  };
}
