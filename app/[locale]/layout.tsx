import type { Metadata } from "next";
import { Outfit, Inter, Cormorant_Garamond } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AccessibilityWidget } from "@/components/ui/AccessibilityWidget";
import { AccessibilityProvider } from "@/components/providers/AccessibilityContext";
import { AuthProvider } from "@/components/providers/AuthProvider";
import AnimatedBackground from "@/components/sections/AnimatedBackground";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Diego Parra | Kinesiología y Acupuntura",
  description: "Rehabilitación integral y terapias complementarias para tu bienestar.",
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} ${cormorant.variable} antialiased font-sans`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AccessibilityProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                storageKey="theme-preference"
                disableTransitionOnChange
              >
                <AnimatedBackground />
                <Navbar />
                <main className="min-h-screen">
                  {children}
                </main>
                <Footer />
                <CookieConsent />
                <AccessibilityWidget />
              </ThemeProvider>
            </AccessibilityProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
