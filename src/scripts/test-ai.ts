import { parseShippingRequest } from '../app/requests/new/ai-action'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function test() {
    try {
        const res1 = await parseShippingRequest('山田さんに明後日着で商品を送りたい', [], [])
        console.log('Test 1 (明後日):', res1.delivery_date)

        const res2 = await parseShippingRequest('来週の水曜日に送ってください', [], [])
        console.log('Test 2 (来週の水曜):', res2.delivery_date)

        const res3 = await parseShippingRequest('なる早で', [], [])
        console.log('Test 3 (なる早で):', res3.delivery_date)
    } catch (e) {
        console.error(e)
    }
}

test()
