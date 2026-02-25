import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreateAddressDialog } from './create-dialog'
import { AddressTable } from './address-table'

export const dynamic = 'force-dynamic'

export default async function AddressBookPage() {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    let userProfile: any = null
    if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (profileData) {
            userProfile = {
                id: profileData.id,
                email: profileData.email || user.email,
                company_name: profileData.company_name || '',
                last_name: profileData.last_name || ''
            }
        } else {
            userProfile = { email: user.email }
        }
    }

    // 住所録データの取得（削除済みのものは除外）
    const { data: addresses, error } = await supabase
        .from('address_book')
        .select('*')
        .neq('is_deleted', true)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header profile={userProfile} />

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

                        {!error && addresses && (
                            <AddressTable initialAddresses={addresses} />
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
