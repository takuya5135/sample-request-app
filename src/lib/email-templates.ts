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
    products: { mdCode: string, productName: string, quantity: number, specification?: string, unit?: string }[]
    userCompanyName: string // システムユーザーの会社名
    userLastName: string // システムユーザーの姓
}

// 機能1: サンプル発送依頼メールの生成 (社内向け)
export function generateInternalRequestEmail(data: EmailRequestData) {
    const subject = `【サンプル手配依頼】 ${data.companyName}様 ${data.deliveryDate}着`

    const productList = data.products
        .map(p => `・${p.mdCode} ${p.productName} ${p.specification || ''} ${p.quantity}${p.unit || ''}`)
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
        .map(p => `・${p.productName} ${p.specification || ''} x ${p.quantity}${p.unit || ''}`)
        .join('\n')

    // 日付を「〇月〇日」形式に変換
    const dateObj = new Date(data.deliveryDate)
    const formattedDate = !isNaN(dateObj.getTime())
        ? `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`
        : data.deliveryDate

    const body = `${data.companyName}
${data.department || ''}
${data.lastName} 様

ご依頼いただいておりましたサンプルの手配が完了いたしました。
以下の内容でお届け予定です。

【お届け予定日】
${formattedDate} ${data.deliveryTime}

【お届けする商品】
${productList}

到着まで今しばらくお待ちくださいませ。
ご不明な点がございましたら、お気軽にご連絡ください。

引き続きよろしくお願い申し上げます。

--------------------------------------------------
${data.userCompanyName || 'ジャパン・フード・サービス'}
${data.userLastName}
--------------------------------------------------`

    return { subject, body }
}

// 機能4: サンプル発送フォローアップメールの生成 (社外向け)
export function generateCustomerFollowupEmail(data: EmailRequestData) {
    const subject = `【ご確認】先日お送りしたサンプルの件につきまして`

    const productList = data.products
        .map(p => `・${p.productName} ${p.specification || ''}`)
        .join('\n')

    const body = `${data.companyName}
${data.department || ''}
${data.lastName} 様

先日お送りいたしましたサンプルにつきまして、その後いかがでしたでしょうか。
もしよろしければ、社内でのご評価やご意見などをお聞かせいただけますと幸いです。

【お送りした商品】
${productList}

調理方法や歩留まり、その他ご不明な点がございましたら、いつでもサポートさせていただきます。
ご検討のほど、何卒よろしくお願い申し上げます。

--------------------------------------------------
${data.userCompanyName || 'ジャパン・フード・サービス'}
${data.userLastName}
--------------------------------------------------`

    return { subject, body }
}

export function createMailtoLink(to: string, subject: string, body: string) {
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
