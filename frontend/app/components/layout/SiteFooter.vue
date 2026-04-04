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
    class="border-t border-default/75 bg-muted/40"
  >
    <UContainer class="py-12">
      <div class="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
        <div class="max-w-md space-y-5">
          <div class="space-y-2">
            <p class="text-[0.68rem] tracking-[0.34em] text-secondary uppercase">
              Cierre del ritual
            </p>
            <p class="font-display text-3xl text-highlighted">
              Veritix Newsletter
            </p>
          </div>

          <p class="text-sm text-toned">
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
              class="w-full sm:w-64"
            />

            <UButton
              type="submit"
              color="primary"
              variant="outline"
              size="md"
              class="shrink-0 rounded-full border-primary/60 px-6 text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary"
            >
              Suscribirme
            </UButton>
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
      </div>

      <div class="mt-10 border-t border-default/75 pt-5 text-xs tracking-[0.12em] text-muted uppercase">
        © {{ currentYear }} Veritix. Todos los derechos reservados.
      </div>
    </UContainer>
  </footer>
</template>
