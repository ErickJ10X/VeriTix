<template>
  <section class="relative flex min-h-full items-center py-10 sm:py-14 lg:py-16">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute inset-x-0 top-0 h-56 bg-linear-to-b from-secondary/12 via-transparent to-transparent" />
      <div class="absolute -left-20 top-24 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
      <div class="absolute -right-20 top-12 h-72 w-72 rounded-full bg-auric-500/14 blur-3xl" />
      <div class="absolute bottom-10 left-1/3 h-44 w-44 rounded-full bg-secondary/10 blur-3xl" />
      <div class="absolute left-[12%] top-32 hidden h-px w-40 bg-linear-to-r from-transparent via-secondary/35 to-transparent lg:block" />
      <div class="absolute right-[14%] bottom-24 hidden h-px w-36 bg-linear-to-r from-transparent via-auric-300/35 to-transparent xl:block" />
    </div>

    <UContainer class="relative flex min-h-full items-center">
      <div class="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:gap-8">
        <div class="space-y-6 self-center rounded-3xl border border-default/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)),linear-gradient(145deg,rgba(11,17,31,0.92),rgba(16,23,40,0.95))] p-7 shadow-[0_28px_80px_-48px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <p class="text-[0.68rem] font-semibold tracking-[0.32em] text-secondary uppercase">
                Acceso
              </p>

              <span class="inline-flex items-center gap-2 rounded-full border border-auric-300/30 bg-auric-400/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.2em] text-auric-200 uppercase">
                <UIcon name="i-lucide-shield-check" class="size-3.5" />
                En preparacion
              </span>
            </div>

            <h1 class="font-display text-3xl leading-tight text-highlighted sm:text-4xl lg:text-[2.8rem]">
              Recupera tu entrada al portal
            </h1>

            <p class="max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
              La recuperacion automatica de contrasena no esta disponible en este momento. Esta pantalla mantiene una ruta clara, ocupa correctamente la altura de la pagina y te dirige solo a acciones que hoy si existen dentro del producto.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <article class="rounded-2xl border border-default/70 bg-default/10 p-4">
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Estado
              </p>
              <p class="mt-3 text-base font-semibold text-highlighted">
                Flujo guiado temporal
              </p>
              <p class="mt-2 text-sm leading-relaxed text-toned">
                El enlace ya no lleva a una ruta rota y la pagina explica con claridad que el restablecimiento automatico no esta habilitado por ahora.
              </p>
            </article>

            <article class="rounded-2xl border border-default/70 bg-default/10 p-4">
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Recomendacion
              </p>
              <p class="mt-3 text-base font-semibold text-highlighted">
                Usa una sesion activa si aun la conservas
              </p>
              <p class="mt-2 text-sm leading-relaxed text-toned">
                Si sigues conectado en otro dispositivo, cambia la contrasena desde tu zona privada en cuanto recuperes el acceso.
              </p>
            </article>
          </div>
        </div>

        <UCard
          variant="subtle"
          class="overflow-hidden rounded-3xl border border-default/70 bg-default/70 shadow-[0_26px_70px_-50px_rgba(0,0,0,0.8)] backdrop-blur-xl"
        >
          <template #header>
            <div class="space-y-3">
              <p class="text-[0.68rem] font-semibold tracking-[0.26em] text-dimmed uppercase">
                Siguiente paso
              </p>
              <div>
                <h2 class="text-2xl font-semibold text-highlighted">
                  Que puedes hacer ahora
                </h2>
                <p class="mt-2 text-sm leading-relaxed text-toned">
                  Estas son las rutas reales disponibles ahora mismo para recuperar el control de tu acceso sin prometer un flujo que todavia no existe.
                </p>
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <div class="rounded-2xl border border-secondary/25 bg-secondary/8 p-4">
              <div class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-secondary/35 bg-secondary/12 text-secondary">
                  <UIcon name="i-lucide-arrow-left-right" class="size-4.5" />
                </span>

                <div>
                  <p class="text-sm font-semibold text-highlighted">
                    Vuelve al inicio de sesion
                  </p>
                  <p class="mt-1 text-sm leading-relaxed text-toned">
                    Si recuerdas la clave o la tienes guardada en tu gestor, vuelve a iniciar sesion y continua desde alli.
                  </p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-auric-300/25 bg-auric-400/8 p-4">
              <div class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-auric-300/35 bg-auric-400/12 text-auric-200">
                  <UIcon name="i-lucide-key-round" class="size-4.5" />
                </span>

                <div>
                  <p class="text-sm font-semibold text-highlighted">
                    Si ya tienes una sesion abierta, actualiza tu clave desde seguridad
                  </p>
                  <p class="mt-1 text-sm leading-relaxed text-toned">
                    El flujo de cambio dentro de la cuenta ya existe y sigue siendo la via mas segura para rotar tu contrasena sin friccion.
                  </p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-default/70 bg-default/10 p-4">
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Estado del producto
              </p>
              <p class="mt-2 text-sm leading-relaxed text-toned">
                La ruta ya no falla, el pie de pagina queda anclado abajo en pantallas con poco contenido y el mensaje evita expectativas incorrectas sobre una funcion no disponible.
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-col gap-3 sm:flex-row">
              <UButton
                to="/login"
                color="primary"
                variant="solid"
                size="lg"
                class="justify-center rounded-full px-6"
              >
                Volver a iniciar sesion
              </UButton>

              <UButton
                to="/"
                color="neutral"
                variant="outline"
                size="lg"
                class="justify-center rounded-full px-6"
              >
                Volver al inicio
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
