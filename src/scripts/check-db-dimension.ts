import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkColumnDefinition() {
    const { data, error } = await supabase.rpc('get_column_info', { t_name: 'address_book', c_name: 'embedding' });
    if (error) {
        // RPCがない場合は直SQLを試す（もし許可されていれば）
        console.log("RPC get_column_info not found, trying raw select from information_schema");
        const { data: info, error: infoError } = await supabase
            .from('address_book')
            .select('embedding')
            .limit(1);
        
        if (infoError) console.error(infoError);
        else console.log("Can't easily get dimension from select. Please check SQL.");
    } else {
        console.log(data);
    }
}
// 実際には information_schema を叩くのが確実
async function checkViaSQL() {
    const { data, error } = await supabase.from('address_book').select('embedding').not('embedding', 'is', null).limit(1);
    if (data && data.length > 0 && data[0].embedding) {
        console.log(`Current data dimension: ${JSON.parse(data[0].embedding).length}`);
    } else {
        console.log("No embedded data found to check dimension.");
    }
}

checkViaSQL();
