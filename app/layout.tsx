import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Атопи-трекер',
  description: 'Дневник питания и кожи для детей с атопическим дерматитом',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Атопи-трекер',
  },
}

export const viewport: Viewport = {
  themeColor: '#ff7328',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'rounded-2xl shadow-lg text-sm',
            duration: 3000,
            style: {
              background: '#fff',
              color: '#374151',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#64aa68', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
