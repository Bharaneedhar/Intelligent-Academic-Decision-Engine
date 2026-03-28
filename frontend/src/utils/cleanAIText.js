export default function cleanAIText(text) {
  return String(text ?? '')
    .replace(/#{1,6}\s?/g, '') // remove markdown headings
    .replace(/\*\*/g, '') // remove bold **
    .replace(/["']/g, '') // remove " and '
    .replace(/\*/g, '') // remove bullet *
    .replace(/`/g, '') // remove code marks
    .trim();
}

