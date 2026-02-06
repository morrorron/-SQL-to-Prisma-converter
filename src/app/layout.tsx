import "@/app/globals.css";
import type { Metadata } from "next";
import { ToastProviderInternal } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "SQL to Prisma Schema Converter - Online & Free",
  description:
    "Instantly convert SQL CREATE TABLE statements to Prisma Schema models. The best tool for developers migrating to Prisma ORM.",
  keywords: [
    "sql to prisma",
    "prisma schema generator",
    "convert sql to prisma",
    "mysql to prisma",
    "postgres to prisma"
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 app-gradient">
        <ToastProviderInternal>
          {children}
          <Toaster />
        </ToastProviderInternal>
      </body>
    </html>
  );
}

