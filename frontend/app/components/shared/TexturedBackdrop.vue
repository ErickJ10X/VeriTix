<template>
  <div
    aria-hidden="true"
    class="vtx-starfield pointer-events-none fixed inset-0 -z-10 overflow-hidden"
  >
    <div class="vtx-noise" />
    <div class="vtx-constellation vtx-constellation--left" />
    <div class="vtx-constellation vtx-constellation--right" />
    <div class="vtx-constellation vtx-constellation--bottom" />
    <div class="vtx-sacred-ring" />
    <div class="vtx-prism-shard vtx-prism-shard--a" />
    <div class="vtx-prism-shard vtx-prism-shard--b" />
  </div>
</template>

<style scoped>
.vtx-starfield {
  background-image:
    radial-gradient(circle at 20% 20%, rgb(255 255 255 / 0.35) 0.4px, transparent 0.4px),
    radial-gradient(circle at 70% 60%, rgb(255 255 255 / 0.28) 0.5px, transparent 0.5px),
    radial-gradient(circle at 40% 80%, rgb(255 255 255 / 0.24) 0.5px, transparent 0.5px);
  background-size: 120px 120px;
}

.vtx-noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.16;
  background-image: radial-gradient(rgb(255 255 255 / 0.12) 0.6px, transparent 0.6px);
  background-size: 3px 3px;
  mix-blend-mode: soft-light;
}

.vtx-constellation {
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
  filter: blur(68px);
}

.vtx-constellation--left {
  top: -8rem;
  left: -10rem;
  height: 24rem;
  width: 24rem;
  background: radial-gradient(circle at 50% 50%, rgb(20 128 188 / 0.28), rgb(255 255 255 / 0));
  animation: drift-slow 14s ease-in-out infinite alternate;
}

.vtx-constellation--right {
  top: 8%;
  right: -11rem;
  height: 28rem;
  width: 28rem;
  background: radial-gradient(circle at 50% 50%, rgb(239 170 71 / 0.24), rgb(255 255 255 / 0));
  animation: drift-slow 16s ease-in-out infinite alternate-reverse;
}

.vtx-constellation--bottom {
  bottom: -10rem;
  left: 50%;
  height: 24rem;
  width: 24rem;
  transform: translateX(-50%);
  background: radial-gradient(circle at 50% 50%, rgb(215 66 97 / 0.26), rgb(255 255 255 / 0));
}

.vtx-sacred-ring {
  position: absolute;
  top: 28%;
  left: 50%;
  height: min(34rem, 72vw);
  width: min(34rem, 72vw);
  transform: translateX(-50%);
  border-radius: 9999px;
  border: 1px solid rgb(255 255 255 / 0.12);
  box-shadow: 0 0 0 12px rgb(255 255 255 / 0.02);
}

.vtx-prism-shard {
  position: absolute;
  pointer-events: none;
  border: 1px solid rgb(255 255 255 / 0.14);
  background: linear-gradient(140deg, rgb(239 170 71 / 0.08), rgb(20 128 188 / 0.08), rgb(240 100 127 / 0.08));
}

.vtx-prism-shard--a {
  top: 14%;
  left: 10%;
  height: 9rem;
  width: 9rem;
  transform: rotate(44deg);
}

.vtx-prism-shard--b {
  bottom: 14%;
  right: 12%;
  height: 8.5rem;
  width: 8.5rem;
  border-radius: 26%;
  transform: rotate(18deg);
}

@media (prefers-reduced-motion: reduce) {
  .vtx-constellation--left,
  .vtx-constellation--right {
    animation: none;
  }
}

@keyframes drift-slow {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(0, -3%, 0);
  }
}
</style>
