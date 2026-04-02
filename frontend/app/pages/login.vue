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
const loading = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  if (!form.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // TODO: Replace with actual API call when backend is ready
    // await $fetch('/api/auth/login', {
    //   method: 'POST',
    //   body: state,
    // })

    // Simulate API call for prototype
    await new Promise(resolve => setTimeout(resolve, 1000))

    // TODO: Navigate to dashboard or home after successful login
    // await navigateTo('/')
  }
  catch {
    errorMessage.value = 'Credenciales incorrectas. Por favor, intenta de nuevo.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen">
    <UContainer class="flex min-h-[85vh] items-center justify-center py-12">
      <div class="w-full max-w-lg px-4">
        <AuthAuthCard
          title="Bienvenido de nuevo"
          subtitle="Inicia sesion para acceder a tu cuenta"
        >
          <UForm
            ref="form"
            :state="state"
            :schema="schema"
            class="flex flex-col gap-5 px-2"
            @submit="onSubmit"
          >
            <!-- Error message -->
            <p
              v-if="errorMessage"
              class="rounded-xl border border-[color-mix(in_srgb,var(--ui-error)_50%,transparent)] bg-[color-mix(in_srgb,var(--ui-error)_10%,transparent)] px-4 py-3 text-sm text-[var(--ui-error)]"
            >
              {{ errorMessage }}
            </p>

            <!-- Email -->
            <UFormField
              name="email"
              label="Email"
              required
              class="w-full"
            >
              <UInput
                v-model="state.email"
                type="email"
                placeholder="tu@email.com"
                icon="i-lucide-mail"
                color="neutral"
                variant="outline"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <!-- Password -->
            <UFormField
              name="password"
              label="Contrasena"
              required
              class="w-full"
            >
              <UInput
                v-model="state.password"
                type="password"
                placeholder="Tu contrasena"
                icon="i-lucide-lock"
                color="neutral"
                variant="outline"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <!-- Forgot password link -->
            <div class="flex justify-end -mt-2">
              <NuxtLink
                to="/forgot-password"
                class="text-sm text-[var(--color-auric-400)] transition-colors duration-200 hover:text-[var(--color-auric-300)]"
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
              :loading="loading"
              class="mt-2"
            >
              Iniciar sesion
            </UButton>
          </UForm>

          <template #footer>
            <p class="text-center text-sm text-[var(--ui-text-muted)]">
              ¿No tienes cuenta?
              <NuxtLink
                to="/register"
                class="font-medium text-[var(--color-auric-400)] transition-colors duration-200 hover:text-[var(--color-auric-300)]"
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
