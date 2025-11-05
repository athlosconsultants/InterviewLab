import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // PRIMARY: Solid blue gradient background with white text (main actions)
        default:
          'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]',
        // SECONDARY: Blue gradient border with white background and dark text (alternative actions)
        outline:
          'bg-white text-slate-800 hover:text-slate-900 shadow-sm hover:shadow-md active:scale-[0.98] relative [background:linear-gradient(white,white)_padding-box,linear-gradient(to_right,#06b6d4,#2563eb)_border-box] border-2 border-transparent',
        // TERTIARY: Light tonal blue fill with dark blue text (micro-interactions, operational controls)
        tertiary:
          'bg-blue-50/80 text-blue-700 hover:bg-blue-100 hover:text-blue-800 active:scale-[0.98] transition-colors',
        // Deprecated variants - all map to outline (secondary style) for backwards compatibility
        secondary:
          'bg-white text-slate-800 hover:text-slate-900 shadow-sm hover:shadow-md active:scale-[0.98] relative [background:linear-gradient(white,white)_padding-box,linear-gradient(to_right,#06b6d4,#2563eb)_border-box] border-2 border-transparent',
        ghost:
          'bg-white text-slate-800 hover:text-slate-900 shadow-sm hover:shadow-md active:scale-[0.98] relative [background:linear-gradient(white,white)_padding-box,linear-gradient(to_right,#06b6d4,#2563eb)_border-box] border-2 border-transparent',
        link:
          'bg-white text-slate-800 hover:text-slate-900 shadow-sm hover:shadow-md active:scale-[0.98] relative [background:linear-gradient(white,white)_padding-box,linear-gradient(to_right,#06b6d4,#2563eb)_border-box] border-2 border-transparent',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]',
      },
      size: {
        default: 'min-h-[44px] px-6 py-2.5 text-base',
        sm: 'min-h-[40px] px-4 py-2 text-sm',
        lg: 'min-h-[52px] px-8 py-3.5 text-lg',
        xs: 'min-h-[32px] px-3 py-1.5 text-sm', // Extra small for tertiary buttons
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
