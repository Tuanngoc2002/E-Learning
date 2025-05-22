"use client";

import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apollo-client';
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import ResponsiveNav from "@/components/organisms/ResponsiveNav";
import Footer from "@/components/organisms/Footer";
import ScrollToTop from "@/components/Helper/ScrollToTop";

const font = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

// Client component wrapper
const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ApolloProvider client={client}>
      <ResponsiveNav />
      {children}
      <Footer />
      <ScrollToTop />
    </ApolloProvider>
  );
};

// Server component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
