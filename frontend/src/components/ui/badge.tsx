import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20",
        secondary:
          "bg-secondary/50 text-secondary-foreground hover:bg-secondary/60 border border-secondary/20",
        success:
          "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400",
        destructive:
          "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400",
        outline:
          "text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      clickable: {
        true: "cursor-pointer hover:scale-105 active:scale-100 transition-transform",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      clickable: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  clickable?: boolean
}

function Badge({
  className,
  variant,
  clickable,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, clickable }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 