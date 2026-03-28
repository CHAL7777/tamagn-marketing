type Props = { rating: number; review?: string };

export function RatingReview({ rating, review }: Props) {
  return (
    <div>
      <span>{rating}</span>
      {review ? <p>{review}</p> : null}
    </div>
  );
}
