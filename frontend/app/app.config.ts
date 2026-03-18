export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      secondary: 'accent',
      neutral: 'zinc',
    },
    button: {
      defaultVariants: {
        color: 'primary',
        variant: 'solid',
        size: 'lg',
      },
    },
    input: {
      defaultVariants: {
        color: 'neutral',
        variant: 'subtle',
        size: 'lg',
      },
    },
    card: {
      slots: {
        root: 'rounded-2xl border border-default bg-elevated/70 shadow-[0_14px_40px_-22px_rgba(0,0,0,0.8)] backdrop-blur-sm',
        body: 'p-5 sm:p-6',
      },
    },
  },
})
