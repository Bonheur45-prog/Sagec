import React from 'react'

export const metadata = {
  title: 'SAGEC Ltd CMS',
  robots: { index: false, follow: false },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  )
}
