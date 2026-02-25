'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
    const supabase = (await createClient()) as any

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?message=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = (await createClient()) as any

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const companyName = formData.get('companyName') as string
    const lastName = formData.get('lastName') as string

    if (!email || !password || !companyName || !lastName) {
        redirect('/login?message=' + encodeURIComponent('すべての項目を入力してください'))
    }

    const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        redirect('/login?message=' + encodeURIComponent(error.message))
    }

    if (user) {
        const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error: updateError } = await adminClient
            .from('profiles')
            .update({
                company_name: companyName,
                last_name: lastName
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Signup profile update error:', updateError)
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signout() {
    const supabase = (await createClient()) as any
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
