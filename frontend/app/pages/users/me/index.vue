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
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'El telefono debe estar en formato E.164 (ej: +34958123456)'),
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
  <UContainer class="py-10 sm:py-14">
    <UCard class="mx-auto max-w-3xl">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="font-display text-2xl text-highlighted">
              Mi perfil
            </h1>
            <p class="mt-1 text-sm text-toned">
              Edita tu informacion principal de cuenta.
            </p>
          </div>

          <UButton
            to="/users/me/password"
            color="neutral"
            variant="outline"
            size="sm"
          >
            Ir a seguridad
          </UButton>
        </div>
      </template>

      <div v-if="!initialized" class="space-y-3">
        <USkeleton class="h-11 w-full rounded-2xl" />
        <USkeleton class="h-11 w-full rounded-2xl" />
        <USkeleton class="h-11 w-full rounded-2xl" />
      </div>

      <div v-else class="space-y-5">
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

        <div class="grid gap-4 rounded-2xl border border-default/60 bg-default/40 p-4 sm:grid-cols-2">
          <div>
            <p class="text-xs tracking-[0.16em] text-dimmed uppercase">
              Email
            </p>
            <p class="mt-1 text-sm text-highlighted">
              {{ user?.email }}
            </p>
          </div>

          <div>
            <p class="text-xs tracking-[0.16em] text-dimmed uppercase">
              Rol
            </p>
            <UBadge color="info" variant="soft" class="mt-1">
              {{ roleLabel }}
            </UBadge>
          </div>
        </div>

        <div
          v-if="roleView"
          class="space-y-3 rounded-2xl border border-primary/25 bg-primary/8 p-4"
        >
          <div>
            <p class="text-xs tracking-widest text-primary uppercase">
              Perfil dinamico por rol
            </p>
            <h2 class="mt-1 text-base font-semibold text-highlighted">
              {{ roleView.title }}
            </h2>
            <p class="mt-1 text-sm text-toned">
              {{ roleView.summary }}
            </p>
          </div>

          <ul class="space-y-2">
            <li
              v-for="capability in roleView.capabilities"
              :key="capability"
              class="flex items-start gap-2 text-sm text-toned"
            >
              <UIcon name="i-lucide-check" class="mt-0.5 size-4 text-primary" />
              <span>{{ capability }}</span>
            </li>
          </ul>
        </div>

        <UForm
          :state="state"
          :schema="schema"
          :validate-on="[]"
          class="space-y-4"
          @submit="onSubmit"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField name="name" label="Nombre" required>
              <UInput
                v-model="state.name"
                placeholder="Nombre"
                icon="i-lucide-user"
                :ui="{ base: 'h-12' }"
              />
            </UFormField>

            <UFormField name="lastName" label="Apellido" required>
              <UInput
                v-model="state.lastName"
                placeholder="Apellido"
                icon="i-lucide-user-round"
                :ui="{ base: 'h-12' }"
              />
            </UFormField>
          </div>

          <UFormField
            name="phone"
            label="Telefono"
            help="Formato internacional E.164. Ejemplo: +34958123456"
            required
          >
            <UInput
              v-model="state.phone"
              type="tel"
              placeholder="+34958123456"
              icon="i-lucide-phone"
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
              :ui="{ base: 'h-12' }"
            />
          </UFormField>

          <UButton
            type="submit"
            color="primary"
            variant="solid"
            size="lg"
            :loading="pending"
          >
            Guardar cambios
          </UButton>
        </UForm>
      </div>
    </UCard>
  </UContainer>
</template>
