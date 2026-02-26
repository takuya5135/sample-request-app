import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ToggleApprovalButton } from './toggle-button'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 最新のプロファイルを取得
    const { data: currentProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (!currentProfile) {
        redirect('/login')
    }

    // admin権限チェック
    if (currentProfile.role !== 'admin') {
        redirect('/') // 管理者でなければホームへリダイレクト
    }

    const userProfile = {
        id: currentProfile.id,
        email: currentProfile.email || user.email,
        company_name: currentProfile.company_name || '',
        last_name: currentProfile.last_name || '',
        role: currentProfile.role
    }

    // 全ユーザーを取得
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header profile={userProfile} />

            <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            システムを利用するユーザーのアカウント承認を行います。
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ユーザー一覧</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && <p className="text-red-500 text-sm mb-4">エラーが発生しました: {error.message}</p>}

                        {profiles && profiles.length === 0 ? (
                            <p className="text-gray-500 text-sm">ユーザーが見つかりません。</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>メールアドレス</TableHead>
                                        <TableHead>会社名</TableHead>
                                        <TableHead>氏名</TableHead>
                                        <TableHead>ロール</TableHead>
                                        <TableHead>ステータス</TableHead>
                                        <TableHead className="w-[120px]">操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {profiles?.map((p: any) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.email}</TableCell>
                                            <TableCell>{p.company_name || '-'}</TableCell>
                                            <TableCell>{p.last_name} {p.first_name}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {p.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {p.is_approved ? (
                                                    <span className="text-green-600 font-medium">承認済</span>
                                                ) : (
                                                    <span className="text-amber-500 font-medium whitespace-nowrap">承認待ち</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {p.role !== 'admin' && (
                                                    <ToggleApprovalButton
                                                        userId={p.id}
                                                        isApproved={p.is_approved || false}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        <div className="mt-6 flex justify-start">
                            <Link href="/">
                                <Button variant="outline">ダッシュボードへ戻る</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
