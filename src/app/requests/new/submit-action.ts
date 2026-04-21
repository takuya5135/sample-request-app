'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createShippingRequest(formData: any) {
    try {
        const supabase = (await createClient()) as any

        // セッション取得
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: 'ログインしていません。セッションが切れた可能性があります。' }
        }

        let addressId = formData.selectedAddress

        // 1. 住所が新規（ID指定なし）の場合、address_bookに登録
        if (!addressId) {
            if (!formData.phone) {
                return { success: false, error: '送り先の電話番号は必須です' }
            }

            const { data: newAddr, error: addrErr } = await supabase
                .from('address_book')
                .insert({
                    company_name: formData.companyName,
                    last_name: formData.lastName,
                    first_name: formData.firstName,
                    department: formData.department,
                    postal_code: formData.zipCode,
                    address: formData.address,
                    phone: formData.phone,
                    user_id: formData.saveToAddressBook ? user.id : null 
                })
                .select()
                .single()

            if (addrErr) {
                console.error('Address Insert Error:', addrErr)
                return { success: false, error: '住所の保存に失敗しました。詳細: ' + addrErr.message }
            }
            addressId = newAddr.id
        }

        // 2. 発送依頼データを登録
        const { data: shippingData, error: shipErr } = await supabase
            .from('shipping_data')
            .insert({
                address_id: addressId,
                products: formData.products,
                delivery_date: formData.deliveryDate,
                delivery_time: formData.deliveryTime,
                created_by: user.id,
                status: 'draft' 
            })
            .select()
            .single()

        if (shipErr) {
            console.error('Shipping Data Insert Error:', shipErr)
            return { success: false, error: '発送データの保存に失敗しました。詳細: ' + shipErr.message }
        }

        revalidatePath('/')
        return { success: true, id: shippingData.id }
    } catch (err: any) {
        console.error('Submit Action Unexpected Error:', err)
        return { success: false, error: '予期せぬエラーが発生しました: ' + (err.message || '不明なエラー') }
    }
}

