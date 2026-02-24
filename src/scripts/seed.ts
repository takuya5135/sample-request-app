import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// .env.localファイルを読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // RLSをバイパスするためにサービスロールキーを使用

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('環境変数が設定されていません。')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
    console.log('シードデータの投入を開始します...')

    // 1. 商品データの投入
    const products = [
        { md_code: '10001', product_name: '国産鶏もも唐揚げ', specification: '1kg', unit: '袋' },
        { md_code: '10002', product_name: 'フライドポテト(シューストリング)', specification: '1kg', unit: '袋' },
        { md_code: '10003', product_name: '業務用ハンバーグ', specification: '120g×10個', unit: '箱' },
        { md_code: '10004', product_name: '冷凍さぬきうどん', specification: '250g×5食', unit: '袋' },
        { md_code: '10005', product_name: 'むきえび(Lサイズ)', specification: '500g', unit: '袋' },
    ]

    const { error: productsError } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'md_code' }) // MDコードでコンフリクト解決

    if (productsError) {
        console.error('商品データの投入に失敗しました:', productsError)
    } else {
        console.log('商品データの投入が完了しました。')
    }

    // 2. 住所録データの投入
    const addresses = [
        {
            company_name: '株式会社サンプルテスト',
            department: '営業部',
            postal_code: '100-0001',
            address: '東京都千代田区千代田1-1-1',
            last_name: 'テスト',
            first_name: '太郎',
            phone: '03-1234-5678',
            email: 'test@example.com'
        },
        {
            company_name: 'ダミー商事株式会社',
            department: '仕入課',
            postal_code: '530-0001',
            address: '大阪府大阪市北区梅田1',
            last_name: '大阪',
            first_name: '次郎',
            phone: '06-1111-2222',
            email: 'osaka@example.com'
        }
    ]

    const { error: addressError } = await supabase
        .from('address_book')
        .insert(addresses) // テストデータなので単純な追加に変更

    if (addressError) {
        console.error('住所録データの投入に失敗しました:', addressError)
    } else {
        console.log('住所録データの投入が完了しました。')
    }

    console.log('すべてのシードデータ投入が完了しました！')
}

seed().catch(console.error)
