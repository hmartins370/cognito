import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { Amplify } from 'aws-amplify'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'eu-west-3_7jo8nN29W',
      userPoolClientId: '6j8kaqg3o656kc853t3eo0cnsc',
      loginWith: {
        email: true,
      },
      mfa: {
        totpEnabled: true,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
      },
    },
  },
})

createApp(App).mount('#app')
