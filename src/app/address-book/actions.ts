'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteAddress(id: string) {
    const supabase = (await createClient()) as any

    // セッションチェック
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('ログインが必要です')
    }

    const { error } = await supabase
        .from('address_book')
        .update({ is_deleted: true })
        .eq('id', id)

    if (error) {
        console.error('Soft Delete Address Error:', error)
        throw new Error('住所の削除に失敗しました')
    }

    revalidatePath('/address-book')
    return { success: true }
}

export async function updateAddress(id: string, data: any) {
    const supabase = (await createClient()) as any

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('ログインが必要です')

    const { error } = await supabase
        .from('address_book')
        .update({
            company_name: data.company_name,
            last_name: data.last_name,
            first_name: data.first_name,
            department: data.department,
            postal_code: data.postal_code,
            address: data.address,
            email: data.email,
            phone: data.phone
        })
        .eq('id', id)

    if (error) {
        console.error('Update Address Error:', error)
        throw new Error('住所の更新に失敗しました')
    }

    revalidatePath('/address-book')
    return { success: true }
}

export async function createAddress(data: any) {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('ログインが必要です')
    }

    const { error } = await supabase
        .from('address_book')
        .insert({
            company_name: data.company_name,
            last_name: data.last_name,
            first_name: data.first_name,
            department: data.department,
            postal_code: data.postal_code,
            address: data.address,
            email: data.email,
            phone: data.phone,
            user_id: user.id
        })

    if (error) {
        console.error('Create Address Error:', error)
        throw new Error('住所の登録に失敗しました')
    }

    revalidatePath('/address-book')
    return { success: true }
}
