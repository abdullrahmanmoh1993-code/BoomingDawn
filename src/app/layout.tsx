import { Inter, Anton, Cairo } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://theboomingdawn.com"),
  title: {
    default: "The Booming Dawn | الفجر الصاخب",
    template: "%s | The Booming Dawn",
  },
  description:
    "Wear your attitude on your chest. Streetwear for the fearless, soft cotton, loud graphics.",
  keywords: [
    "streetwear",
    "egypt",
    "the booming dawn",
    "cairo fashion",
    "statement tee",
    "t-shirt",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "The Booming Dawn",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${anton.variable} ${inter.variable} ${cairo.variable} font-body bg-background text-foreground antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}