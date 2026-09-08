/** API 요일 ID: 월요일 1 ~ 일요일 7. 한국 시간 기준으로 계산한다. */
export function getTomorrowPublicationDay(now = new Date()): string {
  const tomorrowInKorea = new Date(now.getTime() + (24 + 9) * 60 * 60 * 1000);
  return String(tomorrowInKorea.getUTCDay() || 7);
}
