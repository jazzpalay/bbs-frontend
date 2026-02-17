import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken
  },

  actions: {
    setToken(token: string) {
      this.accessToken = token
    },

    logout() {
      this.accessToken = null
    }
  }
})
