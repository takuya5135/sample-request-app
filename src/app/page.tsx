import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header email={user?.email} />

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
      </main>
    </div>
  )
}
