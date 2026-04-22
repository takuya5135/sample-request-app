import { parseShippingRequest } from '../app/requests/new/ai-action'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function test() {
    try {
        const res1 = await parseShippingRequest('山田さんに明後日着で商品を送りたい', [])
        if (res1.success) {
            console.log('Test 1 (明後日):', res1.data.delivery_date)
        } else {
            console.error('Test 1 failed:', res1.error)
        }

        const res2 = await parseShippingRequest('来週の水曜日に送ってください', [])
        if (res2.success) {
            console.log('Test 2 (来週の水曜):', res2.data.delivery_date)
        } else {
            console.error('Test 2 failed:', res2.error)
        }

        const res3 = await parseShippingRequest('なる早で', [])
        if (res3.success) {
            console.log('Test 3 (なる早で):', res3.data.delivery_date)
        } else {
            console.error('Test 3 failed:', res3.error)
        }
    } catch (e) {
        console.error(e)
    }
}


test()
