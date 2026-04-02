<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="auth-card relative">
    <!-- Psychedelic glow layers -->
    <div class="auth-glow-outer absolute -inset-2 rounded-3xl opacity-60" />
    <div class="auth-glow-inner absolute -inset-1 rounded-2xl opacity-40" />

    <!-- Sacred geometry border -->
    <div class="auth-geometry absolute inset-0 rounded-2xl overflow-hidden">
      <div class="auth-ring auth-ring--outer" />
      <div class="auth-ring auth-ring--inner" />
      <div class="auth-ring auth-ring--core" />
    </div>

    <div class="auth-card-inner relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-10 shadow-[0_14px_26px_-24px_rgba(0,0,0,0.78)]">
      <!-- Header -->
      <div class="mb-8 text-center">
        <!-- Fractal brand mark -->
        <div class="mb-6 flex justify-center">
          <div class="auth-brand-fractal relative">
            <div class="auth-brand-ring" />
            <div class="auth-brand-core" />
            <div class="auth-brand-glow" />
          </div>
        </div>

        <h1 class="vtx-prismatic-text font-display text-2xl md:text-3xl">
          {{ title }}
        </h1>

        <p
          v-if="subtitle"
          class="mt-3 text-sm text-[var(--ui-text-toned)]"
        >
          {{ subtitle }}
        </p>
      </div>

      <!-- Content slot -->
      <slot />

      <!-- Footer slot -->
      <div
        v-if="$slots.footer"
        class="mt-6 pt-6 border-t border-white/10"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-glow-outer {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-auric-400) 15%, transparent),
    color-mix(in srgb, var(--color-electric-500) 15%, transparent),
    color-mix(in srgb, var(--color-crimson-500) 15%, transparent)
  );
  filter: blur(24px);
  animation: pulse-glow 8s ease-in-out infinite;
}

.auth-glow-inner {
  background: linear-gradient(
    225deg,
    color-mix(in srgb, var(--color-nebula-300) 20%, transparent),
    color-mix(in srgb, var(--color-auric-400) 10%, transparent)
  );
  filter: blur(16px);
  animation: pulse-glow 6s ease-in-out infinite reverse;
}

.auth-geometry {
  pointer-events: none;
}

.auth-ring {
  position: absolute;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.auth-ring--outer {
  inset: 10%;
  animation: rotate-geometry 60s linear infinite;
}

.auth-ring--inner {
  inset: 20%;
  animation: rotate-geometry 45s linear infinite reverse;
}

.auth-ring--core {
  inset: 30%;
  border-color: color-mix(in srgb, var(--color-auric-400) 5%, transparent);
  animation: rotate-geometry 30s linear infinite;
}

.auth-brand-fractal {
  width: 4rem;
  height: 4rem;
}

.auth-brand-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid color-mix(in srgb, var(--color-auric-400) 50%, transparent);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-auric-400) 30%, transparent),
    color-mix(in srgb, var(--color-electric-500) 30%, transparent)
  );
  animation: ring-pulse 4s ease-in-out infinite;
}

.auth-brand-core {
  position: absolute;
  inset: 0.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(10, 15, 27, 0.6);
  box-shadow: inset 0 0 12px color-mix(in srgb, var(--color-auric-400) 15%, transparent);
}

.auth-brand-glow {
  position: absolute;
  inset: -4px;
  border-radius: 9999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-auric-400) 40%, transparent), transparent 70%);
  opacity: 0.6;
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}

@keyframes rotate-geometry {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ring-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-glow-outer,
  .auth-glow-inner,
  .auth-ring--outer,
  .auth-ring--inner,
  .auth-ring--core,
  .auth-brand-ring,
  .auth-brand-glow {
    animation: none;
  }
}
</style>
