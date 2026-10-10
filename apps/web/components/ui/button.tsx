import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Button.
 *
 * `asChild` renders the styling onto a child element — used to style `next/link` as a button
 * without nesting an anchor inside a button, which would be invalid HTML and break keyboard
 * activation.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold',
    'transition-[background-color,background-position,border-color,color,box-shadow,transform] duration-300',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-55',
    // Icons inside buttons should not be interactive targets of their own.
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    'motion-safe:active:translate-y-px',
  ],
  {
    variants: {
      variant: {
        /**
         * The gradient of the N. It stops at brand-500 rather than running into cyan, because white
         * text on the cyan end would fall below AA contrast.
         */
        primary:
          'bg-linear-to-r from-brand-700 via-brand-600 to-brand-500 bg-size-[200%_100%] bg-left text-white shadow-[0_8px_24px_-10px_rgb(11_85_240/0.6)] hover:bg-right hover:shadow-[0_12px_32px_-10px_rgb(11_85_240/0.75)] focus-visible:outline-brand-600',
        secondary:
          'border border-neutral-300 bg-white text-neutral-800 hover:border-brand-400 hover:text-brand-700 focus-visible:outline-brand-600',
        ghost:
          'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-brand-600',
        /** For use on midnight sections: the same gradient, with the glow the logo has on midnight. */
        onDark:
          'bg-linear-to-r from-brand-700 via-brand-600 to-brand-500 bg-size-[200%_100%] bg-left text-white shadow-glow ring-1 ring-white/15 ring-inset hover:bg-right hover:shadow-[0_14px_44px_-10px_rgb(11_92_255/0.85)] focus-visible:outline-cyan-brand-400',
        outlineOnDark:
          'border border-white/20 bg-white/5 text-white backdrop-blur-sm hover:border-cyan-brand-400/60 hover:bg-white/10 focus-visible:outline-cyan-brand-400',
        link: 'text-brand-700 underline-offset-4 hover:underline focus-visible:outline-brand-600',
      },
      size: {
        sm: 'h-9 px-4 text-sm [&_svg]:size-4',
        md: 'h-11 px-5.5 text-sm [&_svg]:size-4',
        lg: 'h-13 px-7 text-base [&_svg]:size-5',
        icon: 'size-10 [&_svg]:size-5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
