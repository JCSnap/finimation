import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
