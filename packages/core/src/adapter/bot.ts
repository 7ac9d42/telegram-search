import type { TelegramAdapter, TelegramMessage, TelegramMessageType } from './types'

import { Bot, GrammyError, HttpError } from 'grammy'

import { getChatStats } from '../db'
import { useLogger } from '@tg-search/common'

export class BotAdapter implements TelegramAdapter {
  private bot: Bot
  private messageCallback?: (message: TelegramMessage) => Promise<void>
  private logger = useLogger()

  constructor(token: string) {
    this.bot = new Bot(token)

    // Error handling
    this.bot.catch((err) => {
      const ctx = err.ctx
      console.error(`Error while handling update ${ctx.update.update_id}:`)
      const e = err.error
      if (e instanceof GrammyError) {
        console.error('Error in request:', e.description)
      }
      else if (e instanceof HttpError) {
        console.error('Could not contact Telegram:', e)
      }
      else {
        console.error('Unknown error:', e)
      }
    })

    // Setup commands
    this.bot.command('start', ctx => ctx.reply(
      '你好！我是一个消息存档机器人。\n'
      + '请把我加入群组并设置为管理员，我就会开始记录消息。\n'
      + '支持的命令：\n'
      + '/stats - 显示当前群组的消息统计',
    ))

    this.bot.command('stats', async (ctx) => {
      const chatId = ctx.chat.id
      try {
        const msg = await ctx.reply('正在统计...')
        const stats = await getChatStats(chatId)

        const typeStats = Object.entries(stats.byType)
          .map(([type, count]) => `${type}: ${count}`)
          .join('\n')

        await ctx.api.editMessageText(
          ctx.chat.id,
          msg.message_id,
          `📊 消息统计\n\n`
          + `总消息数：${stats.total}\n\n`
          + `类型统计：\n${typeStats}`,
        )
      }
      catch (error) {
        this.logger.withFields({ error }).error('Error getting stats:')
        await ctx.reply('获取统计信息失败')
      }
    })
  }

  get type() {
    return 'bot' as const
  }

  /**
   * Convert message type from Grammy to our type
   */
  private getMessageType(message: any): TelegramMessageType {
    if (message.text)
      return 'text'
    if (message.photo)
      return 'photo'
    if (message.video)
      return 'video'
    if (message.document)
      return 'document'
    return 'other'
  }

  /**
   * Convert message from Grammy to our format
   */
  private convertMessage(message: any): TelegramMessage {
    return {
      id: message.message_id,
      chatId: message.chat.id,
      type: this.getMessageType(message),
      content: message.text || message.caption,
      fromId: message.from?.id,
      replyToId: message.reply_to_message?.message_id,
      forwardFromChatId: message.forward_from_chat?.id,
      forwardFromMessageId: message.forward_from_message_id,
      views: message.views,
      forwards: message.forwards,
      createdAt: new Date(message.date * 1000),
    }
  }

  async connect() {
    console.log('Setting up bot handlers...')

    // Setup message handler for all types of messages
    this.bot.on(['message', 'edited_message'], async (ctx) => {
      const message = ctx.message || ctx.editedMessage
      if (!message)
        return

      console.log(`Received message from chat ${ctx.chat.id} (${ctx.chat.type}):`, message)

      if (this.messageCallback) {
        try {
          const convertedMessage = this.convertMessage(message)
          await this.messageCallback(convertedMessage)
        }
        catch (error) {
          console.error('Error handling message:', error)
        }
      }
    })

    // Start the bot
    console.log('Starting bot...')
    try {
      await this.bot.start({
        onStart: (botInfo) => {
          console.log('Bot started as:', botInfo.username)
        },
      })
    }
    catch (error) {
      console.error('Failed to start bot:', error)
      throw error
    }
  }

  async disconnect() {
    await this.bot.stop()
  }

  async *getMessages(chatId: number, limit = 100): AsyncGenerator<TelegramMessage> {
    // Note: Bot API doesn't support getting message history
    // We can only get messages that are sent to the bot
    throw new Error('Bot API does not support getting message history')
  }

  onMessage(callback: (message: TelegramMessage) => Promise<void>) {
    this.messageCallback = callback
  }
}
