import './globals.css';

export const metadata = {
  title: 'Accentry — Pronounce your own language',
  description: 'Speak your own phrases. Get graded. Improve fast.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
