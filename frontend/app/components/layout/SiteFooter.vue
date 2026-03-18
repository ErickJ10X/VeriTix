<script setup lang="ts">
const email = ref('')
const subscribed = ref(false)
const currentYear = new Date().getFullYear()

function handleSubscribe() {
  if (!email.value.trim()) {
    return
  }

  subscribed.value = true
  email.value = ''
}
</script>

<template>
  <footer
    id="footer"
    class="border-t border-default/80 bg-muted/75"
  >
    <UContainer class="space-y-10 py-12">
      <div class="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div class="space-y-4">
          <p class="font-display text-4xl text-highlighted">
            Veritix Newsletter
          </p>

          <p class="max-w-xl text-sm text-toned md:text-base">
            Enterate antes que nadie de nuevos conciertos, preventas y experiencias exclusivas.
          </p>

          <form
            class="flex flex-col gap-3 sm:flex-row"
            @submit.prevent="handleSubscribe"
          >
            <UInput
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              color="neutral"
              variant="subtle"
              class="w-full sm:max-w-sm"
            />

            <SharedCTAButton
              type="submit"
              label="Suscribirme"
              tone="secondary"
              variant="soft"
            />
          </form>

          <p
            v-if="subscribed"
            class="text-sm text-success"
          >
            Te has suscrito correctamente.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p class="mb-3 text-xs tracking-[0.18em] text-dimmed uppercase">
              Navegacion
            </p>
            <ul class="space-y-2 text-toned">
              <li>
                <a class="transition hover:text-primary" href="#hero">Inicio</a>
              </li>
              <li>
                <a class="transition hover:text-primary" href="#eventos">Eventos</a>
              </li>
              <li>
                <a class="transition hover:text-primary" href="#generos">Generos</a>
              </li>
              <li>
                <a class="transition hover:text-primary" href="#como-funciona">Como funciona</a>
              </li>
            </ul>
          </div>

          <div>
            <p class="mb-3 text-xs tracking-[0.18em] text-dimmed uppercase">
              Redes
            </p>
            <ul class="space-y-2 text-toned">
              <li>
                <a class="transition hover:text-primary" href="https://instagram.com">Instagram</a>
              </li>
              <li>
                <a class="transition hover:text-primary" href="https://x.com">X</a>
              </li>
              <li>
                <a class="transition hover:text-primary" href="https://youtube.com">YouTube</a>
              </li>
              <li>
                <a class="transition hover:text-primary" href="https://spotify.com">Spotify</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="border-t border-default/80 pt-5 text-xs text-muted">
        © {{ currentYear }} Veritix. Todos los derechos reservados.
      </div>
    </UContainer>
  </footer>
</template>
