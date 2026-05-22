import Nav from '@/components/ui/Nav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="pt-14 min-h-screen">{children}</main>
    </>
  )
}
