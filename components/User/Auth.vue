<template>
  <div v-if="!authStore.isLoggedIn">
    <div @click="isOpen = true">
      <UAvatar size="sm" src="" icon="hugeicons:lock-key" class="ring-2 ring-gray-200 dark:ring-gray-800 cursor-pointer"
        :ui="{ background: 'bg-gray-100 dark:bg-gray-900', icon: { size: { sm: 'h-5 w-5' } } }" />
    </div>

    <UModal v-model="isOpen" prevent-close :ui="{
      width: 'w-full sm:max-w-sm', base: 'absolute top-0', transition: {
        enterFrom: '-translate-y-4',
        leaveTo: '-translate-y-4'
      }
    }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-200 dark:divide-gray-800' }">
        <div>
          <UTabs v-model="activeTab" :items="items" class="w-full">
            <template #item="{ item }">
              <UCard @submit.prevent="() => onSubmit(item.key)">
                <template #header>
                  <p class="mt-1 text-sm text-gray-400">
                    {{ item.description }}
                  </p>
                </template>

                <div v-if="item.key === 'login'" class="space-y-3">
                  <UInput ref="emailInput" icon="hugeicons:at" size="lg" color="white" autofocus :trailing="false"
                    :placeholder="$t('auth_login_email')" type="email" v-model="email" />
                  <UInput icon="hugeicons:lock-key" size="lg" color="white" :trailing="false"
                    :placeholder="$t('auth_login_password')" type="password" v-model="password" />
                </div>
                <div v-else-if="item.key === 'register'" class="space-y-3">
                  <UInput ref="emailSignupInput" icon="hugeicons:at" size="lg" color="white" autofocus :trailing="false"
                    :placeholder="$t('auth_register_email')" type="email" v-model="emailSignup" />
                  <UInput icon="hugeicons:user-square" size="lg" color="white" :trailing="false"
                    :placeholder="$t('auth_register_name')" type="text" v-model="nameSignup" />
                  <UInput icon="hugeicons:square-lock-add-02" size="lg" color="white" :trailing="false"
                    :placeholder="$t('auth_register_password')" type="password" v-model="passwordSignup" />
                  <UInput icon="hugeicons:square-lock-check-02" size="lg" color="white" :trailing="false"
                    :placeholder="$t('auth_register_confirm_password')" type="password"
                    v-model="confirmPasswordSignup" />
                </div>
                <template #footer>
                  <div class="flex justify-between">
                    <UButton type="submit" size="md" color="primary" class="font-semibold" :loading="loading"
                      :disabled="loading">
                      {{ item.key === 'login' ? $t('auth_login') : $t('auth_register') }}
                    </UButton>
                    <UButton :label="$t('auth_cancel')" size="md" color="gray" class="font-semibold"
                      @click="isOpen = false" />
                  </div>
                </template>
              </UCard>
            </template>
          </UTabs>
        </div>
      </UCard>
    </UModal>
  </div>

  <div v-else>
    <div @click="openUserInfoModal" class="cursor-pointer mt-0.5">
      <UAvatar size="sm"
        :src="`${useAssets(authStore.user?.avatar || '')}?fit=outside&quality=30&withoutEnlargement&width=100&height=100`"
        :alt="authStore.user?.first_name" class="ring-2 ring-gray-200 dark:ring-gray-800" />
    </div>
    <UserAccount v-if="authStore.isLoggedIn" ref="userInfoModal" />
  </div>
</template>

<script setup lang="ts">
const { $authClient, $user } = useNuxtApp();
const authStore = useAuthStore();
const { t } = useI18n();

interface User {
  id: string;
  email: string;
  first_name: string;
  avatar: string;
  token: string;
  location: string;
}

const { showNotification } = useNotification()
const isOpen = ref(false);
const userInfoModal = ref();
const activeTab = ref(0);
const emailInput = ref();
const emailSignupInput = ref();

const items = computed(() => [{
  key: 'login',
  label: t('auth_login'),
  description: t('auth_login_info'),
}, {
  key: 'register',
  label: t('auth_register'),
  description: t('auth_register_info'),
}])

// 表单数据和状态管理
const email = ref('');
const password = ref('');
const emailSignup = ref('');
const nameSignup = ref('');
const passwordSignup = ref('');
const confirmPasswordSignup = ref('');
const loading = ref(false);

