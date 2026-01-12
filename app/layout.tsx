import { Inter, Outfit } from "next/font/google";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";
import styles from "./layout.module.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://blog-do-eliezer.vercel.app'),
  title: "Blog do Eliezer - Programação Web e Desenvolvimento",
  description: "Um blog minimalista e moderno sobre programação web, desenvolvimento de software e tecnologias. Compartilhando ideias, códigos e experiências.",
  keywords: ["programação", "web", "desenvolvimento", "javascript", "react", "next.js", "firebase"],
  openGraph: {
    title: "Blog do Eliezer - Programação Web e Desenvolvimento",
    description: "Um blog minimalista e moderno sobre programação web, desenvolvimento de software e tecnologias.",
    type: "website",
    url: "https://blog-do-eliezer.vercel.app",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Blog do Eliezer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog do Eliezer - Programação Web e Desenvolvimento",
    description: "Um blog minimalista e moderno sobre programação web, desenvolvimento de software e tecnologias.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${outfit.variable} ${styles.body}`}
      >
        <AuthProvider>
          <Header />
          <main className={styles.main}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
