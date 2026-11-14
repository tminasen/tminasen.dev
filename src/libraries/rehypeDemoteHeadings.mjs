/** 1段下げた後の tagName。h6 はこれ以上下げられないため含めない */
const DEMOTED_TAG = new Map([
  ['h1', 'h2'],
  ['h2', 'h3'],
  ['h3', 'h4'],
  ['h4', 'h5'],
  ['h5', 'h6'],
]);

/**
 * @typedef {{ type: string, children?: HastNode[] }} HastNode
 * @typedef {HastNode & { tagName: string }} HastElement
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
 * 本文に h1 がある場合だけ、全見出しを1段下げる（h1→h2 … h5→h6。h6 は h6 のまま）。
 * ページ側で h1 を別に持つため、本文の `#` を h2 以下にして h1 の乱立を避ける。
 * h1 がなければ何もしないので、2回適用しても結果は変わらない。
 * @returns {(tree: HastNode) => void}
 */
export default function rehypeDemoteHeadings() {
  return (tree) => {
    let hasH1 = false;
    walkElements(tree, (node) => {
      if (node.tagName === 'h1') hasH1 = true;
    });
    if (!hasH1) return;
    walkElements(tree, (node) => {
      const demoted = DEMOTED_TAG.get(node.tagName);
      if (demoted) node.tagName = demoted;
    });
  };
}
