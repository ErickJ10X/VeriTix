<template>
  <UiAuthPageShell variant="login">
    <UiAuthContainer>
      <div class="w-full max-w-lg px-4 sm:px-0">
        <section class="space-y-8">
          <header class="text-center">
            <p class="mb-3 text-xs font-semibold tracking-[0.28em] text-auric-300/90 uppercase">
              VeriTix
            </p>

            <h1 class="font-display text-3xl text-highlighted md:text-4xl">
              Recupera tu acceso
            </h1>

            <p class="mx-auto mt-3 max-w-md text-sm text-toned">
              Esta pantalla ahora sigue la misma familia visual que inicio de sesión y te guía solo hacia las acciones reales disponibles.
            </p>
          </header>

          <div class="mb-7 flex items-center justify-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-auric-300/30 bg-auric-400/10 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.22em] text-auric-200 uppercase">
              <UIcon name="i-lucide-key-round" class="size-3.5" />
              Recuperación no disponible
            </span>
          </div>

          <div class="space-y-4 text-center">
            <p class="text-sm leading-relaxed text-toned">
              El restablecimiento automático de contraseña todavía no está habilitado. Si aún recuerdas tu clave, vuelve a iniciar sesión. Si conservas una sesión activa en otro dispositivo, cambia la contraseña desde seguridad dentro de tu cuenta.
            </p>

            <div class="vtx-recovery-note">
              <UIcon name="i-lucide-shield-check" class="size-4 text-auric-300" />
              <p>
                Evitamos prometer un flujo que aún no existe y te dejamos las rutas seguras que sí funcionan hoy.
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <BasePrimaryButton to="/login" size="lg" block>
              Volver a iniciar sesión
            </BasePrimaryButton>

            <BaseSecondaryButton to="/" size="lg" block>
              Ir al inicio
            </BaseSecondaryButton>
          </div>

          <footer class="pt-1">
            <p class="text-center text-xs text-toned">
              Cuando el flujo de recuperación exista, esta pantalla podrá conectarse a él sin romper la experiencia visual de autenticación.
            </p>
          </footer>
        </section>
      </div>
    </UiAuthContainer>
  </UiAuthPageShell>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-recovery-note {
  @apply flex items-start gap-3 rounded-2xl border px-4 py-4 text-left text-sm leading-relaxed;
  color: var(--ui-text-toned);
  border-color: color-mix(in srgb, var(--color-auric-400) 22%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--ui-bg-elevated) 62%, transparent);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
}
</style>
