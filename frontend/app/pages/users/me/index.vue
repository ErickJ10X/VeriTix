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

const passwordRules = ['8+ caracteres', '1 mayuscula', '1 numero', 'Clave nueva'] as const

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

      <div v-else class="grid gap-4 md:grid-cols-3">
          <article
            v-for="metric in profileMetrics"
            :key="metric.label"
            class="vtx-profile-metric"
          >
          <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
            {{ metric.label }}
          </p>
          <p class="mt-3 text-base font-semibold" :class="metric.tone">
            {{ metric.value }}
          </p>
        </article>
      </div>
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

      <div v-else class="space-y-10">
        <UForm
          :state="profileState"
          :schema="profileSchema"
          :validate-on="[]"
          class="space-y-8"
          @submit="submitProfile"
        >
          <p
            v-if="profileErrorMessage"
            role="alert"
            aria-live="polite"
            class="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
          >
            {{ profileErrorMessage }}
          </p>

          <p
            v-if="profileSuccessMessage"
            role="status"
            aria-live="polite"
            class="rounded-2xl border border-success/35 bg-success/10 px-4 py-3 text-sm text-success"
          >
            {{ profileSuccessMessage }}
          </p>

          <section class="space-y-5 border-b border-default/55 pb-8">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-semibold text-highlighted">
                Identidad
              </h3>
              <UBadge color="neutral" variant="soft">
                {{ roleLabel }}
              </UBadge>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <BaseFormField
                v-model="profileState.name"
                name="name"
                label="Nombre"
                placeholder="Nombre"
                icon="i-lucide-user"
                required
              />

              <BaseFormField
                v-model="profileState.lastName"
                name="lastName"
                label="Apellido"
                placeholder="Apellido"
                icon="i-lucide-user-round"
                required
              />
            </div>
          </section>

          <section class="space-y-5 border-b border-default/55 pb-8">
            <h3 class="text-lg font-semibold text-highlighted">
              Contacto
            </h3>

            <div class="grid gap-5">
              <BaseFormField
                v-model="profileState.phone"
                name="phone"
                label="Telefono"
                help="Opcional · formato E.164"
                type="tel"
                placeholder="+34958123456"
                icon="i-lucide-phone"
              />

              <BaseFormField
                v-model="profileState.avatarUrl"
                name="avatarUrl"
                label="Avatar URL"
                help="Opcional"
                type="url"
                placeholder="https://..."
                icon="i-lucide-image"
              />
            </div>
          </section>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span class="text-sm text-toned">
              Datos visibles y de contacto.
            </span>

            <BasePrimaryButton
              type="submit"
              size="lg"
              class="vtx-profile-submit px-6"
              :loading="profileSubmitting"
            >
              Guardar perfil
            </BasePrimaryButton>
          </div>
        </UForm>

        <section id="seguridad" class="scroll-mt-28 space-y-6 border-t border-default/55 pt-8">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-[0.68rem] font-semibold tracking-[0.24em] text-dimmed uppercase">
                Seguridad
              </p>
              <h3 class="mt-3 text-2xl font-semibold text-highlighted">
                Cambiar contrasena
              </h3>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="rule in passwordRules"
                :key="rule"
                class="inline-flex items-center rounded-full border border-default/60 bg-default/8 px-3 py-1.5 text-[0.68rem] font-semibold tracking-[0.12em] text-toned uppercase"
              >
                {{ rule }}
              </span>
            </div>
          </div>

          <UForm
            :state="passwordState"
            :schema="passwordSchema"
            :validate-on="[]"
            class="space-y-6"
            @submit="submitPassword"
          >
            <p
              v-if="securityErrorMessage"
              role="alert"
              aria-live="polite"
              class="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
            >
              {{ securityErrorMessage }}
            </p>

            <p
              v-if="securitySuccessMessage"
              role="status"
              aria-live="polite"
              class="rounded-2xl border border-success/35 bg-success/10 px-4 py-3 text-sm text-success"
            >
              {{ securitySuccessMessage }}
            </p>

            <BasePasswordField
              v-model="passwordState.currentPassword"
              name="currentPassword"
              label="Contrasena actual"
              placeholder="Contrasena actual"
              icon="i-lucide-lock"
              :show="showCurrentPassword"
              required
              @update:show="showCurrentPassword = $event"
            />

            <div class="grid gap-5 lg:grid-cols-2">
              <BasePasswordField
                v-model="passwordState.newPassword"
                name="newPassword"
                label="Nueva contrasena"
                help="8+ caracteres · mayuscula · minuscula · numero"
                placeholder="Nueva contrasena"
                icon="i-lucide-shield"
                :show="showNewPassword"
                required
                @update:show="showNewPassword = $event"
              />

              <BasePasswordField
                v-model="passwordState.confirmPassword"
                name="confirmPassword"
                label="Confirmar contrasena"
                placeholder="Confirmar contrasena"
                icon="i-lucide-check-check"
                :show="showConfirmPassword"
                required
                @update:show="showConfirmPassword = $event"
              />
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span class="text-sm text-toned">
                Acceso y proteccion de la cuenta.
              </span>

              <BasePrimaryButton
                type="submit"
                size="lg"
                class="vtx-profile-submit px-6"
                :loading="passwordSubmitting"
              >
                Actualizar contrasena
              </BasePrimaryButton>
            </div>
          </UForm>
        </section>
      </div>
    </section>

    <template #aside>
      <div class="space-y-8">
        <section class="relative vtx-profile-presence space-y-5 border-b border-default/55 pb-8">
          <div class="flex items-center gap-4">
            <div class="vtx-profile-avatar flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-auric-100">
              {{ profileInitials }}
            </div>

            <div>
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Identidad visible
              </p>
              <p class="mt-2 text-lg font-semibold text-highlighted">
                {{ profileState.name || user?.name }} {{ profileState.lastName || user?.lastName }}
              </p>
              <p class="mt-1 text-sm text-toned">
                {{ user?.email }}
              </p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div class="vtx-profile-signal">
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Avatar
              </p>
              <p class="mt-2 text-sm font-semibold text-highlighted">
                {{ profileState.avatarUrl.trim() ? 'Configurado' : 'Sin personalizar' }}
              </p>
            </div>

            <div class="vtx-profile-signal">
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Telefono
              </p>
              <p class="mt-2 text-sm font-semibold text-highlighted">
                {{ profileState.phone || 'Pendiente' }}
              </p>
            </div>
          </div>
        </section>

        <section v-if="roleView" class="relative vtx-profile-role space-y-4 border-b border-default/55 pb-8">
          <div>
            <p class="text-[0.68rem] font-semibold tracking-[0.24em] text-primary uppercase">
              {{ roleView.title }}
            </p>
          </div>

          <ul class="space-y-3">
            <li
              v-for="capability in roleView.capabilities"
              :key="capability"
              class="flex items-start gap-3 text-sm leading-relaxed text-toned"
            >
              <span class="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/14 text-primary">
                <UIcon name="i-lucide-check" class="size-3.5" />
              </span>
              <span>{{ capability }}</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </UsersSettingsShell>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-profile-metric {
  @apply relative overflow-hidden rounded-2xl px-4 py-4;
  border: 1px solid rgb(145 161 190 / 0.18);
  background:
    linear-gradient(145deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.01)),
    linear-gradient(120deg, rgb(11 17 31 / 0.46), rgb(16 23 40 / 0.26));
}

