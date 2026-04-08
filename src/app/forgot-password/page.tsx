import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { resetPassword } from './actions'

export default async function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; success?: string }>
}) {
    const params = await searchParams

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
            <Card>
                <form action={resetPassword}>
                    <CardHeader>
                        <CardTitle className="text-2xl">パスワードをお忘れですか？</CardTitle>
                        <CardDescription>
                            登録済みのメールアドレスを入力してください。パスワード再設定用のメールをお送りします。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                        </div>
                        {params.message && (
                            <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm">
                                {params.message}
                            </div>
                        )}
                        {params.success && (
                            <div className="p-3 bg-green-100 border border-green-200 text-green-600 rounded-md text-sm">
                                パスワード再設定用のメールを送信しました。メールボックスを確認してください。
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full">
                            リセットメールを送信
                        </Button>
                        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 underline text-center">
                            ログイン画面へ戻る
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
