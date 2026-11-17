import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 hover:bg-violet-700 hover:-translate-y-0.5',
        accent: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-pink-500/30 hover:brightness-110 hover:-translate-y-0.5',
        whatsapp: 'bg-[#1fa855] text-white shadow-lg shadow-green-600/30 hover:bg-[#178a45] hover:-translate-y-0.5',
        outline: 'border-2 border-slate-300 bg-white text-slate-900 hover:border-violet-500 hover:text-violet-700',
        ghost: 'text-slate-700 hover:bg-slate-100',
        light: 'bg-white text-violet-700 hover:bg-violet-50 hover:-translate-y-0.5',
      },
      size: {
        default: 'h-11 px-6 text-[15px]',
        lg: 'h-14 px-8 text-base',
        sm: 'h-9 px-4 text-sm',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'
