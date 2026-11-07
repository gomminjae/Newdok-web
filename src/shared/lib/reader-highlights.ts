export type Highlight = { id: string; start: number; end: number; text: string };
export type TextSelection = Omit<Highlight, 'id'>;

export function parseHighlights(value: string): Highlight[] {
  try {
    const items: unknown = JSON.parse(value);
    if (!Array.isArray(items)) return [];
    const valid = items.filter((item): item is Highlight => !!item && typeof item === 'object'
      && typeof item.id === 'string' && typeof item.text === 'string'
      && Number.isSafeInteger(item.start) && Number.isSafeInteger(item.end)
      && item.start >= 0 && item.end > item.start).sort((a, b) => a.start - b.start);
    let previousEnd = -1;
    return valid.filter((item) => {
      if (item.start < previousEnd) return false;
      previousEnd = item.end;
      return true;
    });
  } catch { return []; }
}

function textNodes(document: Document) {
  const walker = document.createTreeWalker(document.body, 4, {
    acceptNode: (node) => node.parentElement?.closest('style,script,noscript,template') ? 2 : 1,
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

export function getTextSelection(document: Document): TextSelection | null {
  const selection = document.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!document.body.contains(range.commonAncestorContainer)) return null;
  let offset = 0;
  let start: number | undefined;
  let end = 0;
  for (const node of textNodes(document)) {
    if (range.intersectsNode(node)) {
      const from = range.startContainer === node ? range.startOffset : 0;
      const to = range.endContainer === node ? range.endOffset : node.length;
      if (to > from) { start ??= offset + from; end = offset + to; }
    }
    offset += node.length;
  }
  if (start === undefined || end <= start || !selection.toString().trim()) return null;
  return { start, end, text: textNodes(document).map((node) => node.data).join('').slice(start, end) };
}

export function applyHighlights(document: Document, highlights: readonly Highlight[]) {
  document.querySelectorAll('mark[data-newdok-highlight]').forEach((mark) => {
    mark.replaceWith(...mark.childNodes);
  });
  document.body.normalize();
  const nodes = textNodes(document);
  const text = nodes.map((node) => node.data).join('');
  let offset = 0;
  for (const node of nodes) {
    const nodeStart = offset;
    offset += node.length;
    // Backwards insertion preserves offsets within each original text node.
    const portions = highlights.filter((item) => item.start < offset && item.end > nodeStart && text.slice(item.start, item.end) === item.text)
      .map((item) => ({ ...item, from: Math.max(0, item.start - nodeStart), to: Math.min(node.length, item.end - nodeStart) }))
      .sort((a, b) => b.from - a.from);
    for (const portion of portions) {
      const range = document.createRange();
      range.setStart(node, portion.from);
      range.setEnd(node, portion.to);
      const mark = document.createElement('mark');
      mark.dataset.newdokHighlight = portion.id;
      mark.style.backgroundColor = '#fff2a8';
      mark.style.color = 'inherit';
      range.surroundContents(mark);
    }
  }
}
