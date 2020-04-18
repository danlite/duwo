import {ServerCommandHandler} from '../commands'
import {ServerMessage} from '../types'
import {databaseUserForMessage, characterDescription} from '../utils'
import {
  activeCharacterForUser,
  Character,
  characterForUser,
} from '../characters'

const showActiveCharacter = async (message: ServerMessage): Promise<void> => {
  const character = await activeCharacterForUser(message)
  if (!character) return

  message.channel.send(
    `${message.author} is playing as ` + characterDescription(character),
  )
}

export const activeCharacter: ServerCommandHandler = async (args, message) => {
  if (args.length === 0) {
    await showActiveCharacter(message)
  } else {
    const charName = args.shift()
    if (!charName) return

    const userRef = databaseUserForMessage(message)

    let char: Character
    try {
      char = await characterForUser(userRef, charName)
    } catch (e) {
      message.channel.send(
        `❌ no character named **${charName}** (try \`savechar\` first)`,
      )
      return
    }

    await userRef.update({activeCharacterName: charName})
    message.channel.send(
      `${message.author} is playing as ${characterDescription(char)}`,
    )
  }
}
