import type { CorePagination } from '@tg-search/common'
import type { CoreMessage } from '@tg-search/core'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useBridgeStore } from '../composables/useBridge'
import { MessageWindow } from '../composables/useMessageWindow'
import { createMediaBlob } from '../utils/blob'
import { determineMessageDirection } from '../utils/message'

function createContextWithTimeout(timeout: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeout),
  )
}

export const useMessageStore = defineStore('message', () => {
  const currentChatId = ref<string>()
  const messageWindow = ref<MessageWindow>()

  const websocketStore = useBridgeStore()

  function replaceMessages(messages: CoreMessage[], options?: { chatId?: string, limit?: number }) {
    const previousChatId = currentChatId.value
    const nextChatId = options?.chatId ?? previousChatId
    const fallbackSize = Math.max(messages.length, 50)
    const desiredSize = options?.limit ?? Math.max(messageWindow.value?.maxSize ?? 0, fallbackSize)

    const shouldResetWindow = !messageWindow.value
      || messageWindow.value.maxSize < desiredSize
      || (nextChatId && previousChatId !== nextChatId)

    if (nextChatId)
      currentChatId.value = nextChatId

    if (shouldResetWindow)
      messageWindow.value = new MessageWindow(desiredSize)
    else
      messageWindow.value!.clear()

    messageWindow.value!.addBatch(messages, 'initial')
  }

  async function loadMessageContext(
    chatId: string,
    messageId: string,
    options: { before?: number, after?: number, limit?: number } = {},
  ) {
    const before = options.before ?? 20
    const after = options.after ?? 20
    const limit = options.limit ?? Math.max(messageWindow.value?.maxSize ?? 0, before + after + 1, 50)

    websocketStore.sendEvent('storage:fetch:message-context', {
      chatId,
      messageId,
      before,
      after,
    })

    const { messages } = await websocketStore.waitForEvent('storage:messages:context')

    replaceMessages(messages, { chatId, limit })

    return messages
  }

  async function pushMessages(messages: CoreMessage[]) {
    const filteredMessages = messages.filter(msg => msg.chatId === currentChatId.value)

    const direction = determineMessageDirection(filteredMessages, messageWindow.value)

    // eslint-disable-next-line no-console
    console.log(`[MessageStore] Push ${filteredMessages.length} messages (${direction})`, filteredMessages)

    if (messages.length === 0) {
      return
    }

    if (!messageWindow.value) {
      console.warn('[MessageStore] Message window not initialized')
      return
    }

    messageWindow.value.addBatch(
      filteredMessages.map(message => ({
        ...message,
        media: message.media?.map(createMediaBlob),
      })),
      direction,
    )
  }

  function useFetchMessages(chatId: string, limit: number) {
    // Only initialize if chatId changes
    if (currentChatId.value !== chatId) {
      currentChatId.value = chatId
      messageWindow.value?.clear()
      messageWindow.value = new MessageWindow(limit)
    }

    const isLoading = ref(false)

    function fetchMessages(
      pagination: CorePagination & {
        minId?: number
      },
      direction: 'older' | 'newer' = 'older',
    ) {
      isLoading.value = true

      // eslint-disable-next-line no-console
      console.log(`[MessageStore] Fetching messages for chat ${chatId}`, pagination.offset)

      // Then, fetch the messages from server & update the cache
      switch (direction) {
        case 'older':
          websocketStore.sendEvent('message:fetch', { chatId, pagination })
          break
        case 'newer':
          websocketStore.sendEvent('message:fetch', {
            chatId,
            pagination: {
              offset: 0,
              limit: pagination.limit,
            },
            minId: pagination.minId,
          })
          break
      }

      Promise.race([
        websocketStore.waitForEvent('message:data'),
        websocketStore.waitForEvent('storage:messages'),
        createContextWithTimeout(10000),
      ]).catch(() => {
        console.warn('[MessageStore] Message fetch timed out or failed')
      }).finally(() => {
        isLoading.value = false
      })
    }

    return {
      isLoading,
      fetchMessages,
    }
  }

  return {
    chatId: computed(() => currentChatId),
    sortedMessageIds: computed(() => messageWindow.value?.getSortedIds() ?? []),
    // FIXME: too heavy to compute every time
    sortedMessageArray: computed(() => messageWindow.value?.getSortedIds().map(id => messageWindow.value!.get(id)!) ?? []),
    messageWindow: computed(() => messageWindow.value!),

    replaceMessages,
    pushMessages,
    useFetchMessages,
    loadMessageContext,
  }
})
