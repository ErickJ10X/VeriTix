<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Iniciar sesion | VeriTix',
  description: 'Accede a tu cuenta de VeriTix para gestionar tus reservas y descubrir nuevos eventos.',
})

const schema = z.object({
  email: z.string().email('Introduce un email valido').min(1, 'El email es obligatorio'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
})

const state = reactive({
  email: '',
  password: '',
})

const form = useTemplateRef('form')
const errorMessage = ref('')
const { login, pending } = useAuth()
const { getApiErrorMessage } = useApiErrorMessage()

async function onSubmit() {
  if (!form.value) {
    return
  }

  errorMessage.value = ''

  try {
    await login({
      email: state.email.trim().toLowerCase(),
      password: state.password,
    })

    await navigateTo('/')
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Credenciales incorrectas. Por favor, intenta de nuevo.')
  }
}
</script>

<template>
  <UiAuthPageShell variant="login">
    <UiAuthContainer>
      <div class="w-full max-w-lg px-4 sm:px-0">
        <section class="space-y-8">
          <header class="text-center">
            <UiMetaLabel tone="accent" class="mb-3 text-secondary/90">
              VeriTix
            </UiMetaLabel>

            <h1 class="font-display text-3xl text-highlighted md:text-4xl">
              Bienvenido de nuevo
            </h1>

            <p class="mx-auto mt-3 max-w-md text-sm text-toned">
              Inicia sesion para acceder a tu cuenta
            </p>
          </header>

          <div class="mb-7 flex items-center justify-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-auric-300/30 bg-auric-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-auric-200 uppercase">
              <UIcon name="i-lucide-shield-check" class="size-3.5" />
              Acceso seguro
            </span>
          </div>

          <UForm
            ref="form"
            :state="state"
            :schema="schema"
            :validate-on="[]"
            class="flex flex-col gap-4"
            @submit="onSubmit"
          >
            <!-- Error message -->
            <p
              v-if="errorMessage"
              class="rounded-xl border border-[color-mix(in_srgb,var(--ui-error)_50%,transparent)] bg-[color-mix(in_srgb,var(--ui-error)_10%,transparent)] px-4 py-3 text-sm text-error"
            >
              {{ errorMessage }}
            </p>

            <!-- Email -->
            <BaseFormField
              v-model="state.email"
              name="email"
              label="Email"
              type="email"
              placeholder="tu@email.com"
              icon="i-lucide-mail"
              :disabled="pending"
              required
              class="w-full"
            />

            <!-- Password -->
            <BasePasswordField
              v-model="state.password"
              name="password"
              label="Contrasena"
              placeholder="Tu contrasena"
              icon="i-lucide-lock"
              :disabled="pending"
              required
              class="w-full"
            />

            <!-- Forgot password link -->
            <div class="flex justify-end -mt-2">
              <NuxtLink
                to="/forgot-password"
                class="cursor-pointer rounded-sm text-sm text-auric-300 transition-colors duration-150 hover:text-auric-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
                :class="pending && 'pointer-events-none opacity-60'"
                :aria-disabled="pending"
                :tabindex="pending ? -1 : undefined"
              >
                ¿Olvidaste tu contrasena?
              </NuxtLink>
            </div>

            <!-- Submit button -->
            <BaseButton
              kind="primary"
              type="submit"
              size="lg"
              block
              :loading="pending"
              class="mt-2"
            >
              Iniciar sesion
            </BaseButton>

            <p class="text-center text-xs text-toned">
              Protegido con sesion segura y renovacion automatica de credenciales.
            </p>
          </UForm>

          <footer class="pt-1">
            <p class="text-center text-sm text-muted">
              ¿No tienes cuenta?
              <NuxtLink
                to="/register"
                class="rounded-sm font-medium text-auric-400 transition-colors duration-200 hover:text-auric-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
              >
                Registrate aqui
              </NuxtLink>
            </p>
          </footer>
        </section>
      </div>
    </UiAuthContainer>
  </UiAuthPageShell>
</template>
