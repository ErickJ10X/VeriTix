export default defineAppConfig({
  ui: {
    colors: {
      primary: 'auric',
      secondary: 'electric',
      neutral: 'slate',
      info: 'nebula',
      warning: 'ember',
      error: 'crimson',
      success: 'verdant',
    },
    button: {
      defaultVariants: {
        color: 'neutral',
        variant: 'solid',
        size: 'md',
      },
      slots: {
        base: 'cursor-pointer rounded-full border font-semibold transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0',
        label: 'text-current',
      },
    },
    input: {
      defaultVariants: {
        color: 'neutral',
        variant: 'subtle',
        size: 'lg',
      },
      slots: {
        base: 'h-12 rounded-2xl border border-default/70 bg-default/85 px-3.5 text-highlighted placeholder:text-toned/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:border-primary/45 hover:bg-default/95 focus-visible:border-primary/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 aria-invalid:border-error/70 aria-invalid:ring-2 aria-invalid:ring-error/30',
      },
    },
    select: {
      defaultVariants: {
        color: 'neutral',
        variant: 'subtle',
        size: 'lg',
      },
      variants: {
        size: {
          lg: {
            base: 'px-3.5 py-2 text-base/5 gap-2',
            leading: 'ps-3.5',
            trailing: 'pe-3.5',
          },
        },
      },
      slots: {
        base: 'h-12 relative group inline-flex items-center rounded-2xl border border-default/70 bg-default/85 text-highlighted shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:border-primary/45 hover:bg-default/95 focus-visible:border-primary/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-75',
      },
    },
    card: {
      slots: {
        root: 'rounded-2xl border border-default/70 bg-elevated/74 shadow-[0_24px_46px_-28px_rgba(0,0,0,0.86)] backdrop-blur-md',
        body: 'p-5 sm:p-6',
      },
    },
    badge: {
      defaultVariants: {
        variant: 'soft',
      },
      slots: {
        base: 'rounded-full border border-default/75 font-semibold tracking-[0.14em] uppercase',
      },
    },
    carousel: {
      slots: {
        dots: 'mt-4',
        dot: 'h-1.5 w-6 rounded-full bg-muted transition-all data-[active=true]:w-10 data-[active=true]:bg-primary',
        prev: 'border border-default/70 bg-default/85 text-highlighted hover:bg-default focus-visible:ring-2 focus-visible:ring-primary/45',
        next: 'border border-default/70 bg-default/85 text-highlighted hover:bg-default focus-visible:ring-2 focus-visible:ring-primary/45',
      },
    },
  },
})
