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
  title: "Blog do Eliezer",
  description: "Um blog minimalista e moderno.",
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
