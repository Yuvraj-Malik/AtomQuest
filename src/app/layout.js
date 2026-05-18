import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

// Simulate Geist_Mono with another available mono font since it might not be in standard next/font yet, 
// wait, Next 14.2+ does support geist mono via next/font/google natively. If not, fallback to JetBrains_Mono
import { JetBrains_Mono } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700']
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono', // keeping the variable name consistent for our CSS logic
  weight: ['300', '400', '500']
});

export const metadata = {
  title: "AtomQuest - Goal Tracking Portal",
  description: "Corporate Goal Setting and Tracking Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className={`${plusJakarta.variable} ${monoFont.variable} antialiased font-sans`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
