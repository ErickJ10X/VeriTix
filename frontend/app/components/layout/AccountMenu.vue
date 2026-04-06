<script setup lang="ts">
const { user } = useAuth()

const accountAvatarAlt = computed(() => {
  const fullName = [user.value?.name, user.value?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || user.value?.email || 'Mi cuenta'
})

const accountInitials = computed(() => {
  const initials = [user.value?.name, user.value?.lastName]
    .map(value => value?.trim()?.charAt(0)?.toUpperCase() ?? '')
    .join('')

  if (initials) {
    return initials
  }

  return user.value?.email?.trim()?.charAt(0)?.toUpperCase() || 'V'
})

const accountDisplayName = computed(() => {
  const fullName = [user.value?.name, user.value?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || 'Mi cuenta'
})

const accountSubtitle = computed(() => {
  return user.value?.email || 'Gestiona tu perfil y ajustes'
})
</script>

<template>
  <UPopover :content="{ align: 'end', side: 'bottom', sideOffset: 12 }">
    <button
      type="button"
      class="vtx-account-trigger"
      :aria-label="`Abrir menu de ${accountAvatarAlt}`"
    >
      <UAvatar
        :src="user?.avatarUrl || undefined"
        :alt="accountAvatarAlt"
        :text="accountInitials"
        size="md"
        class="vtx-account-avatar"
      />
    </button>

    <template #content>
      <div class="vtx-account-panel">
        <div class="vtx-account-panel-hero">
          <UAvatar
            :src="user?.avatarUrl || undefined"
            :alt="accountAvatarAlt"
            :text="accountInitials"
            size="lg"
            class="vtx-account-panel-avatar"
          />

          <div class="min-w-0">
            <p class="vtx-account-panel-title truncate">
              {{ accountDisplayName }}
            </p>
            <p class="vtx-account-panel-subtitle truncate">
              {{ accountSubtitle }}
            </p>
          </div>
        </div>

        <NuxtLink to="/users/me" class="vtx-account-panel-link">
          <div class="vtx-account-panel-link-icon-wrap" aria-hidden="true">
            <UIcon name="i-lucide-settings-2" class="vtx-account-panel-link-icon" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="vtx-account-panel-link-title">
              Ajustes
            </p>
            <p class="vtx-account-panel-link-subtitle truncate">
              Perfil, contacto y seguridad
            </p>
          </div>

          <UIcon name="i-lucide-arrow-up-right" class="vtx-account-panel-link-arrow" aria-hidden="true" />
        </NuxtLink>
      </div>
    </template>
  </UPopover>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-account-trigger {
  @apply inline-flex items-center justify-center rounded-full;
  padding: 0.14rem;
  border: 0;
  background: rgb(255 255 255 / 0.02);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.04),
    0 6px 14px -16px rgb(0 0 0 / 0.82);
  transition:
    background-color 0.12s ease-out,
    box-shadow 0.12s ease-out;
}

.vtx-account-trigger:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgb(239 170 71 / 0.28),
    0 0 0 5px rgb(239 170 71 / 0.07),
    inset 0 0 0 1px rgb(255 255 255 / 0.05);
}

.vtx-account-trigger:hover {
  background: rgb(255 255 255 / 0.04);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.06),
    0 8px 18px -18px rgb(0 0 0 / 0.84);
}

.vtx-account-trigger:active {
  background: rgb(255 255 255 / 0.055);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.04),
    0 4px 10px -16px rgb(0 0 0 / 0.78);
}

.vtx-account-avatar {
  background: linear-gradient(135deg, rgb(239 170 71 / 0.78), rgb(20 128 188 / 0.78));
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.08),
    0 8px 18px -14px rgb(0 0 0 / 0.85);
}

.vtx-account-panel {
  width: min(21rem, calc(100vw - 2rem));
  padding: 0.9rem;
  border-radius: 1.15rem;
  border: 1px solid rgb(137 154 186 / 0.2);
  background:
    linear-gradient(180deg, rgb(17 24 39 / 0.98), rgb(9 14 26 / 0.99)),
    linear-gradient(135deg, rgb(239 170 71 / 0.06), rgb(20 128 188 / 0.05));
  box-shadow:
    0 22px 46px -30px rgb(0 0 0 / 0.88),
    inset 0 1px 0 rgb(255 255 255 / 0.04);
}

.vtx-account-panel-hero {
  @apply flex items-center gap-3;
  margin-bottom: 0.8rem;
  padding: 0.2rem;
}

.vtx-account-panel-avatar {
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.08),
    0 10px 24px -16px rgb(0 0 0 / 0.9);
}

.vtx-account-panel-title {
  color: rgb(247 249 255);
  font-size: 0.9rem;
  font-weight: 600;
}

.vtx-account-panel-subtitle {
  color: rgb(176 186 208 / 0.8);
  font-size: 0.72rem;
  margin-top: 0.18rem;
}

.vtx-account-panel-link {
  @apply flex items-center no-underline;
  gap: 0.8rem;
  width: 100%;
  padding: 0.85rem 0.9rem;
  border-radius: 0.95rem;
  border: 1px solid rgb(137 154 186 / 0.14);
  background: linear-gradient(135deg, rgb(255 255 255 / 0.055), rgb(255 255 255 / 0.025));
  transition:
    border-color 0.12s ease-out,
    background-color 0.12s ease-out,
    box-shadow 0.12s ease-out;
}

.vtx-account-panel-link:hover {
  border-color: rgb(239 170 71 / 0.22);
  background: linear-gradient(135deg, rgb(239 170 71 / 0.1), rgb(20 128 188 / 0.07));
  box-shadow: 0 14px 24px -24px rgb(239 170 71 / 0.34);
}

.vtx-account-panel-link:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgb(239 170 71 / 0.35),
    0 0 0 5px rgb(239 170 71 / 0.08);
}

.vtx-account-panel-link:active {
  background: linear-gradient(135deg, rgb(239 170 71 / 0.12), rgb(20 128 188 / 0.09));
}

.vtx-account-panel-link-icon-wrap {
  @apply inline-flex items-center justify-center rounded-xl;
  width: 2.4rem;
  height: 2.4rem;
  background: linear-gradient(135deg, rgb(239 170 71 / 0.14), rgb(20 128 188 / 0.1));
  border: 1px solid rgb(255 255 255 / 0.07);
}

.vtx-account-panel-link-icon {
  width: 1rem;
  height: 1rem;
  color: rgb(248 194 103);
}

.vtx-account-panel-link-title {
  color: rgb(247 249 255);
  font-size: 0.82rem;
  font-weight: 600;
}

.vtx-account-panel-link-subtitle {
  color: rgb(176 186 208 / 0.74);
  font-size: 0.7rem;
  margin-top: 0.16rem;
}

.vtx-account-panel-link-arrow {
  width: 0.92rem;
  height: 0.92rem;
  color: rgb(176 186 208 / 0.72);
}
</style>
