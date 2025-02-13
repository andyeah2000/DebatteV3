'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchInputProps extends Omit<InputProps, 'type' | 'placeholder'> {}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search debates..."
        className={cn(
          "pl-10 bg-white/50 backdrop-blur-sm",
          className
        )}
        {...props}
      />
    </div>
  )
} 