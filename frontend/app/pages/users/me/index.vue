<script setup lang="ts">
import type { UserRole } from '~~/shared/types'
import { z } from 'zod'

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Ajustes de cuenta | VeriTix',
  description: 'Perfil, contacto y seguridad en una sola vista dentro de VeriTix.',
})

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'El telefono debe estar en formato E.164 (ej: +34958123456)').or(z.literal('')),
  avatarUrl: z.string().url('Introduce una URL valida').or(z.literal('')),
})

const passwordSchema = z.object({
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

const profileState = reactive({
  name: '',
  lastName: '',
  phone: '',
  avatarUrl: '',
})

const passwordState = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const profileErrorMessage = ref('')
const profileSuccessMessage = ref('')
const securityErrorMessage = ref('')
const securitySuccessMessage = ref('')
const initialized = ref(false)
const profileSubmitting = ref(false)
const passwordSubmitting = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const { user, fetchProfile, updateProfile, changePassword } = useProfile()
const { getApiErrorMessage } = useApiErrorMessage()

const roleLabels: Record<UserRole, string> = {
  BUYER: 'Comprador',
  CREATOR: 'Creador',
  VALIDATOR: 'Validador',
  ADMIN: 'Administrador',
}

const roleViews: Record<UserRole, { title: string, capabilities: string[] }> = {
  BUYER: {
    title: 'Acceso de comprador',
    capabilities: [
      'Datos para compras y facturacion',
      'Historial y uso de entradas',
      'Avisos relacionados con eventos',
    ],
  },
  CREATOR: {
    title: 'Acceso de creador',
    capabilities: [
      'Identidad comercial visible',
      'Gestion de eventos publicados',
      'Soporte operativo del perfil',
    ],
  },
  VALIDATOR: {
    title: 'Acceso de validador',
    capabilities: [
      'Asignacion operativa del perfil',
      'Herramientas de validacion',
      'Permisos segun operacion',
    ],
  },
  ADMIN: {
    title: 'Acceso de administrador',
    capabilities: [
      'Control de cuenta y seguridad',
      'Paneles internos de gestion',
      'Permisos ampliados de soporte',
    ],
  },
}

const roleLabel = computed(() => {
  if (!user.value?.role) {
    return 'Sin rol'
  }

  return roleLabels[user.value.role]
})

const roleView = computed(() => {
  if (!user.value?.role) {
    return null
  }

  return roleViews[user.value.role]
})

const isAdmin = computed(() => user.value?.role === 'ADMIN')

const profileInitials = computed(() => {
  const initials = [profileState.name || user.value?.name, profileState.lastName || user.value?.lastName]
    .map(value => value?.trim()?.charAt(0)?.toUpperCase() ?? '')
    .join('')

  return initials || 'VT'
})

const profileCompletion = computed(() => {
  const entries = [
    profileState.name.trim(),
    profileState.lastName.trim(),
    profileState.phone.trim(),
    profileState.avatarUrl.trim(),
  ]

  return Math.round((entries.filter(Boolean).length / entries.length) * 100)
})

const profileMetrics = computed(() => {
  return [
    {
      label: 'Email',
      value: user.value?.email ?? 'Pendiente',
      tone: 'text-highlighted',
    },
    {
      label: 'Rol',
      value: roleLabel.value,
      tone: 'text-secondary',
    },
    {
      label: 'Perfil',
      value: `${profileCompletion.value}%`,
      tone: 'text-auric-200',
    },
  ]
})

const hasProfileChanges = computed(() => {
  return (
    profileState.name.trim() !== user.value?.name
    || profileState.lastName.trim() !== user.value?.lastName
    || profileState.phone.trim() !== (user.value?.phone ?? '')
    || profileState.avatarUrl.trim() !== (user.value?.avatarUrl ?? '')
  )
})

function applyProfileState() {
  if (!user.value) {
    return
  }

  profileState.name = user.value.name
  profileState.lastName = user.value.lastName
  profileState.phone = user.value.phone ?? ''
  profileState.avatarUrl = user.value.avatarUrl ?? ''
}

async function loadProfile() {
  profileErrorMessage.value = ''

  try {
    await fetchProfile()
    applyProfileState()
  }
  catch (error) {
    profileErrorMessage.value = getApiErrorMessage(error, 'No pudimos cargar la cuenta.')
  }
  finally {
    initialized.value = true
  }
}

async function submitProfile() {
  if (!hasProfileChanges.value) {
    return
  }

  profileErrorMessage.value = ''
  profileSuccessMessage.value = ''
  profileSubmitting.value = true

  try {
    await updateProfile({
      name: profileState.name.trim(),
      lastName: profileState.lastName.trim(),
      phone: profileState.phone.trim(),
      avatarUrl: profileState.avatarUrl.trim() || undefined,
    })

    applyProfileState()
    profileSuccessMessage.value = 'Perfil actualizado.'
  }
  catch (error) {
    profileErrorMessage.value = getApiErrorMessage(error, 'No pudimos guardar el perfil.')
  }
  finally {
    profileSubmitting.value = false
  }
}

async function submitPassword() {
  securityErrorMessage.value = ''
  securitySuccessMessage.value = ''
  passwordSubmitting.value = true

  try {
    await changePassword({
      currentPassword: passwordState.currentPassword,
      newPassword: passwordState.newPassword,
    })

    passwordState.currentPassword = ''
    passwordState.newPassword = ''
    passwordState.confirmPassword = ''
    securitySuccessMessage.value = 'Contrasena actualizada.'
  }
  catch (error) {
    securityErrorMessage.value = getApiErrorMessage(error, 'No pudimos actualizar la contrasena.')
  }
  finally {
    passwordSubmitting.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <UsersSettingsShell
    eyebrow="Mi cuenta"
    badge="Perfil activo"
    title="Ajustes de cuenta"
    description="Perfil, contacto y seguridad en una sola vista."
    tone="vivid"
  >
    <template #hero>
      <div v-if="!initialized" class="grid gap-4 md:grid-cols-3">
        <USkeleton class="h-24 rounded-2xl" />
        <USkeleton class="h-24 rounded-2xl" />
        <USkeleton class="h-24 rounded-2xl" />
      </div>

      <UsersMetrics v-else :metrics="profileMetrics" />
    </template>

    <section class="space-y-10">
      <div class="flex items-end justify-between gap-4 border-b border-default/55 pb-6">
        <div>
          <p class="text-[0.68rem] font-semibold tracking-[0.26em] text-dimmed uppercase">
            Ajustes
          </p>
          <h2 class="mt-3 text-2xl font-semibold text-highlighted sm:text-[1.9rem]">
            Perfil
          </h2>
        </div>

        <span class="hidden text-[0.72rem] font-medium tracking-[0.14em] text-toned uppercase sm:inline-flex">
          Cuenta · Contacto · Seguridad
        </span>
      </div>

      <div v-if="!initialized" class="space-y-4">
        <USkeleton class="h-11 rounded-2xl" />
        <USkeleton class="h-11 rounded-2xl" />
        <USkeleton class="h-11 rounded-2xl" />
        <USkeleton class="h-11 rounded-2xl" />
        <USkeleton class="h-11 rounded-2xl" />
      </div>

      <div v-else class="space-y-8">
        <UForm
          :state="profileState"
          :schema="profileSchema"
          :validate-on="[]"
          class="space-y-6"
          @submit="submitProfile"
        >
          <BaseStatusMessage v-if="profileErrorMessage" :message="profileErrorMessage" />
          <BaseStatusMessage v-if="profileSuccessMessage" tone="success" :message="profileSuccessMessage" />

          <UsersProfileFields
            v-model:name="profileState.name"
            v-model:last-name="profileState.lastName"
            v-model:phone="profileState.phone"
            v-model:avatar-url="profileState.avatarUrl"
            :role-label="roleLabel"
          />

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <span class="text-sm text-toned">
              Datos visibles y de contacto.
            </span>

            <BasePrimaryButton
              type="submit"
              size="lg"
              class="vtx-profile-submit px-6"
              :loading="profileSubmitting"
              :disabled="!hasProfileChanges"
            >
              Guardar perfil
            </BasePrimaryButton>
          </div>
        </UForm>

        <section id="seguridad" class="scroll-mt-28 space-y-6 border-t border-default/55 pt-8">
          <UForm
            :state="passwordState"
            :schema="passwordSchema"
            :validate-on="[]"
            class="space-y-6"
            @submit="submitPassword"
          >
            <BaseStatusMessage v-if="securityErrorMessage" :message="securityErrorMessage" />
            <BaseStatusMessage v-if="securitySuccessMessage" tone="success" :message="securitySuccessMessage" />

            <UsersPasswordFields
              v-model:current-password="passwordState.currentPassword"
              v-model:new-password="passwordState.newPassword"
              v-model:confirm-password="passwordState.confirmPassword"
              v-model:show-current-password="showCurrentPassword"
              v-model:show-new-password="showNewPassword"
              v-model:show-confirm-password="showConfirmPassword"
            />

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span class="text-sm text-toned">
                Acceso y proteccion de la cuenta.
              </span>

              <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <BaseSecondaryButton
                  to="/users/me/logout"
                  size="lg"
                  class="px-6"
                >
                  Cerrar sesion
                </BaseSecondaryButton>

                <BasePrimaryButton
                  type="submit"
                  size="lg"
                  class="vtx-profile-submit px-6"
                  :loading="passwordSubmitting"
                >
                  Actualizar contrasena
                </BasePrimaryButton>
              </div>
            </div>
          </UForm>
        </section>
      </div>
    </section>

    <template #aside>
      <UsersProfileAside
        :initials="profileInitials"
        :full-name="`${profileState.name || user?.name || ''} ${profileState.lastName || user?.lastName || ''}`.trim()"
        :email="user?.email ?? 'Sin email'"
        :avatar-configured="Boolean(profileState.avatarUrl.trim())"
        :phone="profileState.phone"
        :is-admin="isAdmin"
        :role-view="roleView"
      />
    </template>
  </UsersSettingsShell>
</template>

<style scoped>
.vtx-profile-submit {
  border: 1px solid rgb(239 170 71 / 0.14);
  background: linear-gradient(180deg, rgb(239 170 71 / 0.1), rgb(239 170 71 / 0.06));
  color: rgb(247 249 255);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.05),
    0 14px 28px -24px rgb(239 170 71 / 0.42);
  transition:
    transform 0.15s ease-out,
    border-color 0.15s ease-out,
    background-color 0.15s ease-out,
    box-shadow 0.15s ease-out,
    color 0.15s ease-out;
}

.vtx-profile-submit:hover {
  border-color: rgb(239 170 71 / 0.22);
  background: linear-gradient(180deg, rgb(239 170 71 / 0.12), rgb(239 170 71 / 0.08));
  color: rgb(255 255 255);
  transform: translateY(-1px);
  box-shadow: 0 18px 30px -24px rgb(239 170 71 / 0.5);
}

.vtx-profile-submit:active {
  transform: translateY(1px);
}
</style>
