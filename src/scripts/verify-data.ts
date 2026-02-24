import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('環境変数が設定されていません。')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verify() {
    console.log('--- サンプル依頼データの確認 ---')
    const { data: requests, error: reqError } = await supabase
        .from('shipping_data')
        .select('*, address_book(*)')
        .order('created_at', { ascending: false })

    if (reqError) {
        console.error('依頼データの取得エラー:', reqError)
    } else {
        console.log(`登録件数: ${requests?.length}件`)
        if (requests && requests.length > 0) {
            console.log('最新の依頼データ:')
            const latest = requests[0]
            console.log(`  送付先: ${latest.address_book?.company_name} / ${latest.address_book?.last_name} ${latest.address_book?.first_name}`)
            console.log(`  着日: ${latest.delivery_date} ${latest.delivery_time}`)
            console.log(`  商品詳細: ${JSON.stringify(latest.products)}`)
        }
    }

    console.log('\n--- 住所録データの確認 ---')
    const { data: addresses, error: addrError } = await supabase
        .from('address_book')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    if (addrError) {
        console.error('住所録データの取得エラー:', addrError)
    } else {
        console.log('最近登録された住所 (最大5件):')
        addresses?.forEach(addr => {
            console.log(`  ${addr.company_name} / ${addr.last_name} ${addr.first_name} / ${addr.created_at}`)
        })
    }
}

verify().catch(console.error)
