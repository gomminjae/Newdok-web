'use client';

import Image from 'next/image';
import { useState, useMemo, useCallback } from 'react';
import styles from './calendar.module.scss';

interface CalendarPopupProps {
  selectedDate: Date;
  dataDays: Set<number>;
  onDateSelected: (date: Date) => void;
  onClose: () => void;
}

interface CalendarDay {
  date: Date;
  dayString: string;
  dayInt: number;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function generateDays(displayedMonth: Date): CalendarDay[] {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: CalendarDay[] = [];

  // 빈칸
  for (let i = 0; i < firstWeekday; i++) {
    days.push({ date: new Date(0), dayString: '', dayInt: 0 });
  }

  // 실제 날짜
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), dayString: `${d}`, dayInt: d });
  }

  // 7의 배수로 맞추기
  while (days.length % 7 !== 0) {
    days.push({ date: new Date(0), dayString: '', dayInt: 0 });
  }

  return days;
}

export function CalendarPopup({ selectedDate, dataDays, onDateSelected, onClose }: CalendarPopupProps) {
  const [displayedMonth, setDisplayedMonth] = useState(new Date(selectedDate));
  const today = startOfDay(new Date());

  const days = useMemo(() => generateDays(displayedMonth), [displayedMonth]);
  const weeks = useMemo(() => {
    const result: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const yearMonthTitle = `${displayedMonth.getFullYear()}년 ${displayedMonth.getMonth() + 1}월`;

  const prevMonth = useCallback(() => {
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const selectToday = useCallback(() => {
    onDateSelected(today);
    onClose();
  }, [today, onDateSelected, onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.calendarCard}>
          {/* 헤더 */}
          <div className={styles.header}>
            <button className={styles.navButton} onClick={prevMonth} type="button">
              <Image src="/images/Line left.svg" alt="이전" width={24} height={24} />
            </button>
            <span className={styles.monthTitle}>{yearMonthTitle}</span>
            <button className={styles.navButton} onClick={nextMonth} type="button">
              <Image src="/images/Line right.svg" alt="다음" width={24} height={24} />
            </button>
            <button className={styles.closeButton} onClick={onClose} type="button">
              <Image src="/images/Line Close.svg" alt="닫기" width={24} height={24} />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className={styles.weekdayHeader}>
            {WEEKDAYS.map((day, i) => (
              <span
                key={day}
                className={`${styles.weekday} ${i === 0 ? styles.sunday : ''} ${i === 6 ? styles.saturday : ''}`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className={styles.dateGrid}>
            {weeks.map((week, wi) => (
              <div key={wi} className={styles.weekRow}>
                {week.map((day, di) => {
                  const isBlank = day.dayInt === 0;
                  const isToday = !isBlank && isSameDay(day.date, today);
                  const isSelected = !isBlank && isSameDay(day.date, selectedDate);
                  const isFuture = !isBlank && startOfDay(day.date) > today;
                  const hasData = !isBlank && dataDays.has(day.dayInt);

                  return (
                    <button
                      key={di}
                      className={`${styles.dayCell} ${isBlank ? styles.blank : ''} ${isToday ? styles.today : ''} ${isSelected && !isToday ? styles.selected : ''} ${isFuture ? styles.future : ''}`}
                      onClick={() => {
                        if (isBlank) return;
                        onDateSelected(day.date);
                        onClose();
                      }}
                      disabled={isBlank}
                      type="button"
                    >
                      <span className={styles.dayNumber}>{day.dayString}</span>
                      <span className={`${styles.dataDot} ${hasData ? styles.visible : ''}`} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 오늘 버튼 */}
        <button className={styles.todayButton} onClick={selectToday} type="button">
          <Image src="/images/Line Reload.svg" alt="" width={16} height={16} />
          오늘
        </button>
      </div>
    </div>
  );
}
