'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: { companyName: string, lastName: string }) {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('ログインが必要です')
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            company_name: formData.companyName,
            last_name: formData.lastName
        })
        .eq('id', user.id)

    if (error) {
        console.error('Update Profile Error:', error)
        throw new Error('プロフィールの更新に失敗しました')
    }

    // 更新後に画面全体に変更を反映
    revalidatePath('/')
    return { success: true }
}
