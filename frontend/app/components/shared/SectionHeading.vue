<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    center?: boolean
  }>(),
  {
    eyebrow: '',
    description: '',
    center: false,
  },
)
</script>

<template>
  <div
    class="max-w-3xl space-y-4" :class="[
      center ? 'mx-auto text-center' : 'text-left',
    ]"
  >
    <div
      class="vtx-section-sigil"
      :class="center ? 'mx-auto' : ''"
      aria-hidden="true"
    >
      <span class="vtx-section-sigil__line" />
      <span class="vtx-section-sigil__core" />
      <span class="vtx-section-sigil__line" />
    </div>

    <p
      v-if="eyebrow"
      class="text-[0.65rem] font-semibold tracking-[0.36em] text-secondary uppercase"
    >
      {{ eyebrow }}
    </p>

    <h2 class="font-display text-4xl leading-[1.02] text-highlighted md:text-5xl">
      {{ title }}
    </h2>

    <div
      class="h-px w-28 rounded-full bg-linear-to-r from-primary/80 via-secondary/65 to-transparent"
      :class="center ? 'mx-auto' : ''"
    />

    <p
      v-if="description"
      class="text-sm leading-relaxed text-toned md:text-base"
    >
      {{ description }}
    </p>
  </div>
</template>

<style scoped>
.vtx-section-sigil {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
}

.vtx-section-sigil__line {
  height: 1px;
  width: 2.2rem;
  background: linear-gradient(90deg, rgb(239 170 71 / 0.8), rgb(20 128 188 / 0.8));
}

.vtx-section-sigil__core {
  height: 0.62rem;
  width: 0.62rem;
  border-radius: 9999px;
  border: 1px solid rgb(255 255 255 / 0.34);
  background: radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.92), rgb(240 100 127 / 0.74));
  box-shadow: 0 0 12px rgb(240 100 127 / 0.4);
}
</style>
