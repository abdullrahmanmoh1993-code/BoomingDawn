import { Inter, Anton, Cairo } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/constants";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let content extend edge-to-edge so env(safe-area-inset-*) becomes
  // meaningful; safe areas are then handled explicitly in the layout.
  viewportFit: "cover",
  themeColor: "#000000",
};

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
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "The Booming Dawn | الفجر الصاخب",
    template: "%s | The Booming Dawn",
  },
  description:
    siteConfig.description,
  keywords: [
    "streetwear",
    "egypt",
    "the booming dawn",
    "cairo fashion",
    "statement tee",
    "t-shirt",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "The Booming Dawn",
    title: "The Booming Dawn | الفجر الصاخب",
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: "/images/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Booming Dawn | الفجر الصاخب",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Booming Dawn | الفجر الصاخب",
    description: siteConfig.description,
    images: ["/images/brand/og-image.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "The Booming Dawn",
  slogan: siteConfig.tagline,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/images/brand/logo.png`,
  sameAs: [
    "https://www.instagram.com/theboomingdawn",
    "https://www.tiktok.com/@theboomingdawn",
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
      dir="ltr"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${anton.variable} ${inter.variable} ${cairo.variable} font-body bg-background text-foreground antialiased min-h-app flex flex-col`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}