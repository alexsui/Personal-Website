// Posts on this site are written in English or Traditional Chinese.
export function getPostLanguage(text: string) {
  return /[\u3400-\u9fff]/.test(text)
    ? { code: 'zh-Hant', label: 'Traditional Chinese' }
    : { code: 'en', label: 'English' };
}
