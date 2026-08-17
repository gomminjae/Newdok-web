'use client';

import Link from 'next/link';
import { useRef } from 'react';

const POPULAR_NEWSLETTERS = [
  {
    name: '뉴스레터 브랜드명',
    icon: 'NEW',
    desc: '새로 떠오르는 소식 뉴스레터!',
    tags: ['#시사·이슈', '#비즈니스', '#트렌드'],
  },
  {
    name: '뉴스레터 브랜드명',
    icon: 'HOT',
    desc: '새로 떠오르는 소식 뉴스레터!',
    tags: ['#시사·이슈', '#비즈니스', '#트렌드'],
  },
  {
    name: '인사이트 레터',
    icon: 'IDEA',
    desc: '일과 삶에 필요한 인사이트를 전해요.',
    tags: ['#커리어', '#라이프'],
  },
  {
    name: '모닝 브리프',
    icon: 'AM',
    desc: '오늘 알아야 할 소식을 빠르게 읽어보세요.',
    tags: ['#뉴스', '#경제'],
  },
] as const;

export function PopularNewsletters() {
  const listRef = useRef<HTMLUListElement>(null);

  const scrollCards = (direction: -1 | 1) => {
    listRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="popular-newsletters" className="bg-bg px-5 py-9 sm:px-8 sm:py-11">
      <div className="mx-auto w-full max-w-[648px]">
        <h2 id="popular-newsletters" className="mb-4 text-base font-bold text-primary sm:text-lg">
          지금 인기 있는 뉴스레터
        </h2>
        <div className="relative">
          <ul
            ref={listRef}
            className="landing-scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-0.5 py-0.5"
          >
            {POPULAR_NEWSLETTERS.map((newsletter) => (
              <li
                key={newsletter.name + newsletter.icon}
                className="w-[78%] max-w-[294px] flex-none snap-start sm:w-[calc(50%-6px)]"
              >
                <Link
                  href="/search"
                  className="flex h-full min-h-28 gap-3 rounded-xl border border-line-disabled bg-bg p-3 transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-[#ff8a1f] text-[10px] font-extrabold text-black">
                    {newsletter.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-bold text-caption-heavy">
                      {newsletter.name}
                    </strong>
                    <span className="mt-1 block text-xs leading-snug text-caption-neutral">
                      {newsletter.desc}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      {newsletter.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-primary px-2 py-0.5 text-[10px] text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => scrollCards(-1)}
            aria-label="이전 인기 뉴스레터 보기"
            className="absolute -left-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-xl text-caption-alternative shadow-md transition-colors hover:text-caption-heavy sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollCards(1)}
            aria-label="다음 인기 뉴스레터 보기"
            className="absolute -right-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-xl text-caption-alternative shadow-md transition-colors hover:text-caption-heavy sm:flex"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
