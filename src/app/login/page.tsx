import { AuthForm } from './auth-form'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const message = typeof resolvedParams?.message === 'string' ? resolvedParams.message : null

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
            <AuthForm message={message} />
        </div>
    )
}
