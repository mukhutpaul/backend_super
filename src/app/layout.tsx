import { ToastContainer } from "react-toastify";
import "./globals.css";
import ThemeProvider from "@/components/providers/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          {children}

          <ToastContainer position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}