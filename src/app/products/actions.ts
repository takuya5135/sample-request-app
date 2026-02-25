'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function importProducts(products: any[]) {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'ログインが必要です' }
    }

    const { error } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'md_code' })

    if (error) {
        console.error('Products Import Error:', error)
        return { success: false, error: `商品データの登録に失敗しました: ${error.message}` }
    }

    revalidatePath('/products')
    return { success: true }
}

export async function deleteProduct(id: string) {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('ログインが必要です')
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete Product Error:', error)
        throw new Error('商品の削除に失敗しました')
    }

    revalidatePath('/products')
    return { success: true }
}
