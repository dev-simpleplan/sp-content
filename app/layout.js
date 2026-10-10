import localFont from "next/font/local";
import { Newsreader } from "next/font/google";
import "./globals.css";
import "./custom.css";
import "./responsive.css";
import LenisProvider from "./components/LenisProvider";
import Header from './components/Header';
import Footer from './components/Footer';
import AnimationProvider from "./components/AnimationProvider"
import SideRailVisibilityWatcher from "./components/SideRailVisibilityWatcher";
import { PreFooterProvider } from "./context/PreFooterContext";

const aspekta = localFont({
  variable: "--font-aspekta",
  src: [
    { path: "./fonts/Aspekta-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Aspekta-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Aspekta-700.woff2", weight: "700", style: "normal" },
  ],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata = {
  title: "SimplePlan Media | Award-Winning Branding &amp; Design Agency",
  description: "We build brands that stands the test of time - From Branding, Web Design and Development to Marketing, we do it all!",
};



export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${aspekta.variable} ${newsreader.variable}`}
    >
      <head>
        <link rel="shortcut icon" href="../public/images/favicon20.png" type="image/x-icon" />
      </head>
      <body suppressHydrationWarning>
        <SideRailVisibilityWatcher />
        <Header />
        {/* <LenisProvider><main><AnimationProvider />{children}</main></LenisProvider> */}
        <PreFooterProvider>
          <main><AnimationProvider />{children}</main>
          <Footer/>
        </PreFooterProvider>
      </body>
    </html>
  );
}