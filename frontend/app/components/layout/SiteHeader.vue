<script setup lang="ts">
const sections = useHomepageSections()
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-default/80 bg-elevated/80 backdrop-blur-xl">
    <UContainer class="flex items-center justify-between gap-6 py-4">
      <a
        href="#hero"
        class="flex items-center gap-3"
      >
        <span class="font-display text-4xl leading-none text-primary">V</span>

        <div>
          <p class="font-display text-2xl leading-none text-highlighted">
            Veritix
          </p>
          <p class="text-xs tracking-[0.18em] text-muted uppercase">
            Ticketing experience
          </p>
        </div>
      </a>

      <nav class="hidden items-center gap-5 md:flex">
        <a
          v-for="item in sections"
          :key="item.id"
          :href="`#${item.id}`"
          class="text-sm text-toned transition hover:text-primary"
        >
          {{ item.label }}
        </a>
      </nav>

      <SharedCTAButton
        href="#eventos"
        label="Explorar"
        tone="primary"
        variant="soft"
        class="hidden lg:inline-flex"
      />
    </UContainer>
  </header>
</template>
