import { toast } from 'vue-sonner'

export function useNotification() {
  // 使用一个对象来存储所有通知的标志位
  const notificationFlags = ref<Record<string, boolean>>({})

  /**
   * 显示通知
   * @param context 触发条件（如 'login'、'register'）
   * @param type 通知类型：'error' | 'success' | 'warning'
   * @param message 通知标题
   * @param description 通知描述（可选）
   * @param duration 通知显示时长（默认 4000 毫秒）
   */
  function showNotification(
    context: string,
    type: 'error' | 'success' | 'warning',
    message: string,
    description?: string,
    duration: number = 4000
  ) {
    if (!['error', 'success', 'warning'].includes(type)) {
      console.error('Invalid notification type:', type);
      return;
    }

    // 生成唯一的通知标识（结合触发条件和通知类型）
    const notificationKey = `${context}-${type}`

    // 如果当前通知正在显示，则直接返回
    if (notificationFlags.value[notificationKey]) {
      //console.log(`通知 ${notificationKey} 正在显示，忽略本次操作`)
      return
    }

    // 根据类型显示通知
    switch (type) {
      case 'error':
        toast.error(message, {
          description,
          duration,
          onAutoClose: () => {
            notificationFlags.value[notificationKey] = false // 重置标志位
          },
        })
        break
      case 'success':
        toast.success(message, {
          description,
          duration,
          onAutoClose: () => {
            notificationFlags.value[notificationKey] = false // 重置标志位
          },
        })
        break
      case 'warning':
        toast.warning(message, {
          description,
          duration,
          onAutoClose: () => {
            notificationFlags.value[notificationKey] = false // 重置标志位
          },
        })
        break
      default:
        toast(message, {
          description,
          duration,
          onAutoClose: () => {
            notificationFlags.value[notificationKey] = false // 重置标志位
          },
        })
    }

    // 将当前通知的标志位设置为 true，表示通知正在显示
    notificationFlags.value[notificationKey] = true
  }

  return {
    showNotification,
  }
}