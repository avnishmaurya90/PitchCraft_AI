import "./globals.css";

export const metadata = {
  title: "PitchCraft AI",
  description: "Generate winning proposals",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body  cz-shortcut-listen="true">
        {children}
      </body>
    </html>
  );
}