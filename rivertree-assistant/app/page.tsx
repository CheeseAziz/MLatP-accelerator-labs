"use client";

import AppShell from "@/components/AppShell";
import { AppProvider } from "@/lib/store";

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
