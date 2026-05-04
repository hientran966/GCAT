import "antd/dist/reset.css";
import AuthGate from "@/components/common/auth-gate";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
