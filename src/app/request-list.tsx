'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { EmailRequestData, generateInternalRequestEmail, generateCustomerNoticeEmail, generateCustomerFollowupEmail, createMailtoLink } from '@/lib/email-templates'
import { Mail, FileText } from 'lucide-react'

type RequestListProps = {
    requests: any[]
    currentUserEmail: string
    userProfile?: any
}

export function RequestList({ requests, currentUserEmail, userProfile }: RequestListProps) {
    const userLastName = userProfile?.last_name || ''
    const userCompanyName = userProfile?.company_name || ''

    const handleEmailAction = (type: 'internal' | 'notice' | 'followup', req: any, internalOptions?: { type: 'self' | 'delivery', prefix?: string }) => {
        const data: EmailRequestData = {
            companyName: req.address_book?.company_name || '企業名不明',
            department: req.address_book?.department || '',
            lastName: req.address_book?.last_name || '担当者名不明',
            firstName: req.address_book?.first_name || '',
            postalCode: req.address_book?.postal_code || '',
            address: req.address_book?.address || '',
            phone: req.address_book?.phone || '',
            deliveryDate: req.delivery_date,
            deliveryTime: req.delivery_time === 'am' ? '午前中' : req.delivery_time,
            products: req.mappedProducts || [],
            userCompanyName: userCompanyName,
            userLastName: userLastName
        }

        let subject = ""
        let body = ""
        let to = ""

        if (type === 'internal') {
            const res = generateInternalRequestEmail(data)
            if (internalOptions?.type === 'delivery') {
                subject = `${internalOptions.prefix} ${res.subject}`
                to = "jfkakou@japanfoodservice.co.jp"
            } else {
                subject = res.subject
                to = currentUserEmail
            }
            body = res.body
        } else if (type === 'notice') {
            const res = generateCustomerNoticeEmail(data)
            subject = res.subject
            body = res.body
            to = req.address_book?.email || ""
        } else if (type === 'followup') {
            const res = generateCustomerFollowupEmail(data)
            subject = res.subject
            body = res.body
            to = req.address_book?.email || ""
        }

        const mailtoUrl = createMailtoLink(to, subject, body, currentUserEmail)
        window.location.href = mailtoUrl
    }

    if (!requests || requests.length === 0) {
        return (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>最近の発送依頼</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">まだ発送依頼がありません。上の「新規作成」から依頼を作成してください。</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">最近の発送依頼</h2>
            {requests.map((req) => (
                <Card key={req.id} className="overflow-hidden">
                    <div className="bg-indigo-50 px-4 py-3 border-b flex justify-between items-center">
                        <div className="font-semibold text-indigo-900">
                            {req.address_book?.company_name} ({req.address_book?.last_name}様宛)
                        </div>
                        <div className="text-sm text-indigo-700">
                            着日: {req.delivery_date} ({req.delivery_time === 'am' ? '午前中' : req.delivery_time})
                        </div>
                    </div>
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">送付商品</h3>
                            <ul className="text-sm text-gray-800 space-y-1">
                                {req.mappedProducts?.map((p: any, i: number) => (
                                    <li key={i}>・[{p.mdCode}] {p.productName} x {p.quantity}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-2 justify-center">
                            <h3 className="text-sm font-semibold text-gray-500 mb-1">メール作成アクション</h3>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start border-blue-200 hover:bg-blue-50 text-blue-700"
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        手配依頼メールを作成 (社内向け)
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>手配依頼メールの宛先を選択</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-sm text-gray-700">自分へ送る場合</h4>
                                            <Button variant="outline" className="w-full justify-start bg-gray-50 hover:bg-gray-100 border-gray-300" onClick={() => handleEmailAction('internal', req, { type: 'self' })}>
                                                自分のメールアドレスで作成
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-sm text-gray-700">デリバリーに依頼する場合 <span className="text-xs font-normal text-gray-500">(jfkakou@...)</span></h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['米山', '山口', '東', '水島'].map(name => (
                                                    <Button key={name} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => handleEmailAction('internal', req, { type: 'delivery', prefix: `${name}さん` })}>
                                                        {name}さん宛で作成
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start border-green-200 hover:bg-green-50 text-green-700"
                                onClick={() => handleEmailAction('notice', req)}
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                発送お知らせメールを作成 (得意先向け)
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start border-orange-200 hover:bg-orange-50 text-orange-700"
                                onClick={() => handleEmailAction('followup', req)}
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                フォローアップを作成 (後日確認用)
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="w-full justify-start text-gray-400"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                🚧 案内書の結合PDF作成 (準備中)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
