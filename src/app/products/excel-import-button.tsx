'use client'

import { useState, useTransition, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { importProducts } from './actions'
import * as XLSX from 'xlsx'

export function ExcelImportButton() {
    const [isPending, startTransition] = useTransition()
    const [isImporting, setIsImporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsImporting(true)
        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            // Excelカラム名とマッチさせる
            const formattedData = jsonData.map((row: any) => ({
                md_code: String(row['MDコード'] || row['MDCode'] || row['md_code'] || ''),
                product_name: String(row['商品名'] || row['ProductName'] || row['product_name'] || ''),
                specification: String(row['規格'] || row['Spec'] || row['specification'] || ''),
                unit: String(row['単位'] || row['Unit'] || row['unit'] || '個')
            })).filter(r => r.md_code && r.product_name)

            if (formattedData.length === 0) {
                alert('インポート可能なデータがありません。Excelの1行目に「MDコード」「商品名」「規格」「単位」の列があるか確認してください。')
                return
            }

            startTransition(async () => {
                try {
                    const result = await importProducts(formattedData)
                    if (result.success) {
                        alert(`${formattedData.length}件の商品データを登録・更新しました。`)
                    }
                } catch (err: any) {
                    alert(err.message)
                } finally {
                    setIsImporting(false)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                }
            })
        } catch (error) {
            console.error(error)
            alert('ファイルの読み込みに失敗しました。')
            setIsImporting(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div>
            <input
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending || isImporting}
                className="bg-green-600 hover:bg-green-700 text-white"
            >
                {isPending || isImporting ? 'インポート中...' : 'Excel一括登録'}
            </Button>
        </div>
    )
}
