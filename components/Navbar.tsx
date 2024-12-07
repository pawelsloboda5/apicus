import Link from "next/link"
import Image from "next/image"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <div className="border-b bg-white">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/apicus_logo1_250_250.png"
              alt="API Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="font-semibold text-xl text-slate-900">Apicus</span>
          </Link>
        </div>

        <nav className="ml-6 flex items-center space-x-4">
          <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Home
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Pricing
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-sm text-slate-700">
                {session.user?.email}
              </span>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="text-sm"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => signIn('google')}
              className="text-sm"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 