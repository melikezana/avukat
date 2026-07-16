const wordsPerMinute = 200;

export function estimateReadingMinutesFromText(value: string) {
  const words = value.match(/[A-Za-z0-9ÇĞİÖŞÜçğıöşüÂâÎîÛû]+(?:['’][A-Za-z0-9ÇĞİÖŞÜçğıöşüÂâÎîÛû]+)?/g) ?? [];
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}

export function formatReadingTime(minutes: number) {
  return `${Math.max(1, Math.ceil(minutes))} dk okuma`;
}
