// Digit access for checksums without allocating substrings. Only call these on positions the
// country's format regex has already proven to be ASCII digits.

/** The digit at index `i`. */
export function digit(s: string, i: number): number {
  return s.charCodeAt(i) - 48;
}

/** The digits in `s[start, end)` read as one number, like `Number(s.slice(start, end))`. */
export function digits(s: string, start: number, end: number = s.length): number {
  let n = 0;
  for (let i = start; i < end; i++) n = n * 10 + (s.charCodeAt(i) - 48);
  return n;
}
