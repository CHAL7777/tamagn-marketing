import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Inter, Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/SiteHeader";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-app-body",
  display: "swap",
});

const headlineFont = Manrope({
  subsets: ["latin"],
  variable: "--font-app-headline",
  display: "swap",
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "ታማኝ (Liger)",
    template: "%s | ታማኝ",
  },
  description:
    "Trusted hyperlocal marketplace for Ethiopia: verified merchants, M-Pesa escrow, and platform logistics.",
  applicationName: "Liger",
  openGraph: {
    type: "website",
    locale: "en_ET",
    siteName: "ታማኝ (Liger)",
    title: "ታማኝ (Liger)",
    description:
      "Verified merchants, buyer protection, and M-Pesa escrow for local commerce.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ታማኝ (Liger)",
    description:
      "Verified merchants, buyer protection, and M-Pesa escrow for local commerce.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full scroll-smooth", bodyFont.variable, headlineFont.variable)}
    >
      <body
        className={cn(
          "flex min-h-screen flex-col bg-background font-body text-foreground antialiased"
        )}
      >
        <SiteHeader />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
