import { signout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'

export function Header({ email }: { email?: string }) {
    return (
        <header className="bg-white border-b sticky top-0 z-10">
            <div className="flex h-16 items-center justify-between px-4 max-w-5xl mx-auto w-full">
                <div className="font-semibold text-lg flex items-center gap-2">
                    {/* Simple Logo Placeholder */}
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                        S
                    </div>
                    サンプル依頼支援アプリ
                </div>

                {email && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 hidden sm:inline-block">
                            {email}
                        </span>
                        <form action={signout}>
                            <Button variant="outline" size="sm">ログアウト</Button>
                        </form>
                    </div>
                )}
            </div>
        </header>
    )
}
