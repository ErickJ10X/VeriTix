<script setup lang="ts">
const currentPasswordModel = defineModel<string>('currentPassword', { default: '' })
const newPasswordModel = defineModel<string>('newPassword', { default: '' })
const confirmPasswordModel = defineModel<string>('confirmPassword', { default: '' })
const showCurrentPasswordModel = defineModel<boolean>('showCurrentPassword', { default: false })
const showNewPasswordModel = defineModel<boolean>('showNewPassword', { default: false })
const showConfirmPasswordModel = defineModel<boolean>('showConfirmPassword', { default: false })

const passwordRules = ['8+ caracteres', '1 mayuscula', '1 numero', 'Clave nueva'] as const
</script>

<template>
  <div class="space-y-6">
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

    <BasePasswordField
      v-model="currentPasswordModel"
      name="currentPassword"
      label="Contrasena actual"
      placeholder="Contrasena actual"
      icon="i-lucide-lock"
      :show="showCurrentPasswordModel"
      required
      @update:show="showCurrentPasswordModel = $event"
    />

    <div class="grid gap-5 lg:grid-cols-2">
      <BasePasswordField
        v-model="newPasswordModel"
        name="newPassword"
        label="Nueva contrasena"
        help="8+ caracteres · mayuscula · minuscula · numero"
        placeholder="Nueva contrasena"
        icon="i-lucide-shield"
        :show="showNewPasswordModel"
        required
        @update:show="showNewPasswordModel = $event"
      />

      <BasePasswordField
        v-model="confirmPasswordModel"
        name="confirmPassword"
        label="Confirmar contrasena"
        placeholder="Confirmar contrasena"
        icon="i-lucide-check-check"
        :show="showConfirmPasswordModel"
        required
        @update:show="showConfirmPasswordModel = $event"
      />
    </div>
  </div>
</template>
