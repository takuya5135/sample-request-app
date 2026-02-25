import { signout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { ProfileDialog } from './profile-dialog'
import { HelpDialog } from './help-dialog'
import Link from 'next/link'

export function Header({ profile }: { profile?: any }) {
    return (
        <header className="bg-white border-b sticky top-0 z-10">
            <div className="flex h-16 items-center justify-between px-4 max-w-5xl mx-auto w-full">
                <Link href="/" className="font-semibold text-lg flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {/* Simple Logo Placeholder */}
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                        S
                    </div>
                    サンプル依頼支援アプリ
                </Link>

                {profile?.email && (
                    <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-sm text-gray-600 hidden sm:inline-block truncate max-w-[200px]">
                            {profile.company_name ? `${profile.company_name} ${profile.last_name}` : profile.email}
                        </span>
                        <HelpDialog />
                        <ProfileDialog profile={profile} />
                        <form action={signout}>
                            <Button variant="outline" size="sm">ログアウト</Button>
                        </form>
                    </div>
                )}
            </div>
        </header>
    )
}
