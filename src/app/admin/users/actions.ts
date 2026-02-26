'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleApproval(userId: string, currentStatus: boolean) {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'ログインが必要です。' }
    }

    // 実行者が admin か確認
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!adminProfile || adminProfile.role !== 'admin') {
        return { success: false, message: '管理者権限がありません。' }
    }

    // 状態を更新
    const { error } = await supabase
        .from('profiles')
        .update({ is_approved: !currentStatus })
        .eq('id', userId)

    if (error) {
        return { success: false, message: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
