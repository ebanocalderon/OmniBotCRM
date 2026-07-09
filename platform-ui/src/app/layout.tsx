import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased h-screen flex overflow-hidden bg-slate-50 text-slate-900`}>
        <I18nProvider>
          <AuthProvider>
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-y-auto relative z-0">
                {children}
              </main>
            </div>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
