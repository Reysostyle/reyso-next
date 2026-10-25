const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC = "٠١٢٣٤٥٦٧٨٩";

/** Persian/Arabic-Indic digits to ASCII, so validation works on any keyboard. */
export function toEnglishDigits(str: string): string {
  return str.replace(/[۰-۹٠-٩]/g, (ch) => {
    const p = PERSIAN.indexOf(ch);
    if (p > -1) return String(p);
    return String(ARABIC.indexOf(ch));
  });
}

export function toPersianDigits(str: string | number): string {
  return String(str).replace(/[0-9]/g, (d) => PERSIAN[Number(d)]);
}
