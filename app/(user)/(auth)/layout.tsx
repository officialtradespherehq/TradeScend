import "@/styles/globals.css";
import "../../(landingpage)/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";

export const metadata = {
  title: "TradeScend - Cryptocurrency & Stock Market Copy Trading",
  description:
    "Copy trade from expert investors and earn daily returns on your investments with our secure and reliable platform.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
