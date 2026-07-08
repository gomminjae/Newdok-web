'use client';

import { useState, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';

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
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function generateDays(displayedMonth: Date): CalendarDay[] {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: CalendarDay[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    days.push({ date: new Date(0), dayString: '', dayInt: 0 });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), dayString: `${d}`, dayInt: d });
  }

  while (days.length % 7 !== 0) {
    days.push({ date: new Date(0), dayString: '', dayInt: 0 });
  }

  return days;
}

export function CalendarPopup({
  selectedDate,
  dataDays,
  onDateSelected,
  onClose,
}: CalendarPopupProps) {
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
    <div
      className="fixed inset-0 bg-[rgba(37,36,44,0.6)] flex items-center justify-center z-[1000] p-6"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-5 w-full max-w-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full bg-white rounded-2xl overflow-hidden">
          {/* 헤더 */}
          <div className="relative flex items-center justify-center h-11 bg-neutral-50 rounded-t-2xl">
            <button className="p-2.5 flex items-center" onClick={prevMonth} type="button">
              <img src="/images/Line left.svg" alt="이전" width={24} height={24} />
            </button>
            <span className="w-[120px] text-center text-sm font-medium text-caption-heavy">
              {yearMonthTitle}
            </span>
            <button className="p-2.5 flex items-center" onClick={nextMonth} type="button">
              <img src="/images/Line right.svg" alt="다음" width={24} height={24} />
            </button>
            <button
              className="absolute right-[18px] top-1/2 -translate-y-1/2 p-1 flex items-center"
              onClick={onClose}
              type="button"
            >
              <img src="/images/Line Close.svg" alt="닫기" width={24} height={24} />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="flex px-2 py-3.5">
            {WEEKDAYS.map((day, i) => (
              <span
                key={day}
                className={clsx(
                  'flex-1 text-center text-base font-normal',
                  i === 0 && 'text-red-600',
                  i === 6 && 'text-primary',
                  i !== 0 && i !== 6 && 'text-caption-heavy',
                )}
              >
                {day}
              </span>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="px-2 pb-5 flex flex-col gap-2.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex">
                {week.map((day, di) => {
                  const isBlank = day.dayInt === 0;
                  const isToday = !isBlank && isSameDay(day.date, today);
                  const isSelected = !isBlank && isSameDay(day.date, selectedDate);
                  const isFuture = !isBlank && startOfDay(day.date) > today;
                  const hasData = !isBlank && dataDays.has(day.dayInt);

                  return (
                    <button
                      key={di}
                      className={clsx(
                        'flex-1 flex flex-col items-center gap-1 bg-transparent p-0',
                        isBlank ? 'opacity-30 cursor-default' : 'cursor-pointer',
                      )}
                      onClick={() => {
                        if (isBlank) return;
                        onDateSelected(day.date);
                        onClose();
                      }}
                      disabled={isBlank}
                      type="button"
                    >
                      <span
                        className={clsx(
                          'w-10 h-10 flex items-center justify-center rounded-xl text-base font-normal',
                          isToday && 'bg-primary text-white',
                          isSelected && !isToday && 'border border-shade-400 text-caption-heavy',
                          isFuture && !isToday && 'text-caption-disabled',
                          !isToday && !isSelected && !isFuture && 'text-caption-heavy',
                        )}
                      >
                        {day.dayString}
                      </span>
                      <span
                        className={clsx(
                          'w-1.5 h-1.5 rounded-full bg-primary transition-opacity',
                          hasData ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 오늘 버튼 */}
        <button
          className="flex items-center gap-1 px-5 py-2 bg-white border border-primary rounded text-sm font-medium text-primary hover:bg-tint-50"
          onClick={selectToday}
          type="button"
        >
          <img src="/images/Line Reload.svg" alt="" width={16} height={16} />
          오늘
        </button>
      </div>
    </div>
  );
}
