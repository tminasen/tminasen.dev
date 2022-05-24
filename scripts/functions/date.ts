export function parseStringDate(stringDate: string): number {
  try {
    return Date.parse(stringDate);
  } catch {
    return 0;
  }
}

/**
 * 日付文字列からDateオブジェクトを取得する
 * @param dateString YYYY/MM/DD
 */
export function dateFromDateString(dateString: string): Date | Error {
  const [year, month, day, ...others] = dateString.split('/');
  // 必要な日付なければエラー
  if (!year && !month && !day) {
    return new Error(`${dateString} is invalid. The format is YYYY/MM/DD`);
  }
  const yearNum = convertToDecimal(year);
  const monthNum = convertToDecimal(month);
  const dayNum = convertToDecimal(day);
  if (
    yearNum instanceof Error ||
    monthNum instanceof Error ||
    dayNum instanceof Error
  ) {
    return new Error(`year, month or day is not a number`);
  }
  // GMTになってしまった場合を考慮して9時にしておく
  return new Date(yearNum, monthNum - 1, dayNum, 9, 0, 0);
}

function convertToDecimal(value: string): number | Error {
  const decimalValue = Number.parseInt(value, 10);
  if (Number.isNaN(decimalValue)) {
    return new Error(`${value} is not a number`);
  }
  return decimalValue;
}
