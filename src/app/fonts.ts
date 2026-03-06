import { Dosis, Inter } from 'next/font/google'

export const dosis = Dosis({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dosis',
  weight: ['400', '700'], // Beispiel: Regular + Bold
})

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '700'], // optional: anpassen falls du andere brauchst
})
