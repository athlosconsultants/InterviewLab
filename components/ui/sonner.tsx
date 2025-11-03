'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-cyan-200 group-[.toaster]:shadow-lg group-[.toaster]:border-2',
          description: 'group-[.toast]:text-slate-600',
          actionButton:
            'group-[.toast]:bg-gradient-to-r group-[.toast]:from-cyan-500 group-[.toast]:to-blue-600 group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-700',
          success:
            'group-[.toaster]:border-cyan-300 group-[.toaster]:text-cyan-700',
          error:
            'group-[.toaster]:border-red-300 group-[.toaster]:text-red-700',
          info: 'group-[.toaster]:border-blue-300 group-[.toaster]:text-blue-700',
          warning:
            'group-[.toaster]:border-amber-300 group-[.toaster]:text-amber-700',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
