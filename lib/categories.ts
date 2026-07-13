const turkishCharacterMap: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  i: "i",
  ö: "o",
  ş: "s",
  ü: "u"
};

export function slugifyTurkish(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıiöşü]/g, (character) => turkishCharacterMap[character] ?? character)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCategoryFilterHref(category: string) {
  return `/makaleler?kategori=${slugifyTurkish(category)}`;
}
