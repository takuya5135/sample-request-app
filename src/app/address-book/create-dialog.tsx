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
import { Textarea } from '@/components/ui/textarea'
import { createAddress } from './actions'
import { parseAddressInfo } from './ai-action'
import { fetchAddressByZipcode } from '@/lib/zipcode'

export function CreateAddressDialog() {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        company_name: '',
        department: '',
        postal_code: '',
        address_: '',
        last_name: '',
        first_name: '',
        email: '',
        phone: ''
    })

    const [aiInputText, setAiInputText] = useState('')
    const [aiImageBase64, setAiImageBase64] = useState<string | null>(null)
    const [aiMimeType, setAiMimeType] = useState<string | null>(null)
    const [aiImageName, setAiImageName] = useState<string | null>(null)
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [showAiPanel, setShowAiPanel] = useState(false)

    const handleAiInput = async () => {
        if (!aiInputText && !aiImageBase64) {
            alert('テキストか名刺画像を入力してください。')
            return
        }
        setIsAiLoading(true)
        try {
            const res = await parseAddressInfo(
                aiInputText || undefined,
                aiImageBase64 || undefined,
                aiMimeType || undefined
            )
            setFormData(prev => ({ ...prev, ...res }))
            setAiInputText('')
            setAiImageBase64(null)
            setAiMimeType(null)
            setAiImageName(null)
            setShowAiPanel(false)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsAiLoading(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        handleFileSelect(file)
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile()
                if (file) {
                    e.preventDefault() // デフォルトの貼り付け動作をキャンセル（不要な場合は削除可能）
                    handleFileSelect(file)
                    break
                }
            }
        }
    }

    const handleFileSelect = (file?: File | null) => {
        if (!file) return
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択またはペーストしてください')
            return
        }

        // 念のためフロント側でもファイルサイズのチェック（4MB制限。Vercelの5MB上限に余裕を持たせる）
        const MAX_SIZE_MB = 4
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert('画像サイズが大きすぎます。画質を落としてお試しください。')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const result = reader.result as string
            const base64Data = result.split(',')[1]
            setAiImageBase64(base64Data)
            setAiMimeType(file.type)
            setAiImageName(`クリップボードの画像 (${new Date().toLocaleTimeString()})`)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.company_name || !formData.last_name || !formData.phone) {
            alert('会社名、姓、電話番号は必須です。')
            return
        }

        startTransition(async () => {
            try {
                const result = await createAddress({
                    ...formData,
                    address: formData.address_
                })

                if (result.success) {
                    alert('新しい住所データを登録しました。')
                    setOpen(false) // ダイアログを閉じる
                    // フォームリセット
                    setFormData({
                        company_name: '', department: '', postal_code: '',
                        address_: '', last_name: '', first_name: '', email: '', phone: ''
                    })
                } else {
                    alert(result.error)
                }
            } catch (err: any) {
                alert('予期せぬエラーが発生しました')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>新規追加</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>住所データの新規登録</DialogTitle>
                    </DialogHeader>

                    {!showAiPanel && (
                        <div className="py-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 jumpy-animation"
                                onClick={() => setShowAiPanel(true)}
                            >
                                ✨ AIで自動入力 (名刺画像・メール署名)
                            </Button>
                        </div>
                    )}

                    {showAiPanel && (
                        <div
                            className="border border-indigo-100 rounded-lg p-3 my-4 bg-indigo-50/50 space-y-3"
                            onPaste={handlePaste}
                        >
                            <div className="flex justify-between items-center">
                                <Label className="font-semibold text-indigo-900">✨ AI自動入力</Label>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAiPanel(false)} className="h-6 px-2 text-xs">閉じる</Button>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">メールの署名などをコピーして貼り付け</Label>
                                <Textarea
                                    className="text-xs min-h-[60px]"
                                    placeholder="株式会社まるまる&#13;&#10;営業部 山田太郎&#13;&#10;東京都..."
                                    value={aiInputText}
                                    onChange={(e) => setAiInputText(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">または名刺画像をアップロード<span className="text-indigo-500 font-normal ml-2">(Ctrl+Vで直接貼付も可能)</span></Label>
                                <Input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs" />
                                {aiImageName && <p className="text-xs text-green-600 truncate mt-1">選択中: {aiImageName}</p>}
                                {aiImageBase64 && aiMimeType && (
                                    <div className="mt-2 flex justify-center p-1 bg-white border border-gray-200 rounded-md shadow-sm">
                                        <img
                                            src={`data:${aiMimeType};base64,${aiImageBase64}`}
                                            alt="アップロード画像のプレビュー"
                                            className="max-h-[140px] w-auto object-contain rounded-sm"
                                        />
                                    </div>
                                )}
                            </div>
                            <Button type="button" className="w-full" disabled={isAiLoading} onClick={handleAiInput}>
                                {isAiLoading ? '解析中...' : '解析してフォームに入力'}
                            </Button>
                        </div>
                    )}


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
                            <Label htmlFor="firstName" className="text-right text-xs">名</Label>
                            <Input
                                id="firstName"
                                value={formData.first_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="zip" className="text-right text-xs">郵便番号</Label>
                            <Input
                                id="zip"
                                value={formData.postal_code}
                                onChange={async (e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({ ...prev, postal_code: val }));
                                    const clean = val.replace(/[^0-9]/g, '');
                                    if (clean.length === 7) {
                                        const address = await fetchAddressByZipcode(clean);
                                        if (address) {
                                            setFormData(prev => ({ ...prev, address_: address }));
                                        }
                                    }
                                }}
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
                                placeholder="sample@example.com"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? '保存中...' : '登録'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
