import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { DeleteAddressButton } from './delete-button'
import { EditAddressDialog } from './edit-dialog'
import { CreateAddressDialog } from './create-dialog'

import { DuplicateAddressDialog } from './duplicate-dialog'

export default async function AddressBookPage() {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    // 住所録データの取得（削除済みのものは除外）
    const { data: addresses, error } = await supabase
        .from('address_book')
        .select('*')
        .neq('is_deleted', true)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header email={user?.email} />

            <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">住所録</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            サンプル発送先の企業や担当者の情報を管理します。
                        </p>
                    </div>
                    <CreateAddressDialog />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>登録済み一覧</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && <p className="text-red-500 text-sm mb-4">エラーが発生しました: {error.message}</p>}

                        {addresses && addresses.length === 0 ? (
                            <p className="text-gray-500 text-sm">登録されている住所データがありません。</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>会社名</TableHead>
                                        <TableHead>部署名</TableHead>
                                        <TableHead>氏名</TableHead>
                                        <TableHead>電話番号</TableHead>
                                        <TableHead className="w-[120px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {addresses?.map((address: any) => (
                                        <TableRow key={address.id}>
                                            <TableCell className="font-medium">{address.company_name}</TableCell>
                                            <TableCell>{address.department}</TableCell>
                                            <TableCell>{address.contact_name}</TableCell>
                                            <TableCell>{address.phone}</TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-1">
                                                <DuplicateAddressDialog address={address} />
                                                <EditAddressDialog address={address} />
                                                <DeleteAddressButton id={address.id} />
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
