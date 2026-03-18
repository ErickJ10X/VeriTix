<template>
  <div class="relative mx-auto aspect-square w-full max-w-md">
    <div class="orb-core" />
    <div class="orb-ring orb-ring--outer" />
    <div class="orb-ring orb-ring--inner" />
    <div class="orb-ring orb-ring--accent" />
  </div>
</template>

<style scoped>
.orb-core {
  position: absolute;
  inset: 22%;
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 30%, rgb(236 176 77 / 0.9), rgb(20 128 188 / 0.75), rgb(60 58 61 / 0.8));
  box-shadow:
    0 0 35px rgb(236 176 77 / 0.35),
    inset 0 0 25px rgb(255 255 255 / 0.1);
}

.orb-ring {
  position: absolute;
  border-radius: 9999px;
  border: 1px solid rgb(237 215 183 / 0.35);
  animation: orbit-rotate 14s linear infinite;
}

.orb-ring--outer {
  inset: 5%;
}

.orb-ring--inner {
  inset: 15%;
  animation-duration: 10s;
  animation-direction: reverse;
}

.orb-ring--accent {
  inset: 0;
  border-color: rgb(204 74 88 / 0.4);
  animation-duration: 18s;
}

@keyframes orbit-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
