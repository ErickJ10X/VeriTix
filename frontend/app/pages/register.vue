<script setup lang="ts">
import { z } from 'zod'

useSeoMeta({
  title: 'Registro | VeriTix',
  description: 'Crea tu cuenta de VeriTix y descubre los mejores conciertos progresivos.',
})

const schema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
  phone: z.string().regex(/^\+?[\d\s-]{9,15}$/, 'Introduce un telefono valido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
})

const state = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const form = useTemplateRef('form')
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

async function onSubmit() {
  if (!form.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // TODO: Replace with actual API call when backend is ready
    // await $fetch('/api/auth/register', {
    //   method: 'POST',
    //   body: {
    //     firstName: state.firstName,
    //     lastName: state.lastName,
    //     phone: state.phone,
    //     password: state.password,
    //   },
    // })

    // Simulate API call for prototype
    await new Promise(resolve => setTimeout(resolve, 1500))

    // TODO: Navigate to login or dashboard after successful registration
    // await navigateTo('/login')
  }
  catch {
    errorMessage.value = 'Error al crear la cuenta. Por favor, intenta de nuevo.'
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
          title="Crea tu cuenta"
          subtitle="Unete a VeriTix y descubre tu proximo concierto"
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

            <!-- All fields stacked vertically with equal spacing -->
            <UFormField
              name="firstName"
              label="Nombre"
              required
              class="w-full"
            >
              <UInput
                v-model="state.firstName"
                placeholder="Juan"
                icon="i-lucide-user"
                color="neutral"
                variant="outline"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField
              name="lastName"
              label="Apellido"
              required
              class="w-full"
            >
              <UInput
                v-model="state.lastName"
                placeholder="Garcia"
                icon="i-lucide-user"
                color="neutral"
                variant="outline"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField
              name="phone"
              label="Telefono"
              required
              class="w-full"
            >
              <UInput
                v-model="state.phone"
                type="tel"
                placeholder="+34 612 345 678"
                icon="i-lucide-phone"
                color="neutral"
                variant="outline"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField
              name="password"
              label="Contrasena"
              required
              class="w-full"
            >
              <UInput
                v-model="state.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Minimo 8 caracteres"
                icon="i-lucide-lock"
                color="neutral"
                variant="outline"
                size="lg"
                class="w-full"
              >
                <template #trailing>
                  <button
                    type="button"
                    class="text-[var(--ui-text-muted)] transition-colors duration-200 hover:text-[var(--color-auric-400)]"
                    @click="showPassword = !showPassword"
                  >
                    <UIcon
                      :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      class="h-5 w-5"
                    />
                  </button>
                </template>
              </UInput>
            </UFormField>

            <UFormField
              name="confirmPassword"
              label="Confirmar contrasena"
              required
              class="w-full"
            >
              <UInput
                v-model="state.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Repite tu contrasena"
                icon="i-lucide-lock"
                color="neutral"
                variant="outline"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <!-- Terms -->
            <p class="mt-2 text-center text-xs text-[var(--ui-text-muted)]">
              Al registrarte, aceptas nuestros
              <NuxtLink
                to="/terminos"
                class="text-[var(--color-auric-400)] transition-colors duration-200 hover:text-[var(--color-auric-300)]"
              >
                Terminos de Servicio
              </NuxtLink>
              y
              <NuxtLink
                to="/privacidad"
                class="text-[var(--color-auric-400)] transition-colors duration-200 hover:text-[var(--color-auric-300)]"
              >
                Politica de Privacidad
              </NuxtLink>.
            </p>

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
              Crear cuenta
            </UButton>
          </UForm>

          <template #footer>
            <p class="text-center text-sm text-[var(--ui-text-muted)]">
              ¿Ya tienes cuenta?
              <NuxtLink
                to="/login"
                class="font-medium text-[var(--color-auric-400)] transition-colors duration-200 hover:text-[var(--color-auric-300)]"
              >
                Inicia sesion
              </NuxtLink>
            </p>
          </template>
        </AuthAuthCard>
      </div>
    </UContainer>
  </div>
</template>
