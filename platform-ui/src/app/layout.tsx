import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "OmniBot Platform",
  description: "AI Customer Operations Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased h-screen flex overflow-hidden`}>
        <I18nProvider>
          <AuthProvider>
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background/50 backdrop-blur-3xl">
              {children}
            </main>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
