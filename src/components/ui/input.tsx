import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'filled' | 'outline' | 'ghost'
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    icon, 
    iconPosition = 'left',
    size = 'default',
    variant = 'default',
    fullWidth = false,
    ...props 
  }, ref) => {
    return (
      <div className={cn("relative", fullWidth && "w-full")}>
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "rounded-md border border-input bg-background text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            {
              // Size variants
              'h-8 px-2': size === 'sm',
              'h-10 px-3': size === 'default',
              'h-12 px-4 text-base': size === 'lg',
              
              // Style variants
              'bg-background': variant === 'default',
              'bg-secondary border-transparent': variant === 'filled',
              'border-2': variant === 'outline',
              'border-transparent bg-transparent px-0': variant === 'ghost',
              
              // Icon padding
              'pl-10': icon && iconPosition === 'left',
              'pr-10': icon && iconPosition === 'right',
              
              // Error state
              'border-destructive focus-visible:ring-destructive': error,
              
              // Full width
              'w-full': fullWidth,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input } 