import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { Amplify } from 'aws-amplify'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'eu-west-3_qLEeZTODr',
      userPoolClientId: '77vc11so21k1kln4eoqprelkdi',
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
