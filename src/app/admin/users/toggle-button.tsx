'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleApproval } from './actions'

interface ToggleApprovalButtonProps {
    userId: string
    isApproved: boolean
}

export function ToggleApprovalButton({ userId, isApproved }: ToggleApprovalButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        startTransition(async () => {
            const result = await toggleApproval(userId, isApproved)
            if (!result.success) {
                alert(result.message)
            }
        })
    }

    return (
        <Button
            variant={isApproved ? "outline" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className={isApproved ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "bg-green-600 hover:bg-green-700 text-white"}
        >
            {isPending ? '更新中...' : isApproved ? '承認解除' : '承認する'}
        </Button>
    )
}
