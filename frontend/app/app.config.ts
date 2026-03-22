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
        color: 'primary',
        variant: 'solid',
        size: 'lg',
      },
      slots: {
        base: 'rounded-full border border-default/65 font-semibold tracking-[0.08em] uppercase shadow-[0_0_0_1px_rgba(255,255,255,0.05)] transition duration-300 hover:-translate-y-0.5 disabled:hover:translate-y-0',
      },
    },
    input: {
      defaultVariants: {
        color: 'neutral',
        variant: 'subtle',
        size: 'lg',
      },
      slots: {
        base: 'rounded-xl border-default/85 bg-default/75 text-highlighted placeholder:text-toned/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
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
      },
    },
  },
})
