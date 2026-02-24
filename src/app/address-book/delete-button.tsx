'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { deleteAddress } from './actions'

export function DeleteAddressButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm('この住所データを削除してよろしいですか？')) {
            return
        }

        setIsDeleting(true)
        startTransition(async () => {
            try {
                const result = await deleteAddress(id)
                if (result.success) {
                    alert('削除しました。')
                }
            } catch (err: any) {
                alert(err.message)
            } finally {
                setIsDeleting(false)
            }
        })
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={handleDelete}
            disabled={isPending || isDeleting}
        >
            {isPending || isDeleting ? '削除中...' : '削除'}
        </Button>
    )
}
