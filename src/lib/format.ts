const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function formatToman(amount: number): string {
  return `${toPersianDigits(amount.toLocaleString("en-US").replace(/,/g, "٬"))} تومان`;
}
