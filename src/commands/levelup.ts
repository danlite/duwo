import {activeCharacterForUser, updateCharacterForUser} from '../characters'
import {
  databaseUserForMessage,
  xpRequiredForLevelUp,
  asStatId,
  characterDescription,
} from '../utils'
import {ServerMessage} from '../types'

export const levelUp = async (
  message: ServerMessage,
  ability: string,
): Promise<void> => {
  const userRef = databaseUserForMessage(message)

  let character = await activeCharacterForUser(message)
  if (!character) return

  const statId = asStatId(ability)
  if (!statId) {
    message.channel.send(`❌ Must include an ability to increase by 1`)
    return
  }

  const charXp = character.xp
  const reqXp = xpRequiredForLevelUp(character.level)
  if (charXp < reqXp) {
    message.channel.send(
      `❌ Not enough XP to level up (have ${charXp}, need ${reqXp})`,
    )
    return
  }

  const newAbilityScore = character.stats[statId] + 1
  if (newAbilityScore > 18) {
    message.channel.send(`❌ Ability scores can't go higher than 18`)
    return
  }

  character = await updateCharacterForUser(userRef, character.name, {
    ...character,
    xp: charXp - reqXp,
    level: character.level + 1,
    stats: {
      ...character.stats,
      [statId]: character.stats[statId] + 1,
    },
  })

  message.react('⭐')
  message.channel.send(characterDescription(character))
}
