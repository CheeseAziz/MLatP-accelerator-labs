import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rivertree Assistant",
  description: "Client assistant for River Tree Insurance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
