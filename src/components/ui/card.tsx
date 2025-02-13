import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hover?: boolean
    variant?: 'default' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'default' | 'lg'
  }
>(({ className, hover = false, variant = 'default', size = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground transition-all duration-200",
      {
        'shadow-sm hover:shadow-md hover:translate-y-[-2px]': hover,
        'border-border': variant === 'default',
        'bg-secondary border-secondary': variant === 'secondary',
        'border-border bg-transparent': variant === 'outline',
        'border-transparent bg-transparent': variant === 'ghost',
        'p-4': size === 'sm',
        'p-6': size === 'default',
        'p-8': size === 'lg',
      },
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    compact?: boolean
  }
>(({ className, compact = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col",
      compact ? 'space-y-1 mb-3' : 'space-y-1.5 mb-4',
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'default' | 'lg'
  }
>(({ className, size = 'default', ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight",
      {
        'text-lg': size === 'sm',
        'text-2xl': size === 'default',
        'text-3xl': size === 'lg',
      },
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-normal", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    padded?: boolean
  }
>(({ className, padded = true, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      padded && "pt-0",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    compact?: boolean
  }
>(({ className, compact = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center pt-0",
      compact ? 'mt-3' : 'mt-4',
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} 