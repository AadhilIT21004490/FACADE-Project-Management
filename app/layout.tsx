import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Facade - Project Management",
  description: "Production-ready SaaS web application for project management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen`}>
        <Providers>
          {children}
          <Toaster theme="dark" position="top-right" richColors toastOptions={{ className: 'glass' }} />
        </Providers>
      </body>
    </html>
  );
}