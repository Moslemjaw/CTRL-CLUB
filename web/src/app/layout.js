import "./globals.css";
import { Chakra_Petch, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ToastContainer } from "react-toastify";
import AuthProvider from "@/components/AuthProvider";
import ServiceWorker from "@/components/ServiceWorker";

const display = Chakra_Petch({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata = {
  title: "CTRL | Coding, Technology and Robotics League",
  description: "CTRL Club events by the AASU Programming Club",
  applicationName: "CTRL",
  icons: { icon: "/icon.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "CTRL", statusBarStyle: "black" },
};

export const viewport = {
  themeColor: "#00032E",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <ToastContainer theme="dark" position="top-right" />
        </AuthProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
