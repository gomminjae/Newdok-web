'use client';

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Button, Icon } from '@/shared/ui';

interface CalendarPopupProps {
  selectedDate: Date;
  displayedMonth: Date;
  onMonthChanged: (date: Date) => void;
  dataDays: Set<number>;
  isLoading?: boolean;
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
  displayedMonth,
  onMonthChanged,
  dataDays,
  isLoading = false,
  onDateSelected,
  onClose,
}: CalendarPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const today = startOfDay(new Date());

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
    onMonthChanged(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1));
  }, [displayedMonth, onMonthChanged]);

  const nextMonth = useCallback(() => {
    onMonthChanged(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1));
  }, [displayedMonth, onMonthChanged]);

  const selectToday = useCallback(() => {
    onDateSelected(today);
    onClose();
  }, [today, onDateSelected, onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="아티클 날짜 선택"
      className="fixed inset-0 m-auto max-h-[calc(100dvh-48px)] w-[calc(100%-48px)] max-w-[400px] overflow-y-auto bg-transparent p-0 backdrop:bg-bg-popup-dim/60"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <div
        className="flex w-full flex-col items-center gap-7"
      >
        <div className="w-full bg-white rounded-xl overflow-hidden">
          {/* 헤더 */}
          <div className="relative flex h-11 items-center justify-center rounded-t-xl bg-bg-elevated">
            <button className="flex h-11 w-11 items-center justify-center" onClick={prevMonth} type="button" aria-label="이전 달">
              <img src="/images/Line left.svg" alt="이전" width={24} height={24} />
            </button>
            <span className="w-[120px] text-center text-sm font-medium text-caption-deep" aria-live="polite">
              {yearMonthTitle}
            </span>
            <button className="flex h-11 w-11 items-center justify-center" onClick={nextMonth} type="button" aria-label="다음 달">
              <img src="/images/Line right.svg" alt="다음" width={24} height={24} />
            </button>
            <button
              className="absolute right-2 top-0 flex h-11 w-11 items-center justify-center"
              onClick={onClose}
              type="button"
              aria-label="닫기"
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
                  i === 0 && 'text-calendar-sunday',
                  i === 6 && 'text-calendar-saturday',
                  i !== 0 && i !== 6 && 'text-black',
                )}
              >
                {day}
              </span>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div aria-busy={isLoading} className="flex flex-col gap-2.5 px-2 py-5">
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
                      aria-label={isBlank ? undefined : `${day.dayInt}일${isToday ? ', 오늘' : ''}${hasData ? ', 아티클 있음' : ''}`}
                      aria-pressed={isBlank ? undefined : isSelected}
                    >
                      <span
                        className={clsx(
                          'flex h-10 w-10 max-w-full items-center justify-center rounded-lg text-base font-normal',
                          isSelected && 'bg-caption-heavy',
                          isToday && !isSelected && 'border border-caption-heavy',
                          isFuture ? 'text-caption-disabled' : isSelected ? 'text-white' : 'text-caption-muted',
                        )}
                      >
                        {day.dayString}
                      </span>
                      <span
                        className={clsx(
                          'h-1.5 w-1.5 rounded-full bg-caption-strong transition-opacity',
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
        <Button
          variant="outline"
          size="utility"
          onClick={selectToday}
          aria-label="오늘 날짜로 이동"
        >
          <Icon name="Line Reload" size={16} />
          오늘
        </Button>
      </div>
    </dialog>
  );
}
