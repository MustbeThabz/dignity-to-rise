import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Dignity to Rise | Volunteer Registration",
  description: "Overstrand volunteer registration form"
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
