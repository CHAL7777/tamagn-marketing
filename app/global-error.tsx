"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Root error boundary (must include html/body — outside root layout). */
export default function GlobalError({ error, reset }: Props) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground antialiased">
        <h1 className="text-lg font-semibold">Application error</h1>
        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
          {error.message}
        </p>
        <button
          type="button"
          className="mt-6 rounded-lg border bg-card px-4 py-2 text-sm font-medium"
          onClick={() => reset()}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
