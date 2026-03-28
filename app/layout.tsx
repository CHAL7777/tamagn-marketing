import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Inter, Manrope, Noto_Sans_Ethiopic } from "next/font/google";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentLocale, getCurrentTheme } from "@/lib/i18n/server";
import { localeHtmlLang } from "@/lib/i18n/translations";

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

const ethiopicFont = Noto_Sans_Ethiopic({
  weight: ["400", "500", "700"],
  variable: "--font-app-ethiopic",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, theme] = await Promise.all([
    getCurrentLocale(),
    getCurrentTheme(),
  ]);

  return (
    <html
      lang={localeHtmlLang(locale)}
      className={cn(
        "h-full scroll-smooth",
        bodyFont.variable,
        headlineFont.variable,
        ethiopicFont.variable,
        theme === "dark" && "dark"
      )}
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
