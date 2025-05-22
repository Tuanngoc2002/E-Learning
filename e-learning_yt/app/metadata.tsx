import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning with WDW",
  description: "E-learning website using next js",
};

export default function MetadataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 