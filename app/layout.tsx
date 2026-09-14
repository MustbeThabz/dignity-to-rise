import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dignitytorise.co.za"),
  title: {
    default: "Dignity to Rise | Overstrand",
    template: "%s | Dignity to Rise"
  },
  description: "Dignity to Rise brings people, skills and resources together to build opportunity across the Overstrand.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

// Without a viewport declaration, mobile browsers render the site against a
// desktop-width canvas and scale it down.  That prevented the homepage frame's
// phone breakpoints (including its menu) from ever being activated.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
