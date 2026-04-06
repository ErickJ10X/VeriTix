<script setup lang="ts">
defineProps<{
  roleLabel: string
}>()

const nameModel = defineModel<string>('name', { default: '' })
const lastNameModel = defineModel<string>('lastName', { default: '' })
const phoneModel = defineModel<string>('phone', { default: '' })
const avatarUrlModel = defineModel<string>('avatarUrl', { default: '' })
</script>

<template>
  <div class="space-y-6">
    <section class="space-y-4 border-b border-default/55 pb-6">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-highlighted">
          Identidad
        </h3>
        <UBadge color="neutral" variant="soft">
          {{ roleLabel }}
        </UBadge>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <BaseFormField
          v-model="nameModel"
          name="name"
          label="Nombre"
          placeholder="Nombre"
          icon="i-lucide-user"
          required
        />

        <BaseFormField
          v-model="lastNameModel"
          name="lastName"
          label="Apellido"
          placeholder="Apellido"
          icon="i-lucide-user-round"
          required
        />
      </div>
    </section>

    <section class="space-y-4 border-b border-default/55 pb-6">
      <h3 class="text-lg font-semibold text-highlighted">
        Contacto
      </h3>

      <div class="grid gap-4">
        <BaseFormField
          v-model="phoneModel"
          name="phone"
          label="Telefono"
          help="Opcional · formato E.164"
          type="tel"
          placeholder="+34958123456"
          icon="i-lucide-phone"
        />

        <BaseFormField
          v-model="avatarUrlModel"
          name="avatarUrl"
          label="Avatar URL"
          help="Opcional"
          type="url"
          placeholder="https://..."
          icon="i-lucide-image"
        />
      </div>
    </section>
  </div>
</template>
