import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Meeting Room Manager',
  description: 'Book and manage meeting rooms efficiently',
  keywords: 'meeting rooms, booking, office management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          
          {children}
        </Providers>
      </body>
    </html>
  )
}
