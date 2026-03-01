import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata = {
  title: "masam.ai",
  description: "Masanı hayal et, ürünleri dene, setup'ını oluştur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans bg-masam-black text-masam-text-primary selection:bg-masam-border-strong selection:text-masam-black flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 mt-14 md:mt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
