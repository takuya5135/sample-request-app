'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/actions/profile'

export function ProfileDialog({ profile }: { profile: any }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [companyName, setCompanyName] = useState(profile?.company_name || '')
    const [lastName, setLastName] = useState(profile?.last_name || '')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const result = await updateProfile({ companyName, lastName })
            if (result.success) {
                setOpen(false)
                alert('プロフィールを更新しました')
            } else {
                setError(result.error || '不明なエラーが発生しました')
            }
        } catch (err: any) {
            setError(err.message || '通信エラー等が発生しました')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-600 gap-1 px-2">
                    <span className="w-4 h-4 leading-none text-center">👤</span>
                    <span className="text-sm">設定</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>プロフィール設定</DialogTitle>
                    <DialogDescription>
                        社外向け案内メール等の署名や、「ユーザー名」として使われる情報を設定します。
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-2 rounded text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="companyName">自社の会社名</Label>
                        <Input
                            id="companyName"
                            name="companyName"
                            placeholder="例: ジャパン・フード・サービス"
                            value={companyName}
                            onChange={e => setCompanyName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">あなたの氏名（姓のみでOK）</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            placeholder="例: 畑"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? '保存中...' : '保存'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
