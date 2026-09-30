import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'BrandCash — negócio enxuto, marca rentável',
  description: 'Seu plano de implementação, da especialidade à escala.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
