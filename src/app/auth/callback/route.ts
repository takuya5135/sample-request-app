import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = (await createClient()) as any
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
            // セッション確立成功、next（デフォルトは /）へリダイレクト
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('Error exchanging code for session:', error)
        }
    }

    // エラー時はログイン画面へ
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('認証セッションの確立に失敗しました。もう一度リセットリンクを発行してください。')}`)
}
