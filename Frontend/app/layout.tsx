import "./globals.css";
import "katex/dist/katex.min.css";


export const metadata = { title: "AI Stock Assistant", description: "AI-powered stock market research assistant" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
