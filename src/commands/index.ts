import {Message} from 'discord.js'
import {ServerMessage} from '../types'

import {help} from './help'
import {createCharacter} from './savechar'
import {activeCharacter} from './activechar'

export type ServerCommandHandler = (
  args: string[],
  message: ServerMessage,
) => void | Promise<void>

export const serverCommandMap: {[key: string]: ServerCommandHandler} = {
  createchar: createCharacter,
  active: activeCharacter,
}

export type CommandHandler = (
  args: string[],
  message: Message,
) => void | Promise<void>

export const commandMap: {[key: string]: CommandHandler} = {
  help,
}
