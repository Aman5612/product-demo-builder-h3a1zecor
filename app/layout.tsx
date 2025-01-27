import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/NavBar";
import { Toaster } from "@/components/ui/sonner";
import SessionWrapper from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentDR",
  description: "AgentDR is a tool that helps you create demo video of any product with simple prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionWrapper>
          <Toaster richColors closeButton theme="light" position="top-right" />
          <Navbar />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