// 打开用户信息模态框
const openUserInfoModal = () => {
  nextTick(() => {
    userInfoModal.value?.openModal();
  });
};

// 注册功能
const handleRegister = async () => {
  if (!emailSignup.value || !passwordSignup.value || !nameSignup.value || !confirmPasswordSignup.value) {
    showNotification('register', 'warning', t('auth_register_warning_msg'));
    return;
  }

  // 检查名字长度
  const isChinese = /[\u4e00-\u9fa5]/.test(nameSignup.value); // 判断是否包含中文字符
  const maxLength = isChinese ? 8 : 20;
  if (isChinese && nameSignup.value.length < 2) {
    showNotification('register-cname', 'warning', t('auth_register_warning_chinese_length_min_msg'));
    return;
  } else if (!isChinese && nameSignup.value.length < 3) {
    showNotification('register-ename', 'warning', t('auth_register_warning_english_length_min_msg'));
    return;
  }
  if (nameSignup.value.length > maxLength) {
    showNotification('register-name', 'warning', isChinese ? t('auth_register_warning_chinese_length_max_msg') : t('auth_register_warning_english_length_max_msg'));
    return;
  }

  if (passwordSignup.value.length < 8) {
    showNotification('register-pwd', 'warning', t('auth_register_warning_password_length_msg'));
    return;
  }

  if (passwordSignup.value !== confirmPasswordSignup.value) {
    showNotification('register-pwds', 'warning', t('auth_register_confirm_password_msg'));
    return;
  }

  try {
    loading.value = true;
    await $authClient.request($user.registerUser(emailSignup.value, confirmPasswordSignup.value, { first_name: nameSignup.value }));
    loading.value = false;
    activeTab.value = 0;
    emailSignup.value = "";
    nameSignup.value = ""
    passwordSignup.value = "";
    confirmPasswordSignup.value = "";

    showNotification('register-login', 'success', t('auth_register_success_msg'));
  } catch (error: any) {
    showNotification('register-error', 'error', error.errors?.[0]?.message || t('auth_register_error_msg'));
    loading.value = false;
  }
};

// 登录功能
const handleLogin = async () => {
  if (!email.value || !password.value) {
    showNotification('login', 'warning', t('auth_login_warning_msg'));
    return;
  }

  if (!validateEmail(email.value)) {
    showNotification('login-email', 'warning', t('auth_login_warning_email_msg'));
    return;
  }

  try {
    loading.value = true;
    const response = await $authClient.login(email.value, password.value);
    if (response) {
      // 获取IP和位置信息
      const locationData = await useLocationIP();
      const userLocation = locationData.ipdata.info1;

      const user = await $authClient.request($user.readMe({ fields: ['id', 'email', 'first_name', 'avatar', 'token', 'location'] })) as User;

      user.location = userLocation;

      await $authClient.request($user.updateUser(user.id, { location: userLocation }));

      authStore.setUser(user); // 更新全局状态

      loading.value = false;
      isOpen.value = false;
      email.value = "";
      password.value = "";

      showNotification('login-success', 'success', t('auth_login_success_msg'));
    }
  } catch (error: any) {
    showNotification('login-error', 'error', error.errors?.[0]?.message || t('auth_login_error_msg'));
    loading.value = false;
  }
};

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 表单提交处理
const onSubmit = (formType: string) => {
  if (formType === 'login') {
    handleLogin();
  } else if (formType === 'register') {
    handleRegister();
  }
};

watch([activeTab, isOpen], async ([newTab, newModalOpen]) => {
  // 处理选项卡切换时的焦点
  if (newModalOpen) {
    await nextTick();
    if (newTab === 0 && emailInput.value?.input) {
      emailInput.value.input.focus();
    } else if (newTab === 1 && emailSignupInput.value?.input) {
      emailSignupInput.value.input.focus();
    }
  }

  // 处理模态框关闭时清空输入框
  if (!newModalOpen) {
    setTimeout(() => {
      email.value = '';
      password.value = '';
      emailSignup.value = '';
      nameSignup.value = '';
      passwordSignup.value = '';
      confirmPasswordSignup.value = '';
    }, 500);
  }
});
</script>