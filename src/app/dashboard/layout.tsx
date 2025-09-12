import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - SecureNotes',
  description: 'Manage your secure notes and collaborate with your team',
}

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
