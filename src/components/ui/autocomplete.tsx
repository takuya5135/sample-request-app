'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface AutocompleteOption {
    value: string
    label: string
    description?: string
    data?: any // 元のデータを保持
}

interface AutocompleteProps {
    options: AutocompleteOption[]
    value: string
    onChange: (value: string, option?: AutocompleteOption) => void
    placeholder?: string
    className?: string
    emptyMessage?: string
}

export function Autocomplete({
    options,
    value,
    onChange,
    placeholder = "検索...",
    className,
    emptyMessage = "候補が見つかりません"
}: AutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const wrapperRef = useRef<HTMLDivElement>(null)

    // 初期値のセット
    useEffect(() => {
        const selectedOption = options.find(opt => opt.value === value)
        if (selectedOption) {
            setInputValue(selectedOption.label)
        } else if (!value) {
            setInputValue('')
        }
    }, [value, options])

    // クリック外の検知
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                // 選択されていなければ入力をリセットするか、完全一致を確認
                const matched = options.find(opt => opt.label === inputValue)
                if (matched) {
                    onChange(matched.value, matched)
                } else {
                    // 自由入力も許容するかによるが、今回は選択必須とする場合はリセット
                    // onChange('') 
                    // setInputValue('')
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [wrapperRef, inputValue, options, onChange])

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        (option.description && option.description.toLowerCase().includes(inputValue.toLowerCase()))
    )

    const handleSelect = (option: AutocompleteOption) => {
        setInputValue(option.label)
        onChange(option.value, option)
        setIsOpen(false)
    }

    return (
        <div ref={wrapperRef} className={cn("relative w-full", className)}>
            <Input
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value)
                    setIsOpen(true)
                    if (e.target.value === '') {
                        onChange('', undefined)
                    }
                }}
                onClick={() => setIsOpen(true)}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className="w-full"
            />

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">{emptyMessage}</div>
                    ) : (
                        <ul className="py-1">
                            {filteredOptions.map((option) => (
                                <li
                                    key={option.value}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex flex-col"
                                    onClick={() => handleSelect(option)}
                                >
                                    <span className="text-sm font-medium">{option.label}</span>
                                    {option.description && (
                                        <span className="text-xs text-gray-500">{option.description}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
