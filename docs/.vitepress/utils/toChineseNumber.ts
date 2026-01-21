/**
 * Converts a number string to its Chinese character representation.
 * @param numStr The number string to convert.
 * @returns The Chinese character representation of the number.
 */
export function toChineseNumber(numStr: string): string {
  const chinese = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '〇']
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  return numStr.replace(/\d/g, match => chinese[digits.indexOf(match)])
}
