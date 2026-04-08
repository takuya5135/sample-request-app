'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function resetPassword(formData: FormData) {
    const email = formData.get('email') as string
    const supabase = (await createClient()) as any
    const origin = (await headers()).get('origin')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
        return redirect(`/forgot-password?message=${encodeURIComponent(error.message)}`)
    }

    return redirect(`/forgot-password?success=true`)
}
