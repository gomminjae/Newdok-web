'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { applyHighlights, getTextSelection, type Highlight, type TextSelection } from '@/shared/lib/reader-highlights';
import { observeSelectionChanges } from '@/shared/lib/selection-observer';
import { colors } from '@/design-system/tokens';

const CONTENT_STYLES = `
  html, body { margin: 0 !important; padding: 0 !important; height: auto !important; min-height: 0 !important; width: 100% !important; max-width: 100% !important; }
  body { display: flow-root !important; overflow-wrap: anywhere; font-family: sans-serif; line-height: 1.7; }
  *, *::before, *::after { box-sizing: border-box; }
  div, section, article, main, table, td, th, figure { max-width: 100% !important; }
  [style*="min-width" i] { min-width: 0 !important; }
  img, video, svg { max-width: 100% !important; height: auto !important; }
  table { width: 100% !important; table-layout: fixed; }
  td, th, a { overflow-wrap: anywhere; }
  pre { white-space: pre-wrap; overflow-wrap: anywhere; }
  iframe, embed, object { max-width: 100% !important; }
  a { color: ${colors.primaryNormal}; }
  @media (max-width: 480px) { td, th { padding-left: 4px !important; padding-right: 4px !important; } }
`;

/** 외부 뉴스레터의 CSS를 앱과 격리하고, 스크립트 실행 없이 본문 높이에 맞춘다. */
export function NewsletterContent({ html, title, fontScale, highlights, onSelection }: {
  html: string;
  title: string;
  fontScale?: number;
  highlights?: readonly Highlight[];
  onSelection?: (selection: TextSelection | null) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(640);
  const fontSizes = useRef(new WeakMap<HTMLElement, { font: number; line: number }>());
  const selectionCleanup = useRef<(() => void) | null>(null);

  const applyReaderOptions = useCallback(() => {
    const document = frame.current?.contentDocument;
    if (!document?.body) return;
    if (fontScale !== undefined) {
      const elements = [document.body, ...Array.from(document.body.querySelectorAll<HTMLElement>('*'))];
      // Measure all inherited sizes before changing a parent font.
      for (const element of elements) {
        if (element.matches('style,script,mark[data-newdok-highlight]') || fontSizes.current.has(element)) continue;
        const style = document.defaultView?.getComputedStyle(element);
        if (style) fontSizes.current.set(element, { font: parseFloat(style.fontSize), line: parseFloat(style.lineHeight) });
      }
      for (const element of elements) {
        const original = fontSizes.current.get(element);
        if (!original || !Number.isFinite(original.font)) continue;
        element.style.setProperty('font-size', `${original.font * fontScale}px`, 'important');
        if (Number.isFinite(original.line)) element.style.setProperty('line-height', `${original.line * fontScale}px`, 'important');
      }
    }
    applyHighlights(document, highlights ?? []);
  }, [fontScale, highlights]);

  const resizeContent = useCallback(() => {
    observer.current?.disconnect();
    const body = frame.current?.contentDocument?.body;
    if (!body) return;
    const measure = () => setHeight(Math.max(200, Math.ceil(body.getBoundingClientRect().height) + 24));
    measure();
    observer.current = new ResizeObserver(measure);
    observer.current.observe(body);
  }, []);

  useEffect(() => { applyReaderOptions(); }, [applyReaderOptions]);
  useEffect(() => () => { observer.current?.disconnect(); selectionCleanup.current?.(); }, []);

  const handleLoad = () => {
    fontSizes.current = new WeakMap();
    selectionCleanup.current?.();
    applyReaderOptions();
    resizeContent();
    const document = frame.current?.contentDocument;
    if (!document || !onSelection) return;
    selectionCleanup.current = observeSelectionChanges(document, () => onSelection(getTextSelection(document)));
  };

  return (
    <iframe
      ref={frame}
      title={`${title} 본문`}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer"
      srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><base target="_blank"></head><body>${html}<style>${CONTENT_STYLES}</style></body></html>`}
      onLoad={handleLoad}
      style={{ height }}
      className="block w-full border-0 bg-white"
    />
  );
}
