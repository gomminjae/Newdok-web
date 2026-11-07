'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { Button, Dialog, Icon } from '@/shared/ui';
import { NewsletterContent } from '@/shared/ui/NewsletterContent';
import { parseHighlights, type Highlight, type TextSelection } from '@/shared/lib/reader-highlights';

const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  window.addEventListener('reader-change', callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener('reader-change', callback); };
};
function read(key: string, fallback: string) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } }

export function ArticleReader({ html, title, articleId, userId, archive }: { html: string; title: string; articleId: number; userId?: number; archive: boolean }) {
  const key = userId ? `newdok.reader.highlights.${userId}.${articleId}` : '';
  const stored = useSyncExternalStore(subscribe, () => key ? read(key, '[]') : '[]', () => '[]');
  const font = useSyncExternalStore(subscribe, () => read('newdok.reader.font', '100'), () => '100');
  const scale = Math.min(150, Math.max(80, Number(font) || 100));
  const highlights = useMemo(() => parseHighlights(stored), [stored]);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState('');
  const onSelection = useCallback((next: TextSelection | null) => setSelection(next), []);
  const canHighlight = !!userId && !archive;

  function write(storageKey: string, value: string) {
    setError('');
    try { localStorage.setItem(storageKey, value); window.dispatchEvent(new Event('reader-change')); return true; }
    catch { setError('이 브라우저에 저장하지 못했어요. 저장 공간과 브라우저 설정을 확인해주세요.'); return false; }
  }
  function save(items: Highlight[]) { if (key) return write(key, JSON.stringify(items)); return false; }
  function addHighlight() {
    if (!selection || !canHighlight) return;
    // Reject overlapping ranges so the same text node is never wrapped twice.
    const overlap = highlights.filter((item) => item.start < selection.end && item.end > selection.start);
    if (overlap.length) { setError('이미 표시한 부분과 겹쳐요. 기존 하이라이트를 삭제한 후 다시 선택해주세요.'); return; }
    if (save([...highlights, { ...selection, id: crypto.randomUUID() }])) setSelection(null);
  }

  return <>
    <div className="flex flex-wrap items-center gap-2 border-b border-line-neutral px-4 py-3" aria-label="읽기 도구">
      <Icon src="/images/Line Text.svg" size={20} />
      <Button variant="ghost-neutral" size="compact" aria-label="글자 크기 줄이기" disabled={scale <= 80} onClick={() => write('newdok.reader.font', String(scale - 10))}>가−</Button>
      <output aria-label="글자 크기" className="text-sm">{scale}%</output>
      <Button variant="ghost-neutral" size="compact" aria-label="글자 크기 키우기" disabled={scale >= 150} onClick={() => write('newdok.reader.font', String(scale + 10))}>가+</Button>
      {canHighlight && <><Button variant="outline" size="compact" disabled={!selection} onClick={addHighlight}>선택한 문장 저장</Button><Button variant="ghost" size="compact" onClick={() => setShowList(true)}>하이라이트 {highlights.length}</Button></>}
    </div>
    {canHighlight && <p className="px-4 py-3 text-xs leading-5 text-caption-neutral">본문을 선택해 하이라이트를 저장하세요. 이 브라우저에만 저장되며 앱과 동기화되지 않아요.</p>}
    {error && <p role="alert" className="px-4 py-3 text-sm text-error">{error}</p>}
    <NewsletterContent html={html} title={title} fontScale={scale / 100} highlights={canHighlight ? highlights : undefined} onSelection={canHighlight ? onSelection : undefined} />
    {showList && <Dialog title="하이라이트" onClose={() => setShowList(false)}>
      <p className="mb-5 text-xs text-caption-neutral">이 브라우저에 저장된 문장이에요. 앱과 동기화되지 않아요.</p>
      {highlights.length ? <ul className="space-y-4">{highlights.map((item) => <li key={item.id} className="border-b border-line-neutral pb-4"><p className="whitespace-pre-wrap break-words text-sm leading-7">{item.text}</p><Button variant="ghost-neutral" size="compact" onClick={() => save(highlights.filter((highlight) => highlight.id !== item.id))} aria-label={`${item.text.slice(0, 20)} 하이라이트 삭제`}>삭제</Button></li>)}</ul> : <p>저장한 하이라이트가 없어요.</p>}
      {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
    </Dialog>}
  </>;
}
