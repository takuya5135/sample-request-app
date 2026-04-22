'use client'

import React, { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete'
import { parseShippingRequest } from './ai-action'
import { createShippingRequest } from './submit-action'
import { createClient } from '@/lib/supabase/client'
import { fetchAddressByZipcode } from '@/lib/zipcode'

export const dynamic = 'force-dynamic'

export default function RequestFormPage() {
    const router = useRouter()
    const [useAI, setUseAI] = useState(false)
    const [aiInput, setAiInput] = useState('')
    const [isPending, startTransition] = useTransition()
    const [isSubmitting, setIsSubmitting] = useState(false) // 二度押し防止用ステート
    const [isRecording, setIsRecording] = useState(false) // 音声入力中ステート

    const getDefaultDeliveryDate = () => {
        const d = new Date()
        d.setDate(d.getDate() + 2)
        return d.toISOString().split('T')[0]
    }

    const [formData, setFormData] = useState({
        companyName: '',
        lastName: '',
        firstName: '',
        department: '',
        zipCode: '',
        address: '',
        phone: '',
        deliveryDate: getDefaultDeliveryDate(),
        deliveryTime: 'am',
        saveToAddressBook: false // 住所録へ保存するかどうか
    })

    const [selectedAddress, setSelectedAddress] = useState('')
    const [selectedProducts, setSelectedProducts] = useState([{ id: 1, productId: '', quantity: 1 }])

    const [addressOptions, setAddressOptions] = useState<AutocompleteOption[]>([])
    const [productOptions, setProductOptions] = useState<AutocompleteOption[]>([])
    const [userProfile, setUserProfile] = useState<any>(null)

    React.useEffect(() => {
        const fetchMasterData = async () => {
            const supabase = createClient() as any

            // ユーザープロフィールの取得
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                if (profile) {
                    if (!profile.is_approved) {
                        window.location.href = '/pending-approval'
                        return
                    }

                    setUserProfile({
                        id: profile.id,
                        email: profile.email || user.email,
                        company_name: profile.company_name || '',
                        last_name: profile.last_name || ''
                    })
                } else {
                    setUserProfile({ email: user.email })
                }
            }

            // 住所録取得
            const { data: addresses, error: addrErr } = await supabase
                .from('address_book')
                .select('*')
                .order('created_at', { ascending: false })

            if (addresses && !addrErr) {
                setAddressOptions(addresses.map((a: any) => ({
                    value: a.id,
                    label: a.company_name,
                    description: `${a.address || '住所未登録'} / 担当: ${a.last_name || ''} ${a.first_name || ''}`,
                    phone: a.phone,
                    department: a.department,
                    postal_code: a.postal_code,
                    address: a.address,
                    last_name: a.last_name,
                    first_name: a.first_name
                })))
            }

            // 商品取得
            const { data: products, error: prodErr } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            if (products && !prodErr) {
                setProductOptions(products.map((p: any) => ({
                    value: p.id,
                    label: p.product_name,
                    description: `${p.md_code || ''} ${p.specification ? `(${p.specification})` : ''}`.trim()
                })))
            }
        }
        fetchMasterData()
    }, [])

    // Speech Recognition (Web Speech API Wrapper)
    const [recognition, setRecognition] = useState<any>(null)

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("お使いのブラウザは音声入力に対応していません。")
            return
        }

        if (isRecording && recognition) {
            recognition.stop()
            return
        }

        const newRecognition = new (window as any).webkitSpeechRecognition()
        newRecognition.lang = 'ja-JP'
        newRecognition.continuous = true
        newRecognition.interimResults = false

        newRecognition.onstart = () => {
            setIsRecording(true)
        }

        newRecognition.onend = () => {
            setIsRecording(false)
        }

        newRecognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript
            setAiInput((prev) => prev + transcript)
        }

        newRecognition.start()
        setRecognition(newRecognition)
    }

    const handleAISubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            try {
                const productDataForAi = productOptions.map(opt => ({
                    id: opt.value,
                    product_name: opt.label,
                    md_code: (opt as any).description
                }));
                const result = await parseShippingRequest(aiInput, productDataForAi);

                if (!result.success) {
                    alert(result.error || 'AI解析に失敗しました。');
                    return;
                }

                const aiData = result.data;

                // AI結果の反映 (商品リストの更新)
                if (aiData.products && Array.isArray(aiData.products) && aiData.products.length > 0) {
                    const mappedProducts = aiData.products.map((p: any, idx: number) => ({
                        id: Date.now() + idx,
                        productId: p.product_id ? String(p.product_id) : '',
                        quantity: typeof p.quantity === 'number' ? p.quantity : 1
                    }));
                    setSelectedProducts(mappedProducts);
                }

                let targetId = aiData.address_id ? String(aiData.address_id) : null;

                // 【最重要】AIがIDを見つけられずテキストだけ返してきた場合の、フロントエンド側での強力な自力マッピング（部分一致検索）
                if (!targetId && aiData.company_name) {
                    console.log("AI couldn't find ID. Executing frontend fallback text search...");
                    const safeCompany = aiData.company_name.toLowerCase();
                    const safeContact = `${aiData.last_name || ''} ${aiData.first_name || ''}`.trim().toLowerCase();

                    const fallbackMatch = addressOptions.find(opt => {
                        const optLabel = opt.label.toLowerCase(); // 会社名
                        const optContact = `${(opt as any).last_name || ''} ${(opt as any).first_name || ''}`.trim().toLowerCase(); // 氏名

                        // 会社名が部分一致（互いに含んでいるか）
                        const isCompanyMatch = optLabel.includes(safeCompany) || safeCompany.includes(optLabel);
                        // 氏名が指定されている場合は氏名も部分一致するか（指定がない場合は会社名だけでOKとする）
                        const isContactMatch = safeContact ? (optContact.includes(safeContact) || safeContact.includes(optContact)) : true;

                        return isCompanyMatch && isContactMatch;
                    });

                    if (fallbackMatch) {
                        console.log("Fallback search matched!", fallbackMatch);
                        targetId = String(fallbackMatch.value);
                    }
                }

                if (targetId) {
                    console.log("Matched targetId (AI or Fallback):", targetId);
                    const matchedOption = addressOptions.find(opt => String(opt.value) === targetId) as any

                    if (matchedOption) {
                        console.log("Applying mapped address data:", matchedOption);
                        setSelectedAddress(matchedOption.value) // Autocomplete上の選択状態にする（必須）
                        setFormData(prev => ({
                            ...prev,
                            companyName: matchedOption.label || '',
                            lastName: matchedOption.last_name || '',
                            firstName: matchedOption.first_name || '',
                            department: matchedOption.department || '',
                            zipCode: matchedOption.postal_code || '',
                            address: matchedOption.address || '',
                            phone: matchedOption.phone || '',
                            deliveryDate: aiData.delivery_date || prev.deliveryDate,
                            deliveryTime: aiData.delivery_time || prev.deliveryTime
                        }))
                        return // マッチした場合はここで終了
                    }
                }

                // 完全に一致しなかった（新規）場合
                console.log("No match found. Applying as new entry.");
                setSelectedAddress('');

                // マッチしなかった場合は古い情報をクリアし、AIのテキスト解析結果だけを各項目に反映する
                setFormData(prev => ({
                    ...prev,
                    companyName: aiData.company_name || '',
                    lastName: aiData.last_name || '',
                    firstName: aiData.first_name || '',
                    department: '',
                    zipCode: '',
                    address: '',
                    phone: aiData.phone || '',
                    deliveryDate: aiData.delivery_date || prev.deliveryDate,
                    deliveryTime: aiData.delivery_time || prev.deliveryTime
                }))
            } catch (err: any) {
                alert('予期せぬエラーが発生しました: ' + err.message)
            }
        })
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isSubmitting || isPending) return // 既に送信中なら何もしない

        if (!selectedAddress) {
            if (!formData.companyName) {
                alert('送り先の会社名を入力するか、住所録から選択してください。')
                return
            }
            if (!formData.lastName) {
                alert('送り先の担当者名（姓）を入力してください。')
                return
            }
            if (!formData.phone) {
                alert('送り先の電話番号を入力してください。')
                return
            }
        }

        const validProducts = selectedProducts.filter(p => p.productId).map(p => ({
            product_id: p.productId,
            quantity: p.quantity
        }))

        if (validProducts.length === 0) {
            alert('商品を1つ以上選択してください。')
            return
        }

        if (!formData.deliveryDate) {
            alert('着日を指定してください。')
            return
        }

        setIsSubmitting(true) // 送信中フラグON

        startTransition(async () => {
            try {
                const result = await createShippingRequest({
                    ...formData,
                    selectedAddress,
                    products: validProducts
                })

                if (result.success) {
                    alert('依頼データを登録しました。')
                    router.push('/') // ダッシュボードへ戻る
                } else {
                    alert('登録に失敗しました: ' + (result.error || '不明なエラー'))
                }
            } catch (err: any) {
                alert('エラーが発生しました: ' + err.message)
            } finally {
                setIsSubmitting(false) // 成功時も失敗時もフラグOFF
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header profile={userProfile} />

            <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">サンプル発送依頼</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            新しくサンプルを手配するためのデータを登録します。
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <Button
                        variant={!useAI ? "default" : "outline"}
                        onClick={() => setUseAI(false)}
                        className="flex-1"
                    >
                        手動で入力
                    </Button>
                    <Button
                        variant={useAI ? "default" : "outline"}
                        onClick={() => setUseAI(true)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:to-indigo-700"
                    >
                        ✨ AIで自動入力 (Gemini)
                    </Button>
                </div>

                {useAI && (
                    <Card className="mb-6 border-indigo-200 shadow-sm">
                        <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-100">
                            <CardTitle className="text-lg text-indigo-900">AI入力アシスタント</CardTitle>
                            <CardDescription className="text-indigo-700">
                                「〇〇株式会社の山田さんに、商品Aを2袋、明後日の午前着で」のように入力するか、音声で話しかけてください。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleAISubmit} className="space-y-4">
                                <Textarea
                                    placeholder="送付先の情報や商品、日時を自由に入力してください..."
                                    className="min-h-[120px] resize-none"
                                    value={aiInput}
                                    onChange={(e: any) => setAiInput(e.target.value)}
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={`gap-2 transition-all ${isRecording ? 'border-red-500 bg-red-50' : ''}`}
                                        onClick={toggleVoiceInput}
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <span className={`text-lg transition-opacity ${isRecording ? 'opacity-50' : 'opacity-100'}`}>🎙️</span>
                                            {isRecording && (
                                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                                </span>
                                            )}
                                        </div>
                                        {isRecording ? '録音を停止' : '音声入力'}
                                    </Button>
                                    <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        {isPending ? '解析中...' : '解析してフォームに反映'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <form className="space-y-6" onSubmit={handleFormSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Step 1. 送り先の選択</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>住所録から検索</Label>
                                <Autocomplete
                                    options={addressOptions}
                                    value={selectedAddress}
                                    onChange={(val, opt) => {
                                        setSelectedAddress(val)
                                        if (opt) {
                                            const aOpt = opt as any
                                            setFormData(prev => ({
                                                ...prev,
                                                companyName: aOpt.label || '',
                                                lastName: aOpt.last_name || '',
                                                firstName: aOpt.first_name || '',
                                                department: aOpt.department || '',
                                                zipCode: aOpt.postal_code || '',
                                                address: aOpt.address || '',
                                                phone: aOpt.phone || ''
                                            }))
                                        }
                                    }}
                                    placeholder="会社名や担当者名で検索..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2 col-span-2">
                                    <Label>会社名</Label>
                                    <Input
                                        placeholder="例: 株式会社ジャパン・フード・サービス"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>部署名</Label>
                                    <Input
                                        placeholder="例: 営業部"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>姓 <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="例: 山田"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required={!selectedAddress}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>名</Label>
                                    <Input
                                        placeholder="例: 太郎"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>電話番号 <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="例: 03-1234-5678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required={!selectedAddress}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>郵便番号</Label>
                                    <Input
                                        placeholder="例: 123-4567"
                                        value={formData.zipCode}
                                        onChange={async (e) => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, zipCode: val }));
                                            const clean = val.replace(/[^0-9]/g, '');
                                            if (clean.length === 7) {
                                                const address = await fetchAddressByZipcode(clean);
                                                if (address) {
                                                    setFormData(prev => ({ ...prev, address: address }));
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>住所</Label>
                                    <Input
                                        placeholder="例: 東京都..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* 住所録マスタへの登録オプション (案A) */}
                            <div className="pt-4 border-t border-gray-100 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="saveToAddressBook"
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    checked={formData.saveToAddressBook}
                                    onChange={(e) => setFormData({ ...formData, saveToAddressBook: e.target.checked })}
                                />
                                <Label htmlFor="saveToAddressBook" className="text-sm font-normal text-gray-700 cursor-pointer">
                                    この送り先情報を住所録マスタにも新規登録する
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Step 2. 商品と数量の選択</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedProducts.map((p, index) => (
                                <div key={p.id} className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-end border-b border-gray-100 sm:border-0 pb-4 sm:pb-0 pt-2 sm:pt-0">
                                    <div className="space-y-2 flex-grow">
                                        <Label>商品</Label>
                                        <Autocomplete
                                            options={productOptions}
                                            value={p.productId}
                                            onChange={(val) => {
                                                const newArray = [...selectedProducts]
                                                newArray[index].productId = val
                                                setSelectedProducts(newArray)
                                            }}
                                            placeholder="商品名や規格で検索（文字を入力すると候補が出ます）..."
                                        />
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div className="space-y-2 w-24 flex-shrink-0">
                                            <Label>数量</Label>
                                            <Select
                                                value={p.quantity.toString()}
                                                onChange={(e) => {
                                                    const newArray = [...selectedProducts]
                                                    newArray[index].quantity = parseInt(e.target.value)
                                                    setSelectedProducts(newArray)
                                                }}
                                            >
                                                {[...Array(15)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                ))}
                                            </Select>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mb-px bg-gray-50 text-red-500 hover:bg-red-50"
                                            onClick={() => {
                                                if (selectedProducts.length > 1) {
                                                    setSelectedProducts(selectedProducts.filter((_, i) => i !== index))
                                                }
                                            }}
                                        >
                                            削除
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-dashed"
                                onClick={() => {
                                    setSelectedProducts([...selectedProducts, { id: Date.now(), productId: '', quantity: 1 }])
                                }}
                            >
                                + 商品を追加する
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Step 3. 着日の選択</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>着日</Label>
                                    <Input
                                        type="date"
                                        value={formData.deliveryDate}
                                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>時間帯</Label>
                                    <Select
                                        value={formData.deliveryTime}
                                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                                    >
                                        <option value="am">午前中</option>
                                        <option value="14-16">14:00-16:00</option>
                                        <option value="16-18">16:00-18:00</option>
                                        <option value="18-20">18:00-20:00</option>
                                        <option value="19-21">19:00-21:00</option>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 pb-12">
                        <Button type="button" variant="outline" onClick={() => router.push('/')}>キャンセル</Button>
                        <Button type="submit" disabled={isPending || isSubmitting} className="w-40">
                            {isPending || isSubmitting ? '保存中...' : '登録して次へ（メール）'}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}
