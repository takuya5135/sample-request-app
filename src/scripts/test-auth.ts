import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// ローカルの .env.local から環境変数を読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('エラー: SUPABASE_URL または SUPABASE_ANON_KEY が設定されていません。')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
    console.log(`接続先のSupabase URL: ${supabaseUrl}`)
    console.log('--- サインインのテスト ---')

    // テスト用のログイン処理
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'hata@japanfoodservice.co.jp',
        password: 'hata' // <- 先ほど設定されたパスワードを指定してください（異なる場合は変更）
    })

    if (error) {
        console.error('❌ サインイン失敗:')
        console.error(error)
    } else {
        console.log('✅ サインイン成功!')
        console.log('User ID:', data.user?.id)
    }
}

testAuth().catch(console.error)
