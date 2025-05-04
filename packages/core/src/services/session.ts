import type { CoreContext } from '../context'
import type { PromiseResult } from '../utils/result'

import { access, mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { useLogger } from '@tg-search/common'
import { getSessionPath, useConfig } from '@tg-search/common/composable'
import { StringSession } from 'telegram/sessions'

import { withResult } from '../utils/result'

export interface SessionEventToCore {
  'session:update': (data: { phoneNumber: string, session: string }) => void
  'session:clean': (data: { phoneNumber: string }) => void
}

export interface SessionEventFromCore {}

export type SessionEvent = SessionEventFromCore & SessionEventToCore

export type SessionService = ReturnType<typeof createSessionService>

// TODO: use Api.SessionManager
export function createSessionService(ctx: CoreContext) {
  const { withError } = ctx

  const logger = useLogger()

  function getSessionFilePath(phoneNumber: string) {
    const config = useConfig()
    const sessionPath = getSessionPath(config.path.storage)

    return path.join(sessionPath, `${phoneNumber.replace('+', '')}.session`)
  }

  async function cleanSession(phoneNumber: string) {
    const sessionFilePath = getSessionFilePath(phoneNumber)

    try {
      await unlink(sessionFilePath)
      logger.withFields({ sessionFile: sessionFilePath, phoneNumber }).verbose('Deleted session file')
      return withResult(null, null)
    }
    catch (error) {
      return withResult(null, withError(error, 'Failed to delete session file'))
    }
  }

  return {
    loadSession: async (phoneNumber: string): PromiseResult<StringSession> => {
      const sessionFilePath = getSessionFilePath(phoneNumber)

      logger.withFields({ sessionFilePath, phoneNumber }).verbose('Loading session from file')

      try {
        // Ensure session directory exists
        await mkdir(path.dirname(sessionFilePath), { recursive: true })

        try {
          const session = await readFile(sessionFilePath, 'utf-8')
          return withResult(new StringSession(session), null)
        }
        catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            // Return empty session for first time use when no session exists
            return withResult(new StringSession(), null)
          }
          return withResult(new StringSession(), withError(error, 'Failed to load session from file'))
        }
      }
      catch (error) {
        return withResult(new StringSession(), withError(error, 'Failed to create session directory'))
      }
    },

    saveSession: async (phoneNumber: string, session: string) => {
      const sessionFilePath = getSessionFilePath(phoneNumber)

      try {
        try {
          await access(path.dirname(sessionFilePath))
        }
        catch {
          await mkdir(path.dirname(sessionFilePath), { recursive: true })
        }

        await writeFile(sessionFilePath, session, 'utf-8')
        logger.withFields({ sessionFilePath, phoneNumber }).verbose('Saving session to file')
        return withResult(null, null)
      }
      catch (error) {
        return withResult(null, withError(error, 'Failed to save session to file'))
      }
    },

    cleanSession,
  }
}
