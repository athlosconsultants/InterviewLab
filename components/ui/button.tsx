import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]',
        outline:
          'border-2 border-cyan-500 bg-white text-cyan-600 hover:bg-cyan-50 shadow-sm hover:shadow-md active:scale-[0.98]',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm hover:shadow-md active:scale-[0.98]',
        ghost: 'hover:bg-cyan-50 hover:text-cyan-600 active:scale-[0.98]',
        link: 'text-cyan-600 underline-offset-4 hover:underline hover:text-cyan-700',
      },
      size: {
        default: 'min-h-[44px] px-6 py-3 text-base',
        sm: 'min-h-[40px] px-4 py-2 text-sm',
        lg: 'min-h-[52px] px-8 py-4 text-lg',
        icon: 'h-11 w-11 min-h-[44px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
