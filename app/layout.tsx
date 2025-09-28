import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from '@clerk/themes';
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Banksy",
  description: "Your all in one banking solution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
        appearance={{
          theme: [neobrutalism],
          variables: { colorPrimary: 'red' },
          signIn: {
            theme: [neobrutalism],
            variables: { colorPrimary: 'green' },
          },
        }}>
      <html lang="en">

      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <SiteHeader/>
              <main className="min-h-screen flex flex-col">
                  {children}
              </main>
          <SiteFooter/>
      </body>
      </html>
    </ClerkProvider>
  );
}
