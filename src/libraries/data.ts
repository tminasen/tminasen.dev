/**
 * stringの日付をnumberに変換する
 * @param stringDate yyyy/MM/dd形式の文字列
 */
export function parseStringDate(stringDate: string): number {
  try {
    return Date.parse(stringDate);
  } catch {
    return 0;
  }
}
