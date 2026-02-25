'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function updateProfile(formData: { companyName: string, lastName: string }) {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'ログインが必要です' }
    }

    // Bypass RLS to guarantee profile updates
    const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminClient
        .from('profiles')
        .update({
            company_name: formData.companyName,
            last_name: formData.lastName
        })
        .eq('id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Update Profile Error:', error)
        return { success: false, error: `データベースエラー: ${error.message || '更新に失敗しました'}` }
    }

    // 更新後に画面全体に変更を反映
    revalidatePath('/')
    return { success: true }
}
