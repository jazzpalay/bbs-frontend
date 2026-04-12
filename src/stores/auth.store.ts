import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    csrfToken: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken
  },

  actions: {
    setToken(token: string) {
      this.accessToken = token
    },

    setCsrfToken(token: string) {
      this.csrfToken = token
    },

    logout() {
      this.accessToken = null
      this.csrfToken = null
    }
  }
})
