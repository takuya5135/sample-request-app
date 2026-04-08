import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { updatePassword } from './actions'

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const params = await searchParams

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
            <Card>
                <form action={updatePassword}>
                    <CardHeader>
                        <CardTitle className="text-2xl">新しいパスワードの設定</CardTitle>
                        <CardDescription>
                            新しいパスワードを入力してください。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">新しいパスワード</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">パスワードの確認</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required />
                        </div>
                        {params.message && (
                            <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm">
                                {params.message}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            パスワードを更新
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
