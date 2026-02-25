export async function fetchAddressByZipcode(zipcode: string): Promise<string | null> {
    // ハイフンやスペースなどを除去
    const cleanZipcode = zipcode.replace(/[^0-9]/g, '');

    // 7桁でない場合は検索しない（無効な入力）
    if (cleanZipcode.length !== 7) {
        return null;
    }

    try {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZipcode}`);

        if (!response.ok) {
            console.error('Failed to fetch from zipcloud API:', response.statusText);
            return null;
        }

        const data = await response.json();

        if (data.status !== 200 || !data.results || data.results.length === 0) {
            // エラー時や見つからなかった場合はnullを返す（既存の入力を上書きさせないため）
            return null;
        }

        const result = data.results[0];
        // 都道府県 + 市区町村 + 町域 を結合
        return `${result.address1}${result.address2}${result.address3}`;
    } catch (error) {
        console.error('Error in fetchAddressByZipcode:', error);
        return null; // 通信エラーなどの場合も何もしない
    }
}
