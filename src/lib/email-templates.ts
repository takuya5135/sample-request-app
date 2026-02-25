export type EmailRequestData = {
    companyName: string
    department: string
    lastName: string
    firstName: string
    postalCode: string
    address: string
    phone: string
    deliveryDate: string
    deliveryTime: string
    products: { mdCode: string, productName: string, quantity: number }[]
    userLastName: string // システムを利用しているユーザーの姓（署名用）
}

// 機能1: サンプル発送依頼メールの生成 (社内向け)
export function generateInternalRequestEmail(data: EmailRequestData) {
    const subject = `【サンプル手配依頼】 ${data.companyName}様 ${data.deliveryDate}着`

    const productList = data.products
        .map(p => `・${p.mdCode} ${p.productName} x ${p.quantity}`)
        .join('\n')

    const body = `お疲れ様です。
以下の通り、サンプルの手配をお願いいたします。

【お届け先】
企業名: ${data.companyName}
部署名: ${data.department || ''}
担当者: ${data.lastName} ${data.firstName || ''} 様
郵便番号: ${data.postalCode || ''}
住所: ${data.address || ''}
電話番号: ${data.phone || ''}

【着日指定】
${data.deliveryDate}  ${data.deliveryTime}

【依頼商品】
${productList}

よろしくお願いいたします。`

    return { subject, body }
}

// 機能2: サンプル発送のお知らせメールの生成 (社外向け)
export function generateCustomerNoticeEmail(data: EmailRequestData) {
    const subject = `【ご案内】サンプルの手配につきまして`

    const productList = data.products
        .map(p => `・${p.mdCode} ${p.productName} x ${p.quantity}`)
        .join('\n')

    const body = `${data.companyName}
${data.department || ''}
${data.lastName} ${data.firstName || ''} 様

いつも大変お世話になっております。
ジャパン・フード・サービスの${data.userLastName}です。

ご依頼いただいておりましたサンプルの手配が完了いたしました。
以下の内容でお届けにあがります。

【お届け予定日】
${data.deliveryDate} ${data.deliveryTime}

【お届けする商品】
${productList}

到着まで今しばらくお待ちくださいませ。
ご不明な点がございましたら、お気軽にご連絡ください。

引き続きよろしくお願い申し上げます。`

    return { subject, body }
}

// 機能4: サンプル発送フォローアップメールの生成 (社外向け)
export function generateCustomerFollowupEmail(data: EmailRequestData) {
    const subject = `【ご確認】先日お送りしたサンプルの件につきまして`

    const productList = data.products
        .map(p => `・${p.mdCode} ${p.productName}`)
        .join('\n')

    const body = `${data.companyName}
${data.department || ''}
${data.lastName} ${data.firstName || ''} 様

いつも大変お世話になっております。
ジャパン・フード・サービスの${data.userLastName}です。

先日お送りいたしましたサンプルにつきまして、その後いかがでしたでしょうか。
もしよろしければ、社内でのご評価やご意見などをお聞かせいただけますと幸いです。

【お送りした商品】
${productList}

調理方法や歩留まり、その他ご不明な点がございましたら、いつでもサポートさせていただきます。
ご検討のほど、何卒よろしくお願い申し上げます。`

    return { subject, body }
}

export function createMailtoLink(to: string, subject: string, body: string) {
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
