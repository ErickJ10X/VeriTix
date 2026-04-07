<script setup lang="ts">
useSeoMeta({
  title: 'Playground botones | VeriTix',
  description: 'Demo simple de botones.',
})
</script>

<template>
  <section class="py-8">
    <UContainer class="space-y-8">
      <h1 class="text-2xl font-semibold text-highlighted">
        Playground de botones
      </h1>

      <div class="space-y-3">
        <h2 class="text-sm text-toned uppercase tracking-[0.12em]">
          Primario
        </h2>
        <div class="flex flex-wrap gap-3">
          <BasePrimaryButton size="sm">
            Primary sm
          </BasePrimaryButton>
          <BasePrimaryButton size="md">
            Primary md
          </BasePrimaryButton>
          <BasePrimaryButton size="lg">
            Primary lg
          </BasePrimaryButton>
          <BasePrimaryButton leading-icon="i-lucide-sparkles">
            Primary icon
          </BasePrimaryButton>
          <BasePrimaryButton trailing-icon="i-lucide-arrow-right">
            Primary trailing
          </BasePrimaryButton>
          <BasePrimaryButton :loading="true">
            Primary loading
          </BasePrimaryButton>
        </div>
        <BasePrimaryButton block>
          Primary block
        </BasePrimaryButton>
      </div>

      <div class="space-y-3">
        <h2 class="text-sm text-toned uppercase tracking-[0.12em]">
          Secundario
        </h2>
        <div class="flex flex-wrap gap-3">
          <BaseSecondaryButton size="sm">
            Secondary sm
          </BaseSecondaryButton>
          <BaseSecondaryButton size="md">
            Secondary md
          </BaseSecondaryButton>
          <BaseSecondaryButton size="lg">
            Secondary lg
          </BaseSecondaryButton>
          <BaseSecondaryButton leading-icon="i-lucide-sparkles">
            Secondary icon
          </BaseSecondaryButton>
          <BaseSecondaryButton trailing-icon="i-lucide-arrow-right">
            Secondary trailing
          </BaseSecondaryButton>
          <BaseSecondaryButton :loading="true">
            Secondary loading
          </BaseSecondaryButton>
        </div>
        <BaseSecondaryButton block>
          Secondary block
        </BaseSecondaryButton>
      </div>

      <div class="space-y-3">
        <h2 class="text-sm text-toned uppercase tracking-[0.12em]">
          Terciario
        </h2>
        <div class="flex flex-wrap gap-3">
          <BaseTertiaryButton size="sm">
            Tertiary sm
          </BaseTertiaryButton>
          <BaseTertiaryButton size="md">
            Tertiary md
          </BaseTertiaryButton>
          <BaseTertiaryButton size="lg">
            Tertiary lg
          </BaseTertiaryButton>
          <BaseTertiaryButton leading-icon="i-lucide-sparkles">
            Tertiary icon
          </BaseTertiaryButton>
          <BaseTertiaryButton trailing-icon="i-lucide-arrow-right">
            Tertiary trailing
          </BaseTertiaryButton>
          <BaseTertiaryButton :loading="true">
            Tertiary loading
          </BaseTertiaryButton>
        </div>
        <BaseTertiaryButton block>
          Tertiary block
        </BaseTertiaryButton>
      </div>
    </UContainer>
  </section>
</template>
