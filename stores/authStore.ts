interface User {
  id: string;
  email: string;
  first_name: string;
  avatar: string;
  token: string;
  location: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoggedIn: false,
    loading: false,
  }),
  actions: {
    async checkLoginStatus() {
      const { $authClient, $readMe } = useNuxtApp();

      this.loading = true;
      try {
        const user = await $authClient.request($readMe({ fields: ['id', 'email', 'first_name', 'avatar', 'token', 'location'] })) as User;
        this.setUser(user);
      } catch {
        this.clearUser();
      } finally {
        this.loading = false;
      }
    },
    setUser(user: User) {
      if (user && typeof user === 'object' && 'id' in user) { // 类型检查
        this.user = user;
        this.isLoggedIn = !!user;
      } else {
        console.error('Invalid user object:', user);
      }
    },
    clearUser() {
      this.user = null;
      this.isLoggedIn = false;
    },
  },
});