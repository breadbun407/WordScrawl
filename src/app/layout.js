import './globals.css'

export const metadata = {
  title: 'Writing Sprints',
  description: 'Collaborative writing sessions for novelists and game developers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}