<script setup lang="ts">
const currentPasswordModel = defineModel<string>('currentPassword', { default: '' })
const newPasswordModel = defineModel<string>('newPassword', { default: '' })
const confirmPasswordModel = defineModel<string>('confirmPassword', { default: '' })
const showCurrentPasswordModel = defineModel<boolean>('showCurrentPassword', { default: false })
const showNewPasswordModel = defineModel<boolean>('showNewPassword', { default: false })
const showConfirmPasswordModel = defineModel<boolean>('showConfirmPassword', { default: false })

</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <div>
        <UiMetaLabel>
          Seguridad
        </UiMetaLabel>
        <h3 class="mt-3 text-2xl font-semibold text-highlighted">
          Cambiar contrasena
        </h3>
      </div>

      <p class="text-sm leading-relaxed text-toned">
        Usa una clave nueva con al menos 8 caracteres, una mayuscula y un numero.
      </p>
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
