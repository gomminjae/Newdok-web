'use client';

import { useState } from 'react';
import { AppImage, Button, ButtonLink, Checkbox, Chip, Dialog, Icon, Input, SegmentPicker, Select, SubscriptionBadge, Tabs, Toast, colors, fontSizes, iconAssets, type IconName } from './index';

const COLOR_GROUPS = [
  ['브랜드', 'primary'], ['배경', 'bg'], ['텍스트', 'caption'], ['테두리', 'line'], ['회색', 'gray'], ['오류', 'error'], ['하이라이트', 'highlight'],
] as const;

export function DesignSystemPreview() {
  const [segment, setSegment] = useState('active');
  const [tab, setTab] = useState('recommend');
  const [selected, setSelected] = useState(true);
  const [checked, setChecked] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [toast, setToast] = useState(false);

  return <main className="mx-auto max-w-6xl space-y-10 px-6 py-8 pb-28">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary">Newdok · Design System</p><h1 className="mt-2 text-2xl font-bold">앱과 웹의 공통 디자인 기준</h1><p className="mt-3 text-sm leading-6 text-caption-neutral">앱의 색상·간격·모서리·글자 크기와 원본 에셋을 사용합니다.<br />아래 컴포넌트는 실제 서비스에서 사용하는 구현입니다.</p></div><ButtonLink href="/home" variant="neutral-outline" size="compact">서비스 보기</ButtonLink></header>

    <section id="segments" className="space-y-4"><h2 className="text-xl font-bold">세그먼트와 탭</h2><div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-line-neutral bg-bg-system p-5"><h3 className="mb-4 text-sm font-bold">내 구독 · 슬라이더</h3><SegmentPicker value={segment} onChange={setSegment} options={[{ value: 'active', label: '구독 중' }, { value: 'paused', label: '구독 중지' }]} className="w-full" /><p className="mt-4 text-xs leading-5 text-caption-neutral">회색 바탕 · 흰색 선택 영역 · 검정 활성 글자<br />높이 40px · 모서리 6px · 전환 250ms</p></div>
      <div className="rounded-xl border border-line-neutral bg-bg p-5"><h3 className="text-sm font-bold">둘러보기 · 밑줄 탭</h3><Tabs id="preview" label="둘러보기 탭 예시" value={tab} onChange={setTab} options={[{ value: 'recommend', label: '추천 뉴스레터' }, { value: 'all', label: '모든 뉴스레터' }]} /><div id={`preview-panel-${tab}`} role="tabpanel" aria-labelledby={`preview-tab-${tab}`} className="mt-4 text-xs leading-5 text-caption-neutral">진한 회색 활성 글자·밑줄 · 회색 비활성 글자<br />밑줄 2px · 전환 300ms</div></div>
    </div></section>

    <section id="colors" className="space-y-5"><h2 className="text-xl font-bold">색상</h2>{COLOR_GROUPS.map(([label, prefix]) => <div key={prefix}><h3 className="mb-3 text-sm font-bold">{label}</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">{Object.entries(colors).filter(([name]) => name.startsWith(prefix)).map(([name, value]) => <div key={name} className="overflow-hidden rounded-lg border border-line-neutral bg-bg"><div className="h-14 border-b border-line-neutral" style={{ background: value }} /><div className="p-3"><p className="break-all text-xs font-medium">{name}</p><p className="mt-1 break-all text-xs text-caption-alternative">{value}</p></div></div>)}</div></div>)}</section>

    <section className="space-y-4"><h2 className="text-xl font-bold">글자 · Spoqa Han Sans Neo</h2><div className="space-y-4 rounded-xl border border-line-neutral p-5">{Object.entries(fontSizes).reverse().map(([name, size]) => <p key={name} style={{ fontSize: size }}><span className="font-bold">오늘 받은 뉴스레터를 한눈에</span><span className="ml-3 text-caption-alternative">{name} · {size}px</span></p>)}</div></section>

    <section className="space-y-4"><h2 className="text-xl font-bold">버튼</h2><p className="text-sm text-caption-neutral">기본 48px · 모서리 4px. 소셜 로그인은 56px · 모서리 16px.</p><div className="flex flex-wrap gap-3"><Button>기본 버튼</Button><Button variant="outline">테두리 버튼</Button><Button variant="neutral-outline">보조 버튼</Button><Button variant="ghost">텍스트 버튼</Button><Button disabled>비활성</Button><Button disabled disabledTone="white">흰 글자 비활성</Button><Button variant="danger">위험 동작</Button></div><div className="grid max-w-lg gap-3"><Button variant="kakao" size="lg" radius="xl"><AppImage name="kakaoBubble" width={16} height={16} />카카오로 계속하기</Button><Button variant="apple" size="lg" radius="xl">Apple로 계속하기</Button></div></section>

    <section className="space-y-4"><h2 className="text-xl font-bold">칩과 상태</h2><div className="flex flex-wrap items-center gap-3"><Chip>경제</Chip><Chip size="md">프로필 관심사</Chip><Chip as="button" active={selected} onClick={() => setSelected((value) => !value)}>필터 선택</Chip><Chip as="button" disabled>비활성 필터</Chip><SubscriptionBadge status="CONFIRMED" /><SubscriptionBadge status="PAUSED" /></div><div className="grid max-w-lg grid-cols-2 gap-3"><Chip as="button" variant="option" active>선택한 관심사</Chip><Chip as="button" variant="option">기본 관심사</Chip></div></section>

    <section className="space-y-4"><h2 className="text-xl font-bold">입력과 선택</h2><div className="grid max-w-3xl gap-5 md:grid-cols-2"><Input label="기본 입력" placeholder="내용을 입력해주세요." /><Input label="오류 입력" defaultValue="잘못된 입력" error="입력 내용을 확인해주세요." /><Input label="비활성 입력" defaultValue="수정할 수 없는 값" disabled /><label className="space-y-1 text-sm font-medium text-caption-neutral">종사산업<Select defaultValue=""><option value="">산업군을 선택해주세요.</option><option value="IT">IT·기술</option></Select></label></div><label className="flex items-center gap-3 text-sm"><Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} />앱 원본 체크박스</label></section>

    <section className="space-y-4"><h2 className="text-xl font-bold">아이콘</h2><p className="text-sm text-caption-neutral">앱 PDF에서 추출한 벡터. 단색 아이콘은 주변 텍스트 색상을 따릅니다.</p><div className="grid grid-cols-3 gap-3 md:grid-cols-6">{(Object.keys(iconAssets) as IconName[]).map((name) => <div key={name} className="flex flex-col items-center gap-3 rounded-lg border border-line-neutral p-4 text-primary"><Icon name={name} size={28} /><p className="text-center text-xs text-caption-neutral">{name}</p></div>)}</div></section>

    <section className="space-y-4"><h2 className="text-xl font-bold">안내 이미지</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{(['signup', 'nologin', 'noprofile', 'nodata', 'nosubscribe', 'emptybookmark', 'nohighlight', 'warning'] as const).map((name) => <div key={name} className="rounded-xl border border-line-neutral bg-bg-system p-4 text-center"><AppImage name={name} width={260} height={260} className="h-auto w-full object-contain" /><p className="mt-3 text-xs text-caption-neutral">{name}</p></div>)}</div></section>

    <section className="space-y-4"><h2 className="text-xl font-bold">팝업과 알림</h2><div className="flex gap-3"><Button variant="outline" onClick={() => setDialog(true)}>팝업 보기</Button><Button onClick={() => setToast((value) => !value)}>{toast ? '토스트 닫기' : '토스트 보기'}</Button></div></section>
    {dialog && <Dialog title="구독 중지" onClose={() => setDialog(false)}><AppImage name="warning" width={80} height={80} className="mx-auto mb-5" /><p className="text-center text-sm leading-6">새로운 아티클 수신이 중지되며<br />언제든 구독을 재개할 수 있어요.</p><div className="mt-6 flex gap-2"><Button variant="neutral-outline" className="flex-1" onClick={() => setDialog(false)}>취소</Button><Button className="flex-1" onClick={() => setDialog(false)}>확인</Button></div></Dialog>}
    {toast && <Toast message="변경 내용이 저장되었습니다." />}
  </main>;
}
