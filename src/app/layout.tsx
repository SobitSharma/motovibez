import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MOTOVIBEZ — The Detailing Studio | Karnal",
  description:
    "Transform your vehicle into a stunning work of art. Premium car wrapping, detailing & customization studio in Karnal, Haryana. Call 089010 86801.",
  keywords: "car wrapping, car detailing, vehicle customization, Karnal, Haryana, MOTOVIBEZ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
