'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { DuplicateAddressDialog } from './duplicate-dialog'
import { EditAddressDialog } from './edit-dialog'
import { DeleteAddressButton } from './delete-button'

interface Address {
    id: string
    company_name: string
    department: string | null
    last_name: string
    first_name: string
    phone: string
    postal_code: string | null
    address: string | null
    email: string | null
    created_at: string
}

export function AddressTable({ initialAddresses }: { initialAddresses: Address[] }) {
    const [searchQuery, setSearchQuery] = useState('')

    // 検索フィルタリングロジック
    const filteredAddresses = initialAddresses.filter((address) => {
        if (!searchQuery) return true

        const query = searchQuery.toLowerCase()
        const fullName = `${address.last_name || ''} ${address.first_name || ''}`.toLowerCase()

        return (
            (address.company_name?.toLowerCase().includes(query)) ||
            (address.department?.toLowerCase().includes(query)) ||
            (fullName.includes(query)) ||
            (address.phone?.includes(query))
        )
    })

    return (
        <div className="space-y-4">
            {/* 検索バー */}
            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                    type="text"
                    placeholder="会社名、氏名、部署名で検索..."
                    className="pl-9 pr-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9 text-gray-400 hover:text-gray-900"
                        onClick={() => setSearchQuery('')}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">クリア</span>
                    </Button>
                )}
            </div>

            {/* テーブル */}
            {filteredAddresses.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                    {searchQuery ? '検索条件に一致する住所データが見つかりません。' : '登録されている住所データがありません。'}
                </div>
            ) : (
                <>
                    {/* デスクトップ用テーブル表示 */}
                    <div className="hidden md:block rounded-md border bg-white overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-[30%] font-semibold">会社名</TableHead>
                                    <TableHead className="w-[20%] font-semibold">部署名</TableHead>
                                    <TableHead className="w-[20%] font-semibold">氏名</TableHead>
                                    <TableHead className="w-[20%] font-semibold">電話番号</TableHead>
                                    <TableHead className="w-[10%] text-right font-semibold">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAddresses.map((address) => (
                                    <TableRow key={address.id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-medium text-gray-900">{address.company_name}</TableCell>
                                        <TableCell className="text-gray-600">{address.department}</TableCell>
                                        <TableCell className="text-gray-900">{address.last_name} {address.first_name}</TableCell>
                                        <TableCell className="text-gray-600 font-mono text-sm">{address.phone}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <DuplicateAddressDialog address={address as any} />
                                                <EditAddressDialog address={address as any} />
                                                <DeleteAddressButton id={address.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* スマホ用カードリスト表示 */}
                    <div className="md:hidden space-y-3">
                        {filteredAddresses.map((address) => (
                            <div key={address.id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-tight">{address.company_name}</h3>
                                        {address.department && <p className="text-sm text-gray-600 mt-1">{address.department}</p>}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <DuplicateAddressDialog address={address as any} />
                                        <EditAddressDialog address={address as any} />
                                        <DeleteAddressButton id={address.id} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 mt-2 text-sm">
                                    <div className="flex items-center">
                                        <span className="text-gray-500 w-16 shrink-0">担当者:</span>
                                        <span className="text-gray-900 font-medium">{address.last_name} {address.first_name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-500 w-16 shrink-0">TEL:</span>
                                        <span className="text-gray-600 font-mono">{address.phone}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="flex justify-between items-center text-sm text-gray-500 pt-2">
                <span>
                    全 {initialAddresses.length} 件中 {filteredAddresses.length} 件を表示
                </span>
            </div>
        </div>
    )
}
