<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## UI 디자인 시스템

- 카테고리·관심사·산업·발행 요일·정렬 칩은 `src/shared/ui/Chip.tsx`만 사용한다.
- 표시용은 `<Chip>`, 선택·필터용은 `<Chip as="button" active={...}>`으로 사용한다. 링크 안에는 표시용 칩을 사용한다.
- 화면에서 칩의 색상·크기·테두리·여백을 재정의하지 않는다. 외형 변경은 공통 컴포넌트에 반영한다.
- 일반 동작 버튼은 `Button`, 링크형 버튼은 `ButtonLink`를 사용한다. 색상·높이·모서리·비활성 상태는 `variant`, `size`, `radius`, `disabledTone`으로 선택하고 화면에서는 배치만 지정한다.
- 구독 상태는 `SubscriptionBadge`, 성공 알림은 `Toast`, 텍스트 색을 따르는 단색 아이콘은 `Icon`을 사용한다.
- 앱 디자인 비교 기준과 화면별 적용값은 `docs/app-design-parity.md`를 참고한다. 웹에서만 제공하는 랜딩 구성과 데스크톱 사이드바는 유지한다.
