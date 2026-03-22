<script setup lang="ts">
const email = ref('')
const subscribed = ref(false)
const subscriptionError = ref('')
const currentYear = new Date().getFullYear()
const emailPattern = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

function handleSubscribe() {
  const normalizedEmail = email.value.trim()

  if (!normalizedEmail) {
    subscriptionError.value = 'Ingresa un correo para suscribirte.'
    subscribed.value = false
    return
  }

  const isValidEmail = emailPattern.test(normalizedEmail)

  if (!isValidEmail) {
    subscriptionError.value = 'Ingresa un correo valido.'
    subscribed.value = false
    return
  }

  subscriptionError.value = ''

  subscribed.value = true
  email.value = ''
}
</script>

<template>
  <footer
    id="footer"
    class="border-t border-default/75 bg-muted/65"
  >
    <UContainer class="space-y-10 py-12">
      <div class="vtx-panel grid gap-10 p-6 lg:grid-cols-[1.5fr_1fr] lg:p-8">
        <div class="space-y-5">
          <div class="space-y-3">
            <p class="text-[0.68rem] tracking-[0.34em] text-secondary uppercase">
              Cierre del ritual
            </p>
            <p class="font-display text-4xl text-highlighted">
              Veritix Newsletter
            </p>
          </div>

          <p class="max-w-xl text-sm text-toned md:text-base">
            Enterate antes que nadie de nuevos conciertos, preventas y experiencias exclusivas con curaduria progresiva.
          </p>

          <form
            class="flex flex-col gap-3 sm:flex-row sm:items-center"
            @submit.prevent="handleSubscribe"
          >
            <label class="sr-only" for="newsletter-email">
              Correo para newsletter
            </label>

            <UInput
              id="newsletter-email"
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              color="neutral"
              variant="subtle"
              aria-label="Correo para newsletter"
              class="w-full sm:max-w-sm"
            />

            <SharedCTAButton
              type="submit"
              label="Suscribirme"
              tone="primary"
              variant="solid"
              size="md"
            />
          </form>

          <p
            v-if="subscribed"
            class="text-sm text-secondary"
          >
            Te has suscrito correctamente. Revisa tu correo para confirmar.
          </p>

          <p
            v-else-if="subscriptionError"
            class="text-sm text-error"
            role="alert"
          >
            {{ subscriptionError }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p class="mb-3 text-[0.65rem] tracking-[0.2em] text-dimmed uppercase">
              Navegacion
            </p>
            <ul class="space-y-2.5 text-toned">
              <li>
                <a class="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45" href="#hero">Inicio</a>
              </li>
              <li>
                <a class="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45" href="#eventos">Eventos</a>
              </li>
              <li>
                <a class="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45" href="#generos">Generos</a>
              </li>
              <li>
                <a class="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45" href="#como-funciona">Como funciona</a>
              </li>
            </ul>
          </div>

          <div>
            <p class="mb-3 text-[0.65rem] tracking-[0.2em] text-dimmed uppercase">
              Redes
            </p>
            <ul class="space-y-2.5 text-toned">
              <li>
                <a class="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45" href="https://instagram.com">Instagram</a>
              </li>
              <li>
                <a class="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45" href="https://x.com">X</a>
              </li>
              <li>
                <a class="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45" href="https://youtube.com">YouTube</a>
              </li>
              <li>
                <a class="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45" href="https://spotify.com">Spotify</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="border-t border-default/75 pt-5 text-xs tracking-[0.12em] text-muted uppercase">
        © {{ currentYear }} Veritix. Todos los derechos reservados.
      </div>
    </UContainer>
  </footer>
</template>
