<script setup lang="ts">
import { z } from 'zod'

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
const showPassword = ref(false)
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
  <div class="relative min-h-screen overflow-hidden">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-1/2 -top-56 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/18 blur-3xl" />
      <div class="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-secondary/12 blur-3xl" />
      <div class="absolute -left-24 bottom-12 h-64 w-64 rounded-full bg-auric-500/12 blur-3xl" />
      <div class="absolute left-[8%] top-32 hidden h-40 w-40 rounded-full border border-auric-200/20 bg-linear-to-br from-auric-200/14 to-transparent blur-sm md:block" />
      <div class="absolute right-[10%] bottom-28 hidden h-32 w-32 rounded-full border border-electric-300/20 bg-linear-to-br from-electric-200/14 to-transparent blur-sm lg:block" />
      <div class="absolute left-[18%] bottom-[18%] hidden h-px w-44 bg-linear-to-r from-transparent via-auric-300/35 to-transparent md:block" />
      <div class="absolute right-[16%] top-[22%] hidden h-px w-36 bg-linear-to-r from-transparent via-electric-300/35 to-transparent lg:block" />
    </div>

    <UContainer class="relative flex min-h-[88vh] items-center justify-center py-10 sm:py-14">
      <div class="w-full max-w-xl px-4">
        <AuthAuthCard
          title="Bienvenido de nuevo"
          subtitle="Inicia sesion para acceder a tu cuenta"
        >
          <div class="mb-6 flex items-center justify-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-auric-300/30 bg-auric-400/10 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.22em] text-auric-200 uppercase">
              <UIcon name="i-lucide-shield-check" class="size-3.5" />
              Acceso seguro
            </span>
          </div>

          <UForm
            ref="form"
            :state="state"
            :schema="schema"
            :validate-on="[]"
            class="flex flex-col gap-4 px-1"
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
            <UFormField
              name="email"
              label="Email"
              help="Usa el email con el que te registraste."
              required
              class="w-full"
            >
              <UInput
                v-model="state.email"
                type="email"
                placeholder="tu@email.com"
                icon="i-lucide-mail"
                color="neutral"
                variant="subtle"
                size="lg"
                class="w-full"
                :ui="{ base: 'h-12' }"
              />
            </UFormField>

            <!-- Password -->
            <UFormField
              name="password"
              label="Contrasena"
              help="Minimo 8 caracteres"
              required
              class="w-full"
            >
              <UInput
                v-model="state.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Tu contrasena"
                icon="i-lucide-lock"
                color="neutral"
                variant="subtle"
                size="lg"
                class="w-full"
                :ui="{ base: 'h-12' }"
              >
                <template #trailing>
                  <button
                    type="button"
                    :aria-label="showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'"
                    :aria-pressed="showPassword"
                    class="rounded-md p-0.5 text-muted transition-colors duration-200 hover:text-auric-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
                    @click="showPassword = !showPassword"
                  >
                    <UIcon
                      :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      class="size-5"
                    />
                  </button>
                </template>
              </UInput>
            </UFormField>

            <!-- Forgot password link -->
            <div class="flex justify-end -mt-2">
              <NuxtLink
                to="/forgot-password"
                class="rounded-sm text-sm text-auric-300 transition-colors duration-200 hover:text-auric-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
              >
                ¿Olvidaste tu contrasena?
              </NuxtLink>
            </div>

            <!-- Submit button -->
            <UButton
              type="submit"
              color="primary"
              variant="solid"
              size="lg"
              block
              :loading="pending"
              class="mt-2 shadow-[0_0_32px_-16px_var(--color-auric-500)]"
            >
              Iniciar sesion
            </UButton>

            <p class="text-center text-xs text-toned">
              Protegido con sesion segura y renovacion automatica de credenciales.
            </p>
          </UForm>

          <template #footer>
            <p class="text-center text-sm text-muted">
              ¿No tienes cuenta?
              <NuxtLink
                to="/register"
                class="rounded-sm font-medium text-auric-400 transition-colors duration-200 hover:text-auric-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
              >
                Registrate aqui
              </NuxtLink>
            </p>
          </template>
        </AuthAuthCard>
      </div>
    </UContainer>
  </div>
</template>
