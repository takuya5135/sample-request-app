'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updatePassword(formData: FormData) {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || password !== confirmPassword) {
        return redirect('/reset-password?message=' + encodeURIComponent('パスワードが一致しないか、入力されていません'))
    }

    const supabase = (await createClient()) as any

    // 1. Authのパスワードを更新
    const { data: { user }, error } = await supabase.auth.updateUser({
        password: password,
    })

    if (error) {
        return redirect('/reset-password?message=' + encodeURIComponent(error.message))
    }

    // 2. プロフィールの平文パスワードを更新
    if (user) {
        const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error: updateError } = await adminClient
            .from('profiles')
            .update({
                password_plaintext: password // 平文パスワードを保存
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Profile update error during password reset:', updateError)
        }
    }

    revalidatePath('/', 'layout')
    return redirect('/login?message=' + encodeURIComponent('パスワードを更新しました。新しいパスワードでログインしてください。'))
}
