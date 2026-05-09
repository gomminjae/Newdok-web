'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { articleApi } from '@/shared/api/endpoints';
import { CalendarPopup } from '@/widgets/calendar';
import type { Article } from '@/shared/api/types';
import styles from './home.module.scss';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const queryClient = useQueryClient();

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();

  // 오늘의 아티클
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles', 'day', year, month, day],
    queryFn: () => articleApi.fetchDayArticle(year, month, day),
  });

  // 캘린더 데이터 (해당 월에 아티클이 있는 날짜)
  const { data: monthlyData = [] } = useQuery({
    queryKey: ['articles', 'monthly', year, month],
    queryFn: () => articleApi.fetchArticles(year, month),
    select: (res) => res.data,
  });

  const calendarDataDays = useMemo(() => {
    const days = new Set<number>();
    monthlyData.forEach((d) => {
      if (d.hasArticles) days.add(d.publishDate);
    });
    return days;
  }, [monthlyData]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['articles', 'day', year, month, day] });
  };

  const handleDateSelected = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className={styles.container}>
      {/* 날짜 바 */}
      <div className={styles.dateBar}>
        <span className={styles.dateText}>{formatDate(selectedDate)}</span>
        <button
          className={styles.calendarButton}
          type="button"
          onClick={() => setShowCalendar(true)}
        >
          <Image src="/images/Line Calendar.svg" alt="달력" width={24} height={24} />
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : articles.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>아직 도착한 아티클이 없어요.</p>
          <p className={styles.emptyDescription}>
            뉴스레터를 구독하면 아티클을 받아볼 수 있어요.
          </p>
          <button className={styles.emptyButton} type="button">
            뉴스레터 둘러보기
          </button>
        </div>
      ) : (
        <div className={styles.articlesSection}>
          <div className={styles.articlesHeader}>
            <span className={styles.articlesCount}>
              {articles.length}개의 아티클이 도착했어요.
            </span>
            <button className={styles.refreshButton} type="button" onClick={handleRefresh}>
              <Image
                src="/images/Line Reload.svg"
                alt="새로고침"
                width={20}
                height={20}
                className={styles.refreshIcon}
              />
              새로고침
            </button>
          </div>
          <div className={styles.articlesList}>
            {articles.map((article) => (
              <ArticleRow key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* 캘린더 팝업 */}
      {showCalendar && (
        <CalendarPopup
          selectedDate={selectedDate}
          dataDays={calendarDataDays}
          onDateSelected={handleDateSelected}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}

function ArticleRow({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.id}`} className={`${styles.articleRow} ${article.status === 'Read' ? styles.read : ''}`}>
      {article.imageUrl ? (
        <img src={article.imageUrl} alt={article.brandName} className={styles.articleImage} />
      ) : (
        <div className={styles.articleImagePlaceholder} />
      )}
      <div className={styles.articleInfo}>
        <div className={styles.articleMeta}>
          <span className={styles.brandName}>{article.brandName}</span>
          <span
            className={`${styles.readStatus} ${
              article.status === 'Read' ? styles.read : styles.unread
            }`}
          >
            {article.status === 'Read' ? '읽음' : '안읽음'}
          </span>
        </div>
        <span className={styles.articleTitle}>{article.articleTitle}</span>
      </div>
    </Link>
  );
}
