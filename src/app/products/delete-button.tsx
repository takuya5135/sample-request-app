'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { deleteProduct } from './actions'

export function DeleteProductButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm('この商品をマスターから削除してよろしいですか？')) {
            return
        }

        setIsDeleting(true)
        startTransition(async () => {
            try {
                const result = await deleteProduct(id)
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
