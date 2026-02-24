'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createShippingRequest(formData: any) {
    const supabase = (await createClient()) as any

    // セッション取得
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('ログインしていません')
    }

    let addressId = formData.selectedAddress

    // 1. 住所が新規（ID指定なし）の場合、address_bookに登録
    if (!addressId) {
        const { data: newAddr, error: addrErr } = await supabase
            .from('address_book')
            .insert({
                company_name: formData.companyName,
                contact_name: formData.contactName,
                department: formData.department,
                postal_code: formData.zipCode,
                address: formData.address,
                user_id: formData.saveToAddressBook ? user.id : null // 「保存する」にチェックがない場合は共通マスタとして扱うか、個人に紐付けない
            })
            .select()
            .single()

        if (addrErr) {
            console.error('Address Insert Error:', addrErr)
            throw new Error('住所の保存に失敗しました')
        }
        addressId = newAddr.id
    }

    // 2. 発送依頼データを登録
    // ※商品は [{ product_id, quantity }] の形式を想定
    const { data: shippingData, error: shipErr } = await supabase
        .from('shipping_data')
        .insert({
            address_id: addressId,
            products: formData.products,
            delivery_date: formData.deliveryDate,
            delivery_time: formData.deliveryTime,
            created_by: user.id,
            status: 'draft' // 初期ステータス
        })
        .select()
        .single()

    if (shipErr) {
        console.error('Shipping Data Insert Error:', shipErr)
        throw new Error('発送データの保存に失敗しました')
    }

    revalidatePath('/')
    return { success: true, id: shippingData.id }
}
