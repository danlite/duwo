import {config as dotenvConfig} from 'dotenv'
dotenvConfig()

import {Client} from 'discord.js'
import {serverCommandMap, commandMap} from './commands'
import {ServerMessage} from './types'
import {asServerMessage} from './utils'
import {rollPlusStat} from './commands/charroll'
import {levelUp} from './commands/levelup'
import {markXp} from './commands/markxp'

const token = process.env.DISCORD_BOT_TOKEN

const commandPrefix = 'dw'
const commandPrefixPattern = new RegExp(`^${commandPrefix} `, 'i')
const client = new Client()

client.once('ready', () => {
  console.log('Ready!')
})

client.on('message', async message => {
  if (message.author.bot) return

  let contentMatch: RegExpMatchArray | null

  if (message.content.match(commandPrefixPattern)) {
    const args = message.content.split(/\s+/)
    args.shift() // prefix
    let commandId = args.shift()
    if (!commandId) return
    commandId = commandId.toLowerCase()

    const command = commandMap[commandId]
    if (command) {
      try {
        await command(args, message)
      } catch (e) {
        console.error(e.message)
      }
      return
    }

    // maybe it's server command
    let serverMessage: ServerMessage
    try {
      serverMessage = asServerMessage(message)
    } catch (e) {
      return
    }

    const serverCommand = serverCommandMap[commandId]
    if (!serverCommand) {
      console.debug(`invalid command ${commandId}`)
      return
    }

    try {
      await serverCommand(args, serverMessage)
    } catch (e) {
      console.error(e.message)
    }
    return
  }

  let serverMessage: ServerMessage
  const messageContent = message.content.trim()
  try {
    serverMessage = asServerMessage(message)
  } catch (e) {
    return
  }
  if (
    (contentMatch = messageContent.match(
      /^roll\s*\+\s*(\w+)\s*([+-]\s*\d+)?$/i,
    ))
  ) {
    let extraModifier: number | undefined
    if (contentMatch[2]) {
      extraModifier = parseInt(contentMatch[2].replace(/\s/g, ''))
    }
    await rollPlusStat(serverMessage, contentMatch[1], extraModifier)
  } else if (
    (contentMatch = messageContent.match(
      /^levelup (str|dex|con|int|wis|cha)$/i,
    ))
  ) {
    await levelUp(serverMessage, contentMatch[1])
  } else if ((contentMatch = messageContent.match(/^mark\s*(\d*)\s*xp$/i))) {
    const xp = parseInt(contentMatch[1] || '1')
    await markXp(serverMessage, xp)
  }
})

client.login(token)
