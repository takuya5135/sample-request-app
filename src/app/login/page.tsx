import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const message = typeof resolvedParams?.message === 'string' ? resolvedParams.message : null

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
            <Card className="w-full max-w-sm">
                <form>
                    <CardHeader>
                        <CardTitle className="text-2xl">ログイン</CardTitle>
                        <CardDescription>
                            メールアドレスとパスワードを入力してログインしてください。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <Input id="email" name="email" type="email" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">パスワード</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {message && (
                            <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm">
                                {message}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button className="w-full" formAction={login}>
                            ログイン
                        </Button>
                        <Button variant="outline" className="w-full" formAction={signup}>
                            ユーザー登録
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
