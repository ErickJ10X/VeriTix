<script setup lang="ts">
import type { UserRole } from '~~/shared/types'
import { z } from 'zod'

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Mi perfil | VeriTix',
  description: 'Gestiona la informacion principal de tu cuenta de VeriTix.',
})

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'El telefono debe estar en formato E.164 (ej: +34958123456)').or(z.literal('')),
  avatarUrl: z.string().url('Introduce una URL valida').or(z.literal('')),
})

const state = reactive({
  name: '',
  lastName: '',
  phone: '',
  avatarUrl: '',
})

const errorMessage = ref('')
const successMessage = ref('')
const initialized = ref(false)

const { user, pending, fetchProfile, updateProfile } = useProfile()
const { getApiErrorMessage } = useApiErrorMessage()

const roleLabels: Record<UserRole, string> = {
  BUYER: 'Comprador',
  CREATOR: 'Creador',
  VALIDATOR: 'Validador',
  ADMIN: 'Administrador',
}

const roleViews: Record<UserRole, { title: string, summary: string, capabilities: string[] }> = {
  BUYER: {
    title: 'Vista de comprador',
    summary: 'Tu perfil se centra en compras, historial de entradas y datos de contacto para notificaciones.',
    capabilities: [
      'Gestion de datos personales para compras y facturacion.',
      'Acceso a tus entradas compradas y estados de uso.',
      'Preferencias de contacto para avisos de eventos.',
    ],
  },
  CREATOR: {
    title: 'Vista de creador',
    summary: 'Tu perfil muestra configuracion orientada a publicacion y operacion de eventos.',
    capabilities: [
      'Datos de identidad y contacto comercial del creador.',
      'Accesos a herramientas de gestion de eventos publicados.',
      'Contexto para soporte operativo y configuracion avanzada.',
    ],
  },
  VALIDATOR: {
    title: 'Vista de validador',
    summary: 'Tu perfil prioriza accesos operativos para validacion y control de entradas.',
    capabilities: [
      'Datos personales para asignacion interna de operaciones.',
      'Acceso a herramientas de escaneo y validacion de tickets.',
      'Visibilidad de permisos de control segun asignaciones.',
    ],
  },
  ADMIN: {
    title: 'Vista de administrador',
    summary: 'Tu perfil incluye controles de cuenta y visibilidad ampliada para administracion.',
    capabilities: [
      'Gestion integral de datos personales y seguridad de la cuenta.',
      'Acceso a paneles de administracion de usuarios y plataforma.',
      'Visibilidad de funciones criticas de control y soporte.',
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
  const initials = [state.name || user.value?.name, state.lastName || user.value?.lastName]
    .map(value => value?.trim()?.charAt(0)?.toUpperCase() ?? '')
    .join('')

  return initials || 'VT'
})

const profileCompletion = computed(() => {
  const entries = [
    state.name.trim(),
    state.lastName.trim(),
    state.phone.trim(),
    state.avatarUrl.trim(),
  ]

  return Math.round((entries.filter(Boolean).length / entries.length) * 100)
})

const profileMetrics = computed(() => {
  return [
    {
      label: 'Email principal',
      value: user.value?.email ?? 'Pendiente',
      tone: 'text-highlighted',
    },
    {
      label: 'Rol activo',
      value: roleLabel.value,
      tone: 'text-secondary',
    },
    {
      label: 'Perfil completo',
      value: `${profileCompletion.value}%`,
      tone: 'text-auric-200',
    },
  ]
})

function applyProfileState() {
  if (!user.value) {
    return
  }

  state.name = user.value.name
  state.lastName = user.value.lastName
  state.phone = user.value.phone ?? ''
  state.avatarUrl = user.value.avatarUrl ?? ''
}

async function loadProfile() {
  errorMessage.value = ''

  try {
    await fetchProfile()
    applyProfileState()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar tu perfil. Intenta de nuevo en unos instantes.')
  }
  finally {
    initialized.value = true
  }
}

async function onSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await updateProfile({
      name: state.name.trim(),
      lastName: state.lastName.trim(),
      phone: state.phone.trim(),
      avatarUrl: state.avatarUrl.trim() || undefined,
    })

    applyProfileState()
    successMessage.value = 'Perfil actualizado correctamente.'
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos guardar los cambios del perfil.')
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
    title="Ajusta tu identidad dentro de VeriTix"
    description="Consulta tu identidad de cuenta, actualiza datos de contacto y revisa de un vistazo el estado general de tu perfil dentro de VeriTix."
    action-to="/users/me/password"
    action-label="Ir a seguridad"
  >
    <template #hero>
      <div v-if="!initialized" class="grid gap-3 md:grid-cols-3">
        <USkeleton class="h-24 rounded-2xl" />
        <USkeleton class="h-24 rounded-2xl" />
        <USkeleton class="h-24 rounded-2xl" />
      </div>

      <div v-else class="grid gap-4 md:grid-cols-3">
        <article
          v-for="metric in profileMetrics"
          :key="metric.label"
          class="border-l-2 border-default/65 pl-4"
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

    <section class="space-y-6">
      <div class="grid gap-4 border-b border-default/55 pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p class="text-[0.68rem] font-semibold tracking-[0.26em] text-dimmed uppercase">
            Datos de cuenta
          </p>
          <h2 class="mt-3 text-2xl font-semibold text-highlighted sm:text-[1.9rem]">
            Informacion principal
          </h2>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-toned">
            Gestiona tu informacion principal, manton tus datos al dia y deja tu cuenta lista para compras, soporte y notificaciones.
          </p>
        </div>

        <p class="text-sm text-toned lg:max-w-xs lg:text-right">
          Revisa el estado general de tu cuenta y actualiza tus datos sin perder de vista la seguridad y el contexto de uso.
        </p>
      </div>

      <div v-if="!initialized" class="space-y-3">
        <USkeleton class="h-11 rounded-2xl" />
        <USkeleton class="h-11 rounded-2xl" />
        <USkeleton class="h-11 rounded-2xl" />
        <USkeleton class="h-11 rounded-2xl" />
      </div>

      <div v-else class="space-y-6">
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
                Identidad
              </p>
              <p class="mt-2 text-sm text-toned">
                Actualiza el nombre que acompana tu cuenta en compras, validaciones y comunicaciones.
              </p>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <UFormField name="name" label="Nombre" required>
                <UInput
                  v-model="state.name"
                  placeholder="Nombre"
                  icon="i-lucide-user"
                  color="neutral"
                  variant="subtle"
                  size="lg"
                  class="w-full"
                  :ui="{ base: 'h-12' }"
                />
              </UFormField>

              <UFormField name="lastName" label="Apellido" required>
                <UInput
                  v-model="state.lastName"
                  placeholder="Apellido"
                  icon="i-lucide-user-round"
                  color="neutral"
                  variant="subtle"
                  size="lg"
                  class="w-full"
                  :ui="{ base: 'h-12' }"
                />
              </UFormField>
            </div>
          </section>

          <section class="space-y-5 border-b border-default/55 pb-8">
            <div>
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Contacto y presencia
              </p>
              <p class="mt-2 text-sm text-toned">
                Estos datos te ayudan a mantener avisos, soporte y visibilidad de perfil bajo control. El telefono puede dejarse vacio si aun no quieres configurarlo.
              </p>
            </div>

            <div class="grid gap-5">
              <UFormField
                name="phone"
                label="Telefono"
                help="Opcional. Si lo completas, usa formato internacional E.164. Ejemplo: +34958123456"
              >
                <UInput
                  v-model="state.phone"
                  type="tel"
                  placeholder="+34958123456"
                  icon="i-lucide-phone"
                  color="neutral"
                  variant="subtle"
                  size="lg"
                  class="w-full"
                  :ui="{ base: 'h-12' }"
                />
              </UFormField>

              <UFormField
                name="avatarUrl"
                label="Avatar URL"
                help="Opcional. Puedes dejarlo vacio si no quieres avatar."
              >
                <UInput
                  v-model="state.avatarUrl"
                  type="url"
                  placeholder="https://..."
                  icon="i-lucide-image"
                  color="neutral"
                  variant="subtle"
                  size="lg"
                  class="w-full"
                  :ui="{ base: 'h-12' }"
                />
              </UFormField>
            </div>
          </section>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-toned">
              Mantener estos datos al dia mejora notificaciones, compras y soporte operativo.
            </p>

            <UButton
              type="submit"
              color="primary"
              variant="solid"
              size="lg"
              class="rounded-full px-6"
              :loading="pending"
            >
              Guardar cambios
            </UButton>
          </div>
        </UForm>
      </div>
    </section>

    <template #aside>
      <div class="space-y-8">
        <section class="space-y-5 border-b border-default/55 pb-8">
          <div class="flex items-center gap-4">
            <div class="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-auric-300/35 bg-auric-400/10 text-lg font-semibold text-auric-100 shadow-[0_16px_32px_-24px_rgba(239,170,71,0.8)]">
              {{ profileInitials }}
            </div>

            <div>
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Identidad visible
              </p>
              <p class="mt-2 text-lg font-semibold text-highlighted">
                {{ state.name || user?.name }} {{ state.lastName || user?.lastName }}
              </p>
              <p class="mt-1 text-sm text-toned">
                {{ user?.email }}
              </p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div class="border-l-2 border-default/65 pl-4">
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Avatar
              </p>
              <p class="mt-2 text-sm font-semibold text-highlighted">
                {{ state.avatarUrl.trim() ? 'Configurado' : 'Sin personalizar' }}
              </p>
            </div>

            <div class="border-l-2 border-default/65 pl-4">
              <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                Contacto
              </p>
              <p class="mt-2 text-sm font-semibold text-highlighted">
                {{ state.phone || 'Pendiente de completar' }}
              </p>
            </div>
          </div>
        </section>

        <section v-if="roleView" class="space-y-4 border-b border-default/55 pb-8">
          <div>
            <p class="text-[0.68rem] font-semibold tracking-[0.24em] text-primary uppercase">
              Perfil dinamico por rol
            </p>
            <h2 class="mt-2 text-xl font-semibold text-highlighted">
              {{ roleView.title }}
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-toned">
              {{ roleView.summary }}
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

        <section class="space-y-4">
          <div>
            <p class="text-[0.68rem] font-semibold tracking-[0.24em] text-dimmed uppercase">
              Acciones rapidas
            </p>
            <p class="mt-2 text-sm leading-relaxed text-toned">
              Accede rapido a los movimientos mas comunes de tu cuenta sin perder tiempo navegando entre pantallas.
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <UButton to="/users/me/password" color="primary" variant="outline" size="lg" class="justify-center rounded-full">
              Revisar seguridad
            </UButton>
            <UButton to="/" color="neutral" variant="ghost" size="lg" class="justify-center rounded-full">
              Volver al inicio
            </UButton>
          </div>
        </section>
      </div>
    </template>
  </UsersSettingsShell>
</template>
