<script setup lang="ts">
import type { UserRole } from '~~/shared/types'
import type { AdminCreateUserPayload, AdminUpdateUserPayload, AdminUserRecord } from '~/types'
import { z } from 'zod'

const props = withDefaults(defineProps<{
  mode: 'create' | 'edit'
  initialValue?: Partial<AdminUserRecord>
  submitting?: boolean
  submitLabel?: string
}>(), {
  initialValue: undefined,
  submitting: false,
  submitLabel: 'Guardar usuario',
})

const emit = defineEmits<{
  submit: [payload: AdminCreateUserPayload | AdminUpdateUserPayload]
}>()

const { roleOptions } = useAdminApi()

const state = reactive({
  email: '',
  phone: '',
  name: '',
  lastName: '',
  password: '',
  role: 'BUYER' as UserRole,
  avatarUrl: '',
  isActive: true,
  emailVerified: false,
})

const schema = computed(() => {
  if (props.mode === 'create') {
    return z.object({
      email: z.string().email('Introduce un email válido'),
      phone: z.string().min(1, 'El teléfono es obligatorio'),
      name: z.string().min(1, 'El nombre es obligatorio'),
      lastName: z.string().min(1, 'El apellido es obligatorio'),
      password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
      role: z.enum(['BUYER', 'CREATOR', 'VALIDATOR', 'ADMIN']),
      avatarUrl: z.string().optional(),
      isActive: z.boolean(),
      emailVerified: z.boolean(),
    })
  }

  return z.object({
    email: z.string().email('Introduce un email válido'),
    phone: z.string().min(1, 'El teléfono es obligatorio'),
    name: z.string().min(1, 'El nombre es obligatorio'),
    lastName: z.string().min(1, 'El apellido es obligatorio'),
    role: z.enum(['BUYER', 'CREATOR', 'VALIDATOR', 'ADMIN']),
    avatarUrl: z.string().optional(),
    isActive: z.boolean(),
    emailVerified: z.boolean(),
  })
})

function applyInitialValue() {
  state.email = props.initialValue?.email ?? ''
  state.phone = props.initialValue?.phone ?? ''
  state.name = props.initialValue?.name ?? ''
  state.lastName = props.initialValue?.lastName ?? ''
  state.password = ''
  state.role = props.initialValue?.role ?? 'BUYER'
  state.avatarUrl = props.initialValue?.avatarUrl ?? ''
  state.isActive = props.initialValue?.isActive ?? true
  state.emailVerified = props.initialValue?.emailVerified ?? false
}

function handleSubmit() {
  if (props.mode === 'create') {
    emit('submit', {
      email: state.email.trim(),
      phone: state.phone.trim(),
      name: state.name.trim(),
      lastName: state.lastName.trim(),
      password: state.password,
      role: state.role,
    })
    return
  }

  emit('submit', {
    email: state.email.trim(),
    phone: state.phone.trim(),
    name: state.name.trim(),
    lastName: state.lastName.trim(),
    role: state.role,
    avatarUrl: state.avatarUrl.trim() || undefined,
    isActive: state.isActive,
    emailVerified: state.emailVerified,
  })
}

watch(() => props.initialValue, applyInitialValue, { immediate: true })
</script>

<template>
  <UForm :state="state" :schema="schema" :validate-on="[]" class="space-y-8" @submit="handleSubmit">
    <div class="grid gap-5 lg:grid-cols-2">
      <BaseFormField v-model="state.name" name="name" label="Nombre" required />
      <BaseFormField v-model="state.lastName" name="lastName" label="Apellido" required />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <BaseFormField v-model="state.email" name="email" label="Email" type="email" required />
      <BaseFormField v-model="state.phone" name="phone" label="Teléfono" required />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <UFormField name="role" label="Rol" required>
        <select v-model="state.role" class="vtx-admin-select">
          <option v-for="option in roleOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </UFormField>

      <BaseFormField v-if="mode === 'edit'" v-model="state.avatarUrl" name="avatarUrl" label="Avatar URL" type="url" placeholder="https://..." />
      <BaseFormField v-else v-model="state.password" name="password" label="Contraseña" type="password" required />
    </div>

    <div v-if="mode === 'edit'" class="grid gap-4 lg:grid-cols-2">
      <label class="vtx-admin-toggle">
        <input v-model="state.isActive" type="checkbox">
        <span>
          <strong>Usuario activo</strong>
          <small>Permite acceso a la plataforma</small>
        </span>
      </label>

      <label class="vtx-admin-toggle">
        <input v-model="state.emailVerified" type="checkbox">
        <span>
          <strong>Email verificado</strong>
          <small>Marca la cuenta como validada</small>
        </span>
      </label>
    </div>

    <div class="flex justify-end">
      <BasePrimaryButton type="submit" size="lg" :loading="submitting" :disabled="submitting">
        {{ submitLabel }}
      </BasePrimaryButton>
    </div>
  </UForm>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-admin-select {
  @apply w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-150;
  border-color: rgb(145 161 190 / 0.24);
  background: rgb(255 255 255 / 0.04);
  color: rgb(247 249 255);
}

.vtx-admin-toggle {
  @apply flex items-start gap-3 rounded-2xl border px-4 py-4;
  border-color: rgb(145 161 190 / 0.18);
  background: rgb(255 255 255 / 0.03);
}

.vtx-admin-toggle input {
  margin-top: 0.2rem;
}

.vtx-admin-toggle strong {
  display: block;
  color: rgb(247 249 255);
  font-size: 0.92rem;
}

.vtx-admin-toggle small {
  display: block;
  margin-top: 0.2rem;
  color: rgb(176 186 208 / 0.82);
  font-size: 0.76rem;
}
</style>
