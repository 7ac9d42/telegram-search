import type { CoreTask } from '@tg-search/core'

import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSyncTaskStore = defineStore('sync-task', () => {
  const increase = ref(false)
  const currentTask = ref<CoreTask<'takeout'>>()
  const currentTaskProgress = computed(() => {
    if (!currentTask.value)
      return 0

    return currentTask.value.progress
  })

  return {
    currentTask,
    currentTaskProgress,
    increase,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSyncTaskStore, import.meta.hot))
}
