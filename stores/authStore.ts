interface User {
  id: string;
  email: string;
  first_name: string;
  avatar: string;
  token: string;
  location: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    isLoggedIn: false,
    loading: false,
  }),
  actions: {
    async checkLoginStatus() {
      const { $authClient, $user } = useNuxtApp();

      this.loading = true;
      try {
        const user = (await $authClient.request(
          $user.readMe({
            fields: [
              "id",
              "email",
              "first_name",
              "avatar",
              "token",
              "location",
            ],
          })
        )) as User;
        this.setUser(user);
      } catch (error) {
        this.clearUser();
      } finally {
        this.loading = false;
      }
    },
    setUser(user: User) {
      this.user = user;
      this.isLoggedIn = true;
    },
    clearUser() {
      this.user = null;
      this.isLoggedIn = false;
    },
  },
});