<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Seguridad de la cuenta | VeriTix',
  description: 'Zona protegida para cambiar tu contrasena de acceso.',
})

const schema = z.object({
  currentPassword: z.string().min(1, 'La contrasena actual es obligatoria'),
  newPassword: z.string().min(8, 'La nueva contrasena debe tener al menos 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Debe incluir mayuscula, minuscula y numero'),
  confirmPassword: z.string().min(1, 'Confirma la nueva contrasena'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
})

const state = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const { pending, changePassword } = useProfile()
const { getApiErrorMessage } = useApiErrorMessage()

async function onSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await changePassword({
      currentPassword: state.currentPassword,
      newPassword: state.newPassword,
    })

    state.currentPassword = ''
    state.newPassword = ''
    state.confirmPassword = ''
    successMessage.value = 'Contrasena actualizada correctamente.'
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos actualizar tu contrasena. Intenta de nuevo.')
  }
}
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <UCard class="mx-auto max-w-3xl">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="font-display text-2xl text-highlighted">
              Seguridad de la cuenta
            </h1>
            <p class="mt-1 text-sm text-toned">
              Cambia tu contrasena para mantener tu cuenta protegida.
            </p>
          </div>

          <UButton
            to="/users/me"
            color="neutral"
            variant="outline"
            size="sm"
          >
            Volver al perfil
          </UButton>
        </div>
      </template>

      <div class="space-y-5">
        <p
          v-if="errorMessage"
          class="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
        >
          {{ errorMessage }}
        </p>

        <p
          v-if="successMessage"
          class="rounded-2xl border border-success/35 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {{ successMessage }}
        </p>

        <UForm
          :state="state"
          :schema="schema"
          :validate-on="[]"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField name="currentPassword" label="Contrasena actual" required>
            <UInput
              v-model="state.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="Tu contrasena actual"
              icon="i-lucide-lock"
              :ui="{ base: 'h-12' }"
            >
              <template #trailing>
                <button
                  type="button"
                  :aria-label="showCurrentPassword ? 'Ocultar contrasena actual' : 'Mostrar contrasena actual'"
                  class="rounded-md p-0.5 text-muted transition-colors duration-200 hover:text-auric-300"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <UIcon
                    :name="showCurrentPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    class="size-5"
                  />
                </button>
              </template>
            </UInput>
          </UFormField>

          <UFormField
            name="newPassword"
            label="Nueva contrasena"
            help="Minimo 8 caracteres, con mayuscula, minuscula y numero."
            required
          >
            <UInput
              v-model="state.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Nueva contrasena"
              icon="i-lucide-shield"
              :ui="{ base: 'h-12' }"
            >
              <template #trailing>
                <button
                  type="button"
                  :aria-label="showNewPassword ? 'Ocultar nueva contrasena' : 'Mostrar nueva contrasena'"
                  class="rounded-md p-0.5 text-muted transition-colors duration-200 hover:text-auric-300"
                  @click="showNewPassword = !showNewPassword"
                >
                  <UIcon
                    :name="showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    class="size-5"
                  />
                </button>
              </template>
            </UInput>
          </UFormField>

          <UFormField name="confirmPassword" label="Confirmar nueva contrasena" required>
            <UInput
              v-model="state.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Repite la nueva contrasena"
              icon="i-lucide-check-check"
              :ui="{ base: 'h-12' }"
            >
              <template #trailing>
                <button
                  type="button"
                  :aria-label="showConfirmPassword ? 'Ocultar confirmacion de contrasena' : 'Mostrar confirmacion de contrasena'"
                  class="rounded-md p-0.5 text-muted transition-colors duration-200 hover:text-auric-300"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <UIcon
                    :name="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    class="size-5"
                  />
                </button>
              </template>
            </UInput>
          </UFormField>

          <UButton
            type="submit"
            color="primary"
            variant="solid"
            size="lg"
            :loading="pending"
          >
            Actualizar contrasena
          </UButton>
        </UForm>
      </div>
    </UCard>
  </UContainer>
</template>
