'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { AppImage, Button, ButtonLink, Icon } from '@/shared/ui';

const PAGES = [
  { title: '너무 많은 뉴스레터 브랜드', description: '일일이 찾아볼 필요 없이\n내게 필요한 뉴스레터만 쏙쏙', image: 'letter' },
  { title: '복잡하게 쌓여가는 메일함은 안녕!', description: '다른 메일과 섞이지 않고\n오늘 받은 뉴스레터만 한눈에', image: 'calendar' },
  { title: '번거로운 구독 관리도', description: '뉴독에서는 버튼 하나로\n쉽고 빠르게!', image: 'post' },
] as const;

export default function IntroPage() {
  const [page, setPage] = useState(0);
  const touchStart = useRef<number | null>(null);
  const current = PAGES[page];
  function move(delta: number) { setPage((previous) => Math.min(PAGES.length - 1, Math.max(0, previous + delta))); }

  return <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-bg px-6 pb-14">
    <header className="flex h-11 items-center justify-end"><ButtonLink href="/" variant="ghost-neutral" size="icon" aria-label="소개 닫기"><Icon name="Line Close" /></ButtonLink></header>
    <section aria-label="뉴독 소개" aria-roledescription="캐러셀" tabIndex={0} className="flex flex-1 flex-col items-center pt-5 outline-primary md:pt-12"
      onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientX; if (touchStart.current !== null && end !== undefined && Math.abs(end - touchStart.current) > 40) move(end < touchStart.current ? 1 : -1); touchStart.current = null; }}>
      <div aria-live="polite" className="text-center"><p className="text-sm font-medium text-caption-alternative">{current.title}</p><h1 className="mt-3 whitespace-pre-line text-[22px] font-bold leading-8">{current.description}</h1></div>
      <div className="mt-6 flex gap-2" aria-label="소개 페이지">{PAGES.map((item, index) => <button key={item.image} type="button" aria-label={`소개 ${index + 1}페이지`} aria-current={page === index ? 'step' : undefined} onClick={() => setPage(index)} className="flex h-6 items-center"><span className={`h-1.5 w-8 rounded-full ${page === index ? 'bg-primary' : 'bg-tint-100'}`} /></button>)}</div>
      <AppImage key={current.image} name={current.image} width={320} height={320} loading="eager" className="h-auto w-[320px] max-w-full object-contain" />
      <div className="mb-5 flex w-full justify-between"><Button variant="ghost-neutral" size="compact" disabled={page === 0} onClick={() => move(-1)} aria-label="이전 소개"><Icon name="Back" /></Button><Button variant="ghost-neutral" size="compact" disabled={page === PAGES.length - 1} onClick={() => move(1)} aria-label="다음 소개"><Icon name="Line right" /></Button></div>
    </section>
    <ButtonLink href="/login" fullWidth>회원가입</ButtonLink><p className="mt-5 text-center text-sm font-medium text-caption-assistive">이미 계정이 있나요? <Link href="/login" className="text-primary underline underline-offset-2">로그인</Link></p>
  </main>;
}
