'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateAddress } from './actions'

interface EditAddressDialogProps {
    address: {
        id: string
        company_name: string
        department: string
        postal_code: string
        address: string
        last_name: string
        first_name: string
        email: string
        phone: string
    }
}

export function EditAddressDialog({ address }: EditAddressDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        company_name: address.company_name || '',
        department: address.department || '',
        postal_code: address.postal_code || '',
        address_: address.address || '',
        last_name: address.last_name || '',
        first_name: address.first_name || '',
        email: address.email || '',
        phone: address.phone || ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 必須チェック
        if (!formData.company_name || !formData.last_name || !formData.first_name || !formData.phone) {
            alert('会社名、氏名（姓・名）、電話番号は必須です。')
            return
        }

        startTransition(async () => {
            try {
                // DB更新用のアクション呼び出し
                const result = await updateAddress(address.id, {
                    ...formData,
                    address: formData.address_ // state名回避
                })

                if (result.success) {
                    alert('住所データを更新しました。')
                    setOpen(false) // ダイアログを閉じる
                }
            } catch (err: any) {
                alert(err.message)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mr-2">
                    編集
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>住所データの編集</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="company" className="text-right text-xs">会社名</Label>
                            <Input
                                id="company"
                                value={formData.company_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dept" className="text-right text-xs">部署名</Label>
                            <Input
                                id="dept"
                                value={formData.department}
                                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right text-xs">姓<span className="text-red-500 ml-1">*</span></Label>
                            <Input
                                id="lastName"
                                value={formData.last_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right text-xs">名<span className="text-red-500 ml-1">*</span></Label>
                            <Input
                                id="firstName"
                                value={formData.first_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="zip" className="text-right text-xs">郵便番号</Label>
                            <Input
                                id="zip"
                                value={formData.postal_code}
                                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right text-xs">住所</Label>
                            <Input
                                id="address"
                                value={formData.address_}
                                onChange={(e) => setFormData(prev => ({ ...prev, address_: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right text-xs">電話番号<span className="text-red-500 ml-1">*</span></Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="col-span-3"
                                placeholder="03-1234-5678"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right text-xs text-muted-foreground">メール<br />(任意)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? '保存中...' : '変更を保存'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
