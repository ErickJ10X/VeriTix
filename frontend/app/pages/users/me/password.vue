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
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'La nueva contrasena debe ser distinta a la actual',
  path: ['newPassword'],
})

const state = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordRules = [
  'Minimo 8 caracteres para evitar claves debiles.',
  'Incluye una mayuscula, una minuscula y un numero.',
  'Evita reutilizar la misma contrasena en otros servicios.',
]

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
  <UsersSettingsShell
    eyebrow="Seguridad"
    badge="Zona protegida"
    title="Renueva tu contrasena con mas contexto y menos friccion"
    description="Actualiza tu contrasena desde una zona protegida, revisa las reglas clave antes de enviar y manton el acceso de tu cuenta bajo control."
    action-to="/users/me"
    action-label="Volver al perfil"
  >
    <template #hero>
      <div class="flex flex-wrap gap-3">
        <span
          v-for="rule in passwordRules"
          :key="rule"
          class="inline-flex items-center gap-2 rounded-full border border-default/70 bg-default/10 px-4 py-2 text-xs font-medium tracking-[0.04em] text-toned"
        >
          <UIcon name="i-lucide-check" class="size-3.5 text-primary" />
          {{ rule }}
        </span>
      </div>
    </template>

    <section class="space-y-6">
      <div class="grid gap-4 border-b border-default/55 pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p class="text-[0.68rem] font-semibold tracking-[0.26em] text-dimmed uppercase">
            Actualizacion de acceso
          </p>
          <h2 class="mt-3 text-2xl font-semibold text-highlighted sm:text-[1.9rem]">
            Cambiar contrasena
          </h2>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-toned">
            Introduce tu clave actual, confirma la nueva y aplica una combinacion mas segura antes de cerrar la sesion.
          </p>
        </div>

        <p class="text-sm text-toned lg:max-w-xs lg:text-right">
          Consulta primero las reglas clave, valida tu identidad actual y aplica una nueva contrasena con menos friccion.
        </p>
      </div>

      <div class="space-y-5">
        <p
          v-if="errorMessage"
          role="alert"
          aria-live="polite"
          class="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
        >
          {{ errorMessage }}
        </p>

        <p
          v-if="successMessage"
          role="status"
          aria-live="polite"
          class="rounded-2xl border border-success/35 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {{ successMessage }}
        </p>

        <UForm
          :state="state"
          :schema="schema"
          :validate-on="[]"
          class="space-y-8"
          @submit="onSubmit"
        >
          <section class="space-y-5 border-b border-default/55 pb-8">
            <div>
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Verificacion actual
              </p>
              <p class="mt-2 text-sm text-toned">
                Confirma primero tu clave vigente para validar que eres tu quien esta realizando el cambio.
              </p>
            </div>

            <UFormField name="currentPassword" label="Contrasena actual" required>
              <UInput
                v-model="state.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                placeholder="Tu contrasena actual"
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
          </section>

          <section class="space-y-5 border-b border-default/55 pb-8">
            <div>
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Nueva clave
              </p>
              <p class="mt-2 text-sm text-toned">
                Define una combinacion nueva, mas fuerte y distinta de la actual para reducir riesgos de reutilizacion.
              </p>
            </div>

            <div class="grid gap-5">
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
                  color="neutral"
                  variant="subtle"
                  size="lg"
                  class="w-full"
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
                  color="neutral"
                  variant="subtle"
                  size="lg"
                  class="w-full"
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
            </div>
          </section>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-toned">
              Cambiar la clave desde aqui evita depender de enlaces externos y mantiene el control dentro de tu cuenta.
            </p>

            <UButton
              type="submit"
              color="primary"
              variant="solid"
              size="lg"
              class="rounded-full px-6"
              :loading="pending"
            >
              Actualizar contrasena
            </UButton>
          </div>
        </UForm>
      </div>
    </section>

    <template #aside>
      <div class="space-y-8">
        <section class="space-y-4 border-b border-default/55 pb-8">
          <div>
            <p class="text-[0.68rem] font-semibold tracking-[0.24em] text-dimmed uppercase">
              Buenas practicas
            </p>
            <h3 class="mt-2 text-xl font-semibold text-highlighted">
              Recomendaciones de seguridad
            </h3>
          </div>

          <ul class="space-y-3">
            <li
              v-for="rule in passwordRules"
              :key="rule"
              class="flex items-start gap-3 text-sm leading-relaxed text-toned"
            >
              <span class="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/14 text-primary">
                <UIcon name="i-lucide-shield" class="size-3.5" />
              </span>
              <span>{{ rule }}</span>
            </li>
          </ul>
        </section>

        <section class="space-y-4">
          <div>
            <p class="text-[0.68rem] font-semibold tracking-[0.24em] text-dimmed uppercase">
              Contexto
            </p>
            <p class="mt-2 text-sm leading-relaxed text-toned">
              Usa este espacio para revisar recomendaciones esenciales antes de guardar cambios y evitar errores comunes al rotar tu clave.
            </p>
          </div>

          <div class="border-l-2 border-default/65 pl-4">
            <p class="text-sm font-semibold text-highlighted">
              Consejo rapido
            </p>
            <p class="mt-2 text-sm leading-relaxed text-toned">
              Si vienes de una sesion compartida o publica, actualiza tu contrasena antes de cerrar para salir con una clave renovada.
            </p>
          </div>
        </section>
      </div>
    </template>
  </UsersSettingsShell>
</template>
