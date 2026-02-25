import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { RequestList } from './request-list'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()

  let mappedRequests: any[] = []
  let userProfile: any = null

  if (user) {
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    userProfile = profileData || { email: user.email }

    // 発送依頼データと住所録を結合して取得
    const { data: shippingData } = await supabase
      .from('shipping_data')
      .select('*, address_book(*)')
      .order('created_at', { ascending: false })
      .limit(50)

    // 全商品をフェッチしてルックアップマップを作成 (件数が少ない想定)
    const { data: products } = await supabase.from('products').select('*')
    const productMap = new Map<string, any>((products || []).map((p: any) => [p.id, p]))

    if (shippingData) {
      mappedRequests = shippingData.map((req: any) => {
        // req.products is an array of { product_id, quantity }
        const parsedItems = typeof req.products === 'string' ? JSON.parse(req.products) : req.products
        const mappedProducts = (parsedItems || []).map((item: any) => {
          const productDetail = productMap.get(item.product_id) as any
          return {
            mdCode: productDetail?.md_code || '',
            productName: productDetail?.product_name || '不明な商品',
            quantity: item.quantity
          }
        })

        return {
          ...req,
          mappedProducts
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header profile={userProfile} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-sm text-gray-600">
            サンプルの発送依頼やデータの管理を行います。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>サンプル発送依頼</CardTitle>
              <CardDescription>
                新しいサンプルの発送データを作成し、依頼メールを生成します。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/requests/new" className="w-full">
                <Button className="w-full">
                  新規作成
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>マスタデータ管理</CardTitle>
              <CardDescription>
                送り先住所録や商品リストの閲覧・編集を行います。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/address-book" className="w-full">
                <Button variant="outline" className="w-full">
                  住所録の管理
                </Button>
              </Link>
              <Link href="/products" className="w-full">
                <Button variant="outline" className="w-full">
                  商品リストの管理
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {user && (
          <RequestList
            requests={mappedRequests}
            currentUserEmail={user.email || 'user@example.com'}
            userProfile={userProfile}
          />
        )}
      </main>
    </div>
  )
}