.vtx-profile-metric::before {
  @apply absolute inset-x-4 top-0 h-px;
  content: '';
  background: linear-gradient(
    90deg,
    rgb(239 170 71 / 0),
    rgb(239 170 71 / 0.65),
    rgb(44 189 230 / 0.65),
    rgb(239 170 71 / 0)
  );
}

.vtx-profile-presence::before {
  @apply absolute -left-2 top-0 hidden h-28 w-28 rounded-full blur-3xl lg:block;
  content: '';
  background: radial-gradient(circle at center, rgb(239 170 71 / 0.16), rgb(255 255 255 / 0));
}

.vtx-profile-avatar {
  border: 1px solid rgb(239 170 71 / 0.45);
  background:
    radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.86), rgb(255 255 255 / 0) 38%),
    linear-gradient(135deg, rgb(239 170 71 / 0.4), rgb(44 189 230 / 0.4), rgb(240 100 127 / 0.28));
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.04),
    0 18px 34px -24px rgb(239 170 71 / 0.8);
}

.vtx-profile-signal {
  @apply relative pl-4;
}

.vtx-profile-signal::before {
  @apply absolute bottom-0 left-0 top-0 w-0.5 rounded-full;
  content: '';
  background: linear-gradient(180deg, rgb(239 170 71 / 0.9), rgb(44 189 230 / 0.8));
}

.vtx-profile-role::after {
  @apply absolute right-0 top-0 hidden h-20 w-20 rounded-full blur-2xl lg:block;
  content: '';
  background: radial-gradient(circle at center, rgb(44 189 230 / 0.14), rgb(255 255 255 / 0));
}

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
