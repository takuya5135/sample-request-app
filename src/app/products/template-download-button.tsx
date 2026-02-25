'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

export function TemplateDownloadButton() {
    const handleDownload = () => {
        try {
            // Excelの1行目（ヘッダー）
            const header = ['MDコード', '商品名', '規格', '単位']
            // Excelの2行目（サンプルの入力例）
            const sampleRow = ['10001', '国産鶏もも唐揚げ', '1kg', '袋']

            // ワークシートの作成
            const worksheet = XLSX.utils.aoa_to_sheet([header, sampleRow])

            // ワークブックの作成
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, '商品マスタ')

            // 列幅の調整（見やすくするため）
            worksheet['!cols'] = [
                { wch: 15 }, // MDコード
                { wch: 30 }, // 商品名
                { wch: 20 }, // 規格
                { wch: 10 }, // 単位
            ]

            // ファイルのダウンロード
            XLSX.writeFile(workbook, '商品マスタ_インポート用テンプレート.xlsx')
        } catch (error) {
            console.error('テンプレートの作成に失敗しました:', error)
            alert('テンプレートのダウンロードに失敗しました。')
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2"
        >
            <Download className="h-4 w-4" />
            フォーマットをダウンロード
        </Button>
    )
}
