import {ServerMessage} from '../types'
import {
  activeCharacterForUser,
  updateCharacterForUser,
  Character,
} from '../characters'
import {databaseUserForMessage, xpRequiredForLevelUp} from '../utils'

const emojiMap = [
  '0️⃣',
  '1️⃣',
  '2️⃣',
  '3️⃣',
  '4️⃣',
  '5️⃣',
  '6️⃣',
  '7️⃣',
  '8️⃣',
  '9️⃣',
  '🔟',
]

const reactionsForCharacterMarkXp = (char: Character): string[] => {
  const reactions: string[] = []

  const readyToLevel = char.xp >= xpRequiredForLevelUp(char.level)
  if (readyToLevel) {
    return ['⏫']
  }

  let {xp} = char

  if (xp > 19) {
    return ['*️⃣']
  }

  if (xp >= 10) {
    reactions.push(emojiMap[10])
    xp -= 10
  }

  if (xp > 0) {
    reactions.push(emojiMap[xp])
  }

  if (reactions.length === 0) {
    return [emojiMap[0]]
  }

  return reactions
}

export const markXp = async (
  message: ServerMessage,
  amount?: number,
): Promise<void> => {
  const userRef = databaseUserForMessage(message)
  if (amount === undefined) amount = 1

  let character = await activeCharacterForUser(message)
  if (!character) return

  const xp = character.xp + amount

  character = await updateCharacterForUser(userRef, character.name, {
    ...character,
    xp,
  })
  const reactions = reactionsForCharacterMarkXp(character)

  for (const reaction of reactions) {
    await message.react(reaction)
  }
}
