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

async function checkTable() {
    console.log('--- address_book テーブルの確認 ---')
    
    // データ1件取得してカラムを確認
    const { data, error } = await supabase
        .from('address_book')
        .select('*')
        .limit(1)

    if (error) {
        console.error('エラー:', error)
        return
    }

    if (data && data.length > 0) {
        console.log('カラム一覧:', Object.keys(data[0]))
        console.log('embedding カラムの値があるか:', !!data[0].embedding)
    } else {
        console.log('データがありません')
    }

    // 統計
    const { count, error: countError } = await supabase
        .from('address_book')
        .select('*', { count: 'exact', head: true })
    
    const { count: embeddedCount, error: embeddedCountError } = await supabase
        .from('address_book')
        .select('*', { count: 'exact', head: true })
        .not('embedding', 'is', null)

    console.log(`全データ件数: ${count}`)
    console.log(`embeddingあり件数: ${embeddedCount}`)
}

checkTable().catch(console.error)
