<template>
  <div class="flex items-center justify-center min-h-screen bg-base-200">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body" v-if="!user">
        <h2
          class="card-title text-center mx-auto mb-6 text-2xl font-bold text-primary"
        >
          Bienvenue
        </h2>
        <!-- Premiere étape de la connexion -->
        <form @submit.prevent="handleSubmit" v-if="!step" class="space-y-4">
          <div class="form-control">
            <label class="label" for="username">
              <span class="label-text">Username</span>
            </label>
            <input
              v-model="username"
              type="text"
              id="username"
              placeholder="Enter your username"
              class="input input-bordered w-full"
            />
          </div>
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">Password</span>
            </label>
            <input
              v-model="password"
              type="password"
              id="password"
              placeholder="Enter your password"
              class="input input-bordered w-full"
            />
          </div>
          <div class="form-control mt-6">
            <button :disabled="isLoading" class="btn btn-primary w-full">
              Login
            </button>
          </div>
        </form>
        <!-- A la premiere connexion, l'utilisateur doit reinitialiser son mot de passe  et mettre sonn nom et prenom -->
        <div
          v-if="step === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'"
          class="space-y-4"
        >
          <p class="text-center font-semibold">
            Please enter your new password
          </p>
          <form @submit.prevent="validateNewPassword" class="space-y-4">
            <input
              type="password"
              id="newPassword"
              v-model="newPassword"
              placeholder="Enter your new password"
              class="input input-bordered w-full"
            />
            <button :disabled="isLoading" class="btn btn-primary w-full">
              Submit
            </button>
          </form>
        </div>
        <!-- Si l'utilisateur n'a pas configuré son appareil , il doit scanner le QR code avec une application authentificatrice -->
        <div
          v-if="step === 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP'"
          class="space-y-4"
        >
          <p class="text-center font-semibold">
            Please scan the QR code and enter your OTP
          </p>
          <form @submit.prevent="validateOtp" class="space-y-4">
            <div class="flex justify-center">
              <qrcode-vue
                :value="setupUri?.toString()"
                :size="200"
                level="M"
                class="border-4 border-primary rounded-lg p-2"
              ></qrcode-vue>
            </div>
            <input
              type="text"
              id="otp"
              v-model="otp"
              placeholder="Enter your OTP code"
              class="input input-bordered w-full"
            />
            <button :disabled="isLoading" class="btn btn-primary w-full">
              Submit
            </button>
          </form>
        </div>
        <!-- Quand l'utilisateur a déjà configuré son appareil , il n'aura plus qu'à entrer son code OTP -->
        <div v-if="step === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE'" class="space-y-4">
          <p class="text-center font-semibold">Please enter your OTP code</p>
          <form @submit.prevent="validateOtp" class="space-y-4">
            <input
              type="text"
              id="otp"
              v-model="otp"
              placeholder="Enter your OTP code"
              class="input input-bordered w-full"
            />
            <button type="submit" class="btn btn-primary w-full">Submit</button>
          </form>
        </div>
      </div>
      <!-- Si l'utilisateur est connecté -->
      <div class="card-body text-center" v-if="user || step === 'DONE'">
        <p class="text-lg font-semibold mb-4">You are logged in</p>
        <button
          :disabled="isLoading"
          class="btn btn-primary w-full"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import {
  confirmSignIn,
  signIn,
  getCurrentUser,
  signOut,
} from 'aws-amplify/auth'
import QrcodeVue from 'qrcode.vue'

const username = ref('')
const password = ref('')
const user = ref<any>()
const otp = ref('')
const step = ref<any>()
const setupUri = ref<URL>()

const newPassword = ref('')

const isLoading = ref(false)

onMounted(async () => {
  try {
    user.value = await (await getCurrentUser()).userId
    console.log('user', user)
  } catch (error) {
    console.log(error)
  }
})

const handleSubmit = async () => {
  isLoading.value = true
  try {
    const { nextStep } = await signIn({
      username: username.value,
      password: password.value,
      options: {
        authFlowType: 'USER_SRP_AUTH',
      },
    })

    handleSignInStep(nextStep)
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

const validateOtp = async () => {
  try {
    const { nextStep } = await confirmSignIn({
      challengeResponse: otp.value,
    })
    handleSignInStep(nextStep)
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

const logout = async () => {
  isLoading.value = true
  try {
    await signOut()
    window.location.reload()
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

const validateNewPassword = async () => {
  console.log(newPassword.value)
  try {
    const { nextStep } = await confirmSignIn({
      challengeResponse: newPassword.value,
    })
    handleSignInStep(nextStep)
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

const handleSignInStep = (nextStep: any) => {
  console.log('nextStep', nextStep)
  step.value = nextStep.signInStep
  switch (nextStep.signInStep) {
    case 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP':
      console.log('CONTINUE_SIGN_IN_WITH_TOTP_SETUP')
      const totpSetupDetails = nextStep.totpSetupDetails
      const appName = 'prespective-fs'
      setupUri.value = totpSetupDetails.getSetupUri(appName)
      break
  }
}
</script>
