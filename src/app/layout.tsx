import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://tracker.abdulwadood.com"),
  title: { default: "Tracker — Make every hour count", template: "%s · Tracker" },
  description: "Professional time tracking, project collaboration, reporting, and secure sharing for focused teams.",
  applicationName: "Tracker",
  openGraph: { title: "Tracker — Make every hour count", description: "Time tracking and project clarity for focused teams.", type: "website", url: "/", siteName: "Tracker" },
  twitter: { card: "summary_large_image", title: "Tracker — Make every hour count", description: "Time tracking and project clarity for focused teams." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<Toaster richColors position="bottom-right" /></body></html>;
}
