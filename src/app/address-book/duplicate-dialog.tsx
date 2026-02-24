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
import { createAddress } from './actions'
import { CopyPlus } from 'lucide-react'

interface DuplicateAddressDialogProps {
    address: {
        company_name: string
        department: string
        postal_code: string
        contact_name: string
        address: string
        email: string
        phone: string
    }
}

export function DuplicateAddressDialog({ address }: DuplicateAddressDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    // 既存データを初期値としてセット
    const [formData, setFormData] = useState({
        company_name: address.company_name || '',
        department: address.department || '',
        postal_code: address.postal_code || '',
        address_: address.address || '',
        contact_name: address.contact_name || '',
        email: address.email || '',
        phone: address.phone || ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.company_name || !formData.contact_name || !formData.phone) {
            alert('会社名、氏名、電話番号は必須です。')
            return
        }

        startTransition(async () => {
            try {
                // 編集（update）ではなく、新規作成（create/insert）として扱う
                const result = await createAddress({
                    ...formData,
                    address: formData.address_
                })

                if (result.success) {
                    alert('複製して新規登録しました。')
                    setOpen(false)
                }
            } catch (err: any) {
                alert(err.message)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (isOpen) {
                // 開くたびに元のデータをリセットしてあげる（誤って編集途中のデータが残らないように）
                setFormData({
                    company_name: address.company_name || '',
                    department: address.department || '',
                    postal_code: address.postal_code || '',
                    address_: address.address || '',
                    contact_name: address.contact_name || '',
                    email: address.email || '',
                    phone: address.phone || ''
                })
            }
            setOpen(isOpen)
        }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-indigo-600" title="複製">
                    <CopyPlus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>住所データの複製（新規登録）</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dup-company" className="text-right text-xs">会社名</Label>
                            <Input
                                id="dup-company"
                                value={formData.company_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dup-dept" className="text-right text-xs">部署名</Label>
                            <Input
                                id="dup-dept"
                                value={formData.department}
                                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dup-name" className="text-right text-xs">氏名</Label>
                            <Input
                                id="dup-name"
                                value={formData.contact_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dup-zip" className="text-right text-xs">郵便番号</Label>
                            <Input
                                id="dup-zip"
                                value={formData.postal_code}
                                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dup-address" className="text-right text-xs">住所</Label>
                            <Input
                                id="dup-address"
                                value={formData.address_}
                                onChange={(e) => setFormData(prev => ({ ...prev, address_: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dup-phone" className="text-right text-xs">電話番号<span className="text-red-500 ml-1">*</span></Label>
                            <Input
                                id="dup-phone"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dup-email" className="text-right text-xs text-muted-foreground">メール<br />(任意)</Label>
                            <Input
                                id="dup-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? '保存中...' : '登録して複製'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
