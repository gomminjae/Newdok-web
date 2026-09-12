# 앱 디자인 적용 기준

비교 대상은 인접 iOS 프로젝트 `../Newdok/Modules`의 현재 SwiftUI 구현이다. 웹의 기존 기능과 데스크톱 반응형 배치는 유지하고, 공통 시각 요소와 구현된 화면의 상태별 표현을 맞춘다.

## 공통 요소

| 요소 | 적용값 | iOS 기준 |
| --- | --- | --- |
| 기본 색 | primary `#2866D3`, 배경 `#F5F5F7`, 테두리 `#EBEBEB`, 비활성 선 `#C0C0C0` | `DesignSystem/Sources/Color/ColorPalette.swift` |
| 기본 CTA | 48px, 14px bold, radius 4px | `DesignSystem/Sources/Component/NoDataView.swift` |
| 소셜 로그인 | 56px, 16px bold, radius 16px; Kakao 노랑, Apple 검정 | `Features/Auth/Sources/Login/View/LoginView.swift` |
| 입력창 | 50px 또는 48px, 14px, radius 4px, 오류 배경 `#FEE6E6` | `DesignSystem/Sources/TextField/CustomTextFieldModifier.swift` |
| 칩 | 12px, 좌우 10px·상하 6px, radius 16px | `Features/Explore/Sources/Explore/Recomend/RecommendedNewsLetterView.swift`의 TagView |
| 구독 탭 | 높이 40px, radius 6px, 슬라이더 36px, 전환 250ms | `Features/Subscribe/Sources/Subscribe/Component/SegmentPickerView.swift` |
| 구독 배지 | 11px medium, 파란 배경 또는 회색 테두리; 상세 50×26px | Explore/Detail 구독 상태 UI |
| 토스트 | 높이 56px, radius 8px, 14px medium, 파란 배경, 체크 아이콘 | `DesignSystem/Sources/Toast/ToastView.swift` |
| 빈 화면 그림 | 280×280px | NoDataView, EmptySubscriptionView, BookmarkEmptyView |

공통 구현은 `src/shared/ui/`에 둔다. 버튼의 작은 변형은 구독 버튼(32px), 인증/보조 버튼(36px), 필터·상세 구독 버튼(40px), 프로필 버튼(44px)으로 구분한다. 비활성 가입 CTA는 흰 글씨, 필터 CTA는 회색 글씨, 소셜·텍스트 버튼은 원래 색과 투명도를 유지한다.

## 화면별 비교 범위

- 로그인·가입: 로고, 소셜 버튼, 프로필 입력 간격, 생년/성별 컨트롤, 약관 체크 상태, 하단 CTA.
- 홈: `M월 d일(E)` 날짜 바, 88px 아티클 카드와 읽음 상태, 56px/r12 이미지, 비회원·구독 없음·아티클 없음 상태, 달력의 검정 선택과 오늘 테두리.
- 구독 관리: 사각 세그먼트, 카드, 56px/r10 이미지, 구독중지·구독재개 버튼과 빈 화면.
- 북마크: 필터와 개수 영역, r8 카드, 20px 원형 로고, 게스트·빈 화면.
- 둘러보기: 회색 탭, 목록 배치·배지·칩, 추천 이미지와 카드, 닉네임 제목, 필터·정렬 시트, 새로고침.
- 검색: 입력창, 인기검색어, 검색 결과 카드, 빈 결과 등록 요청 버튼.
- 뉴스레터 상세: 260px 모바일 이미지, 겹치는 구독 정보 바, 95×40px 상태별 버튼, 배지, 지난 아티클, 구독 중지 확인창, 토스트.
- 아티클 상세: 44px 헤더, 260px 커버, 제목·날짜 오버레이, 북마크, 맨 위로 버튼.
- 마이페이지: 프로필/이메일 영역, 프로필 편집 버튼, 메뉴 간격·구분선, 복사 토스트.
- 웹 랜딩·404: 웹 고유 구성 안에서 버튼과 공통 색상 적용.

## 홈 상세

`/home`은 비회원도 앱의 홈 안내를 표시한다. 모바일 헤더는 앱 원본 로고 140×32px와 상하 17px 여백으로 높이 66px을 사용한다. 날짜 바는 좌우 8px·높이 52px·radius 12px이고, 아티클 목록은 흰 패널 안에서 좌우 20px·카드 간격 8px을 사용한다. 빈 화면 그림은 280px이며 공통 48px CTA를 사용한다. 구독이 없으면 추천 탭으로, 선택한 날에 아티클이 없으면 해당 요일 필터가 적용된 모든 뉴스레터로 이동한다.

새로고침은 앱처럼 수신 갱신 후 오늘의 목록·구독·월별 표시를 다시 가져오며 아이콘이 800ms 동안 회전한다. 달력은 현재 표시 중인 월의 데이터를 조회한다. 카드와 목록은 메모이제이션하고 읽음 변경은 해당 아티클만 갱신한다. 홈의 정적 HTML에는 빌드 시점의 날짜를 표시하지 않고, 브라우저가 준비되면 현지 날짜를 표시한다.

달력의 오늘 버튼은 공통 `Button`의 `outline` / `utility`(36px, 14px medium) 조합을 사용한다.

## 에셋과 검증

`public/images/app/`의 안내 PNG는 앱 `DesignSystem/Resources/Assets.xcassets` 내 `nologin`, `nodata`, `nosubscribe`, `emptybookmark`, `warning` PDF 원본을 2배 해상도로 렌더링한 파일이다. `home-logo.png`는 `logo.imageset`의 3배 해상도 PNG 원본을 복사했다.

앱 소스 비교, TypeScript·ESLint·프로덕션 빌드, 로컬 페이지 응답과 컴포넌트 동작 검사로 검증한다. 이 실행 환경에는 연결된 브라우저가 없어 실제 화면 스크린샷을 대조하는 검증은 수행하지 못했다.
