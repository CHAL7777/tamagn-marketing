export function scoreFromRatings(ratings: number[]) {
  if (ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}
