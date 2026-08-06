import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Tempo — Hours, clearly accounted for", template: "%s · Tempo" },
  description: "A thoughtful way for modern teams to track time, manage projects, and understand where work goes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<Toaster richColors position="bottom-right" /></body></html>;
}
