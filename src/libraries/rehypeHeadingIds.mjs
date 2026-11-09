const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const EXPLICIT_ID_PATTERN = /^\/\*\s*#([a-z0-9]+(?:-[a-z0-9]+)*)\s*\*\/$/;
const COMMENT_PATTERN = /^\/\*[\s\S]*\*\/$/;
const SLUG_REMOVE_PATTERN = /[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu;

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
 * 見出しテキストから GitHub 互換規則で id を作る。空になる場合は空文字を返す。
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return text.trim().toLowerCase().replace(SLUG_REMOVE_PATTERN, '').replace(/ /g, '-');
}

/**
 * MDX コメントから明示 id を取り出し、該当ノードを除去する。
 * 形式不正のコメントは警告のみで残す。
 * @param {HastElement} heading
 * @returns {string | undefined}
 */
function extractExplicitId(heading) {
  const children = heading.children;
  const index = children.findIndex(
    (child) => child.type === 'mdxTextExpression' && EXPLICIT_ID_PATTERN.test(child.value ?? ''),
  );
  if (index === -1) {
    const invalid = children.find(
      (child) => child.type === 'mdxTextExpression' && COMMENT_PATTERN.test(child.value ?? ''),
    );
    if (invalid) {
      console.warn(
        `[rehypeHeadingIds] 形式不正の見出し id 指定を無視しました: "${textOf(heading).trim()}" ${invalid.value}`,
      );
    }
    return undefined;
  }
  const id = /** @type {RegExpExecArray} */ (EXPLICIT_ID_PATTERN.exec(children[index].value ?? ''))[1];
  children.splice(index, 1);
  const previous = children[index - 1];
  if (previous?.type === 'text') {
    previous.value = (previous.value ?? '').trimEnd();
    if (previous.value === '') children.splice(index - 1, 1);
  }
  return id;
}

/**
 * 既出の id と衝突しない id を返し、使用済みとして記録する。
 * @param {string} base
 * @param {Set<string>} used
 * @returns {string}
 */
function uniqueId(base, used) {
  let candidate = base;
  for (let n = 1; used.has(candidate); n++) candidate = `${base}-${n}`;
  used.add(candidate);
  return candidate;
}

/**
 * h1〜h6 に id を付与する。MDX コメント `{/* #english-id *\/}` で明示指定でき、
 * 未指定の場合は見出しテキストから自動生成する。重複は -1, -2… で回避する。
 * @returns {(tree: HastNode) => void}
 */
export default function rehypeHeadingIds() {
  return (tree) => {
    const used = new Set();
    walkElements(tree, (node) => {
      if (!HEADING_TAGS.has(node.tagName)) return;
      node.properties ??= {};
      const existing = node.properties.id;
      if (typeof existing === 'string' && existing !== '') {
        used.add(existing);
        return;
      }
      const base = extractExplicitId(node) ?? slugify(textOf(node));
      if (base === '') return;
      node.properties.id = uniqueId(base, used);
    });
  };
}
