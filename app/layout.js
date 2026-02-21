import { Barlow, Barlow_Condensed, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata = {
  title: "Apex F1 | Your Pit Wall Anywhere",
  description: "Experience Formula 1 with real-time standings and race results.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} ${shareTechMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
