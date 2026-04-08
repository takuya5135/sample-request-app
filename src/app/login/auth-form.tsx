'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { login, signup } from './actions'

export function AuthForm({ message }: { message: string | null }) {
    const [isLogin, setIsLogin] = useState(true)
    const router = useRouter()

    return (
        <Card className="w-full max-w-sm">
            <form action={isLogin ? login : signup}>
                <CardHeader>
                    <CardTitle className="text-2xl">{isLogin ? 'ログイン' : 'ユーザー登録'}</CardTitle>
                    <CardDescription>
                        {isLogin
                            ? 'メールアドレスとパスワードを入力してログインしてください。'
                            : '必要な情報を入力して、新しいアカウントを作成してください。'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="companyName">会社名</Label>
                                <Input id="companyName" name="companyName" required={!isLogin} placeholder="株式会社サンプル" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">氏名（姓）</Label>
                                <Input id="lastName" name="lastName" required={!isLogin} placeholder="山田" />
                            </div>
                        </>
                    )}
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
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full">
                        {isLogin ? 'ログイン' : 'アカウントを登録'}
                    </Button>
                    {isLogin ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-indigo-600 hover:text-indigo-800 underline w-full text-center"
                            >
                                アカウントをお持ちでない方はこちら（新規登録）
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/forgot-password')}
                                className="text-sm text-gray-500 hover:text-gray-700 underline w-full text-center mt-2"
                            >
                                パスワードを忘れた場合はこちら
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 underline w-full text-center"
                        >
                            すでにアカウントをお持ちの方はこちら（ログイン）
                        </button>
                    )}
                </CardFooter>
            </form>
        </Card>
    )
}
