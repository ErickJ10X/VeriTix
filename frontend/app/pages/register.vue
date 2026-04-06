<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Registro | VeriTix',
  description: 'Crea tu cuenta de VeriTix y descubre los mejores conciertos progresivos.',
})

const schema = z.object({
  email: z.string().email('Introduce un email valido').min(1, 'El email es obligatorio'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'El telefono debe estar en formato E.164 (ej: +34958123456)'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Debe incluir mayuscula, minuscula y numero'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
})

const state = reactive({
  email: '',
  name: '',
  lastName: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const form = useTemplateRef('form')
const errorMessage = ref('')
const showPassword = ref(false)
const { register, pending } = useAuth()
const { getApiErrorMessage } = useApiErrorMessage()

async function onSubmit() {
  if (!form.value) {
    return
  }

  errorMessage.value = ''

  try {
    await register({
      email: state.email.trim().toLowerCase(),
      password: state.password,
      name: state.name.trim(),
      lastName: state.lastName.trim(),
      phone: state.phone.trim(),
    })

    await navigateTo('/')
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Error al crear la cuenta. Por favor, intenta de nuevo.')
  }
}
</script>

<template>
  <UiAuthPageShell variant="register">
    <UiAuthContainer>
      <div class="w-full max-w-lg px-4 sm:px-0">
        <section class="space-y-8">
          <header class="text-center">
            <p class="mb-3 text-xs font-semibold tracking-[0.28em] text-auric-300/90 uppercase">
              VeriTix
            </p>

            <h1 class="font-display text-3xl text-highlighted md:text-4xl">
              Crea tu cuenta
            </h1>

            <p class="mx-auto mt-3 max-w-md text-sm text-toned">
              Unete a VeriTix y descubre tu proximo concierto
            </p>
          </header>

          <div class="mb-7 flex items-center justify-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.22em] text-secondary uppercase">
              <UIcon name="i-lucide-sparkles" class="size-3.5" />
              Alta de cuenta
            </span>
          </div>

          <UForm
            ref="form"
            :state="state"
            :schema="schema"
            :validate-on="[]"
            class="flex flex-col gap-4"
            @submit="onSubmit"
          >
            <!-- Error message -->
            <p
              v-if="errorMessage"
              class="rounded-xl border border-[color-mix(in_srgb,var(--ui-error)_50%,transparent)] bg-[color-mix(in_srgb,var(--ui-error)_10%,transparent)] px-4 py-3 text-sm text-error"
            >
              {{ errorMessage }}
            </p>

            <!-- All fields stacked vertically with equal spacing -->
            <BaseFormField
              v-model="state.email"
              name="email"
              label="Email"
              help="Te servira para iniciar sesion y recuperar acceso."
              type="email"
              placeholder="tu@email.com"
              icon="i-lucide-mail"
              required
              class="w-full"
            />

            <div class="grid gap-4 md:grid-cols-2">
              <BaseFormField
                v-model="state.name"
                name="name"
                label="Nombre"
                placeholder="Juan"
                icon="i-lucide-user"
                required
                class="w-full"
              />

              <BaseFormField
                v-model="state.lastName"
                name="lastName"
                label="Apellido"
                placeholder="Garcia"
                icon="i-lucide-user-round"
                required
                class="w-full"
              />
            </div>

            <BaseFormField
              v-model="state.phone"
              name="phone"
              label="Telefono"
              help="Formato internacional E.164. Ejemplo: +34958123456"
              type="tel"
              placeholder="+34958123456"
              icon="i-lucide-phone"
              required
              class="w-full"
            />

            <BasePasswordField
              v-model="state.password"
              name="password"
              label="Contrasena"
              help="Incluye mayuscula, minuscula y un numero."
              placeholder="Minimo 8 caracteres"
              icon="i-lucide-lock"
              :show="showPassword"
              @update:show="showPassword = $event"
              required
              class="w-full"
            />

            <BasePasswordField
              v-model="state.confirmPassword"
              name="confirmPassword"
              label="Confirmar contrasena"
              placeholder="Repite tu contrasena"
              icon="i-lucide-lock"
              :show="showPassword"
              @update:show="showPassword = $event"
              required
              class="w-full"
            />

            <!-- Terms -->
            <p class="mt-2 text-center text-xs text-muted">
              Al registrarte, aceptas nuestros
              <NuxtLink
                to="/terminos"
                class="rounded-sm text-auric-400 transition-colors duration-200 hover:text-auric-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
              >
                Terminos de Servicio
              </NuxtLink>
              y
              <NuxtLink
                to="/privacidad"
                class="rounded-sm text-auric-400 transition-colors duration-200 hover:text-auric-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
              >
                Politica de Privacidad
              </NuxtLink>.
            </p>

            <!-- Submit button -->
            <BasePrimaryButton
              type="submit"
              size="lg"
              block
              :loading="pending"
              class="mt-2"
            >
              Crear cuenta
            </BasePrimaryButton>

            <p class="text-center text-xs text-toned">
              Tu cuenta se crea en segundos y podras gestionar eventos de inmediato.
            </p>
          </UForm>

          <footer class="pt-1">
            <p class="text-center text-sm text-muted">
              ¿Ya tienes cuenta?
              <NuxtLink
                to="/login"
                class="rounded-sm font-medium text-auric-400 transition-colors duration-200 hover:text-auric-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
              >
                Inicia sesion
              </NuxtLink>
            </p>
          </footer>
        </section>
      </div>
    </UiAuthContainer>
  </UiAuthPageShell>
</template>
