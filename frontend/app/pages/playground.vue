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
          <BaseButton kind="primary" size="sm">
            Primary sm
          </BaseButton>
          <BaseButton kind="primary" size="md">
            Primary md
          </BaseButton>
          <BaseButton kind="primary" size="lg">
            Primary lg
          </BaseButton>
          <BaseButton kind="primary" leading-icon="i-lucide-sparkles">
            Primary icon
          </BaseButton>
          <BaseButton kind="primary" trailing-icon="i-lucide-arrow-right">
            Primary trailing
          </BaseButton>
          <BaseButton kind="primary" :loading="true">
            Primary loading
          </BaseButton>
        </div>
        <BaseButton kind="primary" block>
          Primary block
        </BaseButton>
      </div>

      <div class="space-y-3">
        <h2 class="text-sm text-toned uppercase tracking-[0.12em]">
          Secundario
        </h2>
        <div class="flex flex-wrap gap-3">
          <BaseButton kind="secondary" size="sm">
            Secondary sm
          </BaseButton>
          <BaseButton kind="secondary" size="md">
            Secondary md
          </BaseButton>
          <BaseButton kind="secondary" size="lg">
            Secondary lg
          </BaseButton>
          <BaseButton kind="secondary" leading-icon="i-lucide-sparkles">
            Secondary icon
          </BaseButton>
          <BaseButton kind="secondary" trailing-icon="i-lucide-arrow-right">
            Secondary trailing
          </BaseButton>
          <BaseButton kind="secondary" :loading="true">
            Secondary loading
          </BaseButton>
        </div>
        <BaseButton kind="secondary" block>
          Secondary block
        </BaseButton>
      </div>

      <div class="space-y-3">
        <h2 class="text-sm text-toned uppercase tracking-[0.12em]">
          Terciario
        </h2>
        <div class="flex flex-wrap gap-3">
          <BaseButton kind="tertiary" size="sm">
            Tertiary sm
          </BaseButton>
          <BaseButton kind="tertiary" size="md">
            Tertiary md
          </BaseButton>
          <BaseButton kind="tertiary" size="lg">
            Tertiary lg
          </BaseButton>
          <BaseButton kind="tertiary" leading-icon="i-lucide-sparkles">
            Tertiary icon
          </BaseButton>
          <BaseButton kind="tertiary" trailing-icon="i-lucide-arrow-right">
            Tertiary trailing
          </BaseButton>
          <BaseButton kind="tertiary" :loading="true">
            Tertiary loading
          </BaseButton>
        </div>
        <BaseButton kind="tertiary" block>
          Tertiary block
        </BaseButton>
      </div>
    </UContainer>
  </section>
</template>
