import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { ExcelImportButton } from './excel-import-button'
import { TemplateDownloadButton } from './template-download-button'
import { DeleteProductButton } from './delete-button'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    let userProfile: any = null
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (profile) {
            userProfile = {
                id: profile.id,
                email: profile.email || user.email,
                company_name: profile.company_name || '',
                last_name: profile.last_name || '',
                role: profile.role || 'user'
            }
        } else {
            userProfile = { email: user.email }
        }
    }

    // Role check for products
    const isAdmin = userProfile?.role === 'admin'

    // 商品リストデータの取得
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('md_code', { ascending: true })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header profile={userProfile} />

            <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">商品リスト</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            サンプルとして発送可能な商品マスタを管理します。
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <TemplateDownloadButton />
                        <ExcelImportButton />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>登録済み商品一覧</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && <p className="text-red-500 text-sm mb-4">エラーが発生しました: {error.message}</p>}

                        {products && products.length === 0 ? (
                            <p className="text-gray-500 text-sm">登録されている商品データがありません。</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>MDコード</TableHead>
                                        <TableHead>商品名</TableHead>
                                        <TableHead>規格</TableHead>
                                        <TableHead>単位</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products?.map((product: any) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.md_code}</TableCell>
                                            <TableCell>{product.product_name}</TableCell>
                                            <TableCell>{product.specification}</TableCell>
                                            <TableCell>{product.unit}</TableCell>
                                            <TableCell>
                                                <DeleteProductButton id={product.id} />
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
