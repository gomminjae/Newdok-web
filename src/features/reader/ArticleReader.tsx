'use client';

import { useCallback, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AppImage, Button, Dialog, Icon } from '@/shared/ui';
import { NewsletterContent } from '@/shared/ui/NewsletterContent';
import { parseHighlights, type Highlight, type TextSelection } from '@/shared/lib/reader-highlights';

const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  window.addEventListener('reader-change', callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener('reader-change', callback); };
};
function read(key: string, fallback: string) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } }

export function ArticleReader({ html, title, articleId, userId, archive, renderHeader, children }: { html: string; title: string; articleId: number; userId?: number; archive: boolean; renderHeader: (controls: ReactNode) => ReactNode; children: ReactNode }) {
  const key = userId ? `newdok.reader.highlights.${userId}.${articleId}` : '';
  const stored = useSyncExternalStore(subscribe, () => key ? read(key, '[]') : '[]', () => '[]');
  const font = useSyncExternalStore(subscribe, () => read('newdok.reader.font', '125'), () => '125');
  const fontSize = Math.min(25, Math.max(15, Math.round((Number(font) || 125) * 0.16)));
  const highlights = useMemo(() => parseHighlights(stored), [stored]);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [showList, setShowList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
    {renderHeader(<>
      {canHighlight && <Button variant="ghost-neutral" size="icon" aria-label="하이라이트 목록" onClick={() => setShowList(true)}><Icon name="highlight" size={28} /></Button>}
      <Button variant="ghost-neutral" size="icon" aria-label="글자 크기 설정" onClick={() => setShowSettings(true)}><Icon name="font" size={28} /></Button>
    </>)}
    {children}
    {showSettings && <Dialog title="글자 크기" onClose={() => setShowSettings(false)}>
      <div className="py-4 text-center"><output aria-label="글자 크기" className="text-[32px] font-bold">{fontSize}<span className="ml-0.5 text-xl">pt</span></output></div>
      <div className="flex items-center gap-3"><Button variant="outline" size="icon-control" radius="md" aria-label="글자 크기 줄이기" disabled={fontSize <= 15} onClick={() => write('newdok.reader.font', String((fontSize - 1) / 0.16))}><Icon name="Line Minus" size={16} /></Button><input type="range" min={15} max={25} step={1} value={fontSize} aria-label="글자 크기 조절" onChange={(event) => write('newdok.reader.font', String(Number(event.target.value) / 0.16))} className="min-w-0 flex-1 accent-primary" /><Button variant="outline" size="icon-control" radius="md" aria-label="글자 크기 키우기" disabled={fontSize >= 25} onClick={() => write('newdok.reader.font', String((fontSize + 1) / 0.16))}><Icon name="Line Plus" size={16} /></Button></div>
      <div className="mx-12 mt-1 flex justify-between text-xs text-caption-assistive"><span>15pt</span><span>25pt</span></div>
    </Dialog>}
    {canHighlight && selection && <div className="fixed inset-x-5 bottom-[calc(20px+env(safe-area-inset-bottom))] z-20 mx-auto max-w-[400px]"><Button fullWidth onClick={addHighlight}><Icon name="pen" size={20} />선택한 문장 저장</Button></div>}
    {error && <p role="alert" className="px-4 py-3 text-sm text-error">{error}</p>}
    <section aria-label="아티클 본문" className="min-w-0 px-1.5 pb-10"><NewsletterContent html={html} title={title} fontScale={fontSize / 16} highlights={canHighlight ? highlights : undefined} onSelection={canHighlight ? onSelection : undefined} /></section>
    {showList && <Dialog title="하이라이트" onClose={() => setShowList(false)}>
      <p className="mb-5 text-xs text-caption-neutral">이 브라우저에 저장된 문장이에요. 앱과 동기화되지 않아요.</p>
      {highlights.length ? <ul className="space-y-4">{highlights.map((item) => <li key={item.id} className="border-b border-line-neutral pb-4"><p className="whitespace-pre-wrap break-words text-sm leading-7">{item.text}</p><Button variant="ghost-neutral" size="compact" onClick={() => save(highlights.filter((highlight) => highlight.id !== item.id))} aria-label={`${item.text.slice(0, 20)} 하이라이트 삭제`}><Icon name="trashbin" size={28} /></Button></li>)}</ul> : <div className="text-center"><AppImage name="nohighlight" alt="" width={260} height={260} className="mx-auto h-[260px] w-[260px] max-w-full object-contain" /><p className="mt-6 text-base font-bold">저장한 하이라이트가 없어요.</p></div>}
      {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
    </Dialog>}
  </>;
}
