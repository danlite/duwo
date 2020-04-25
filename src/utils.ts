import {Message} from 'discord.js'
import {firestore} from 'firebase-admin'

import {
  Character,
  CharacterStats,
  ORDERED_STAT_IDS,
  modifierForStat,
  MODIFIER_NAMES,
  STAT_NAMES,
  CharacterStatId,
  characterDamageDie,
  characterMaxHp,
} from './characters'
import {ServerMessage} from './types'
import db from './database'

export const asServerMessage = (message: Message): ServerMessage => {
  if (message.member !== null && message.guild !== null) {
    return message as ServerMessage
  }

  throw Error('missing member/guild')
}

export const databaseUserForMessage = async (
  message: ServerMessage,
): Promise<firestore.DocumentReference> => {
  const ref = db
    .collection('servers')
    .doc(message.guild.id)
    .collection('users')
    .doc(message.author.id)

  try {
    await ref.create({})
  } catch (e) {
    // already exists
  }

  return ref
}

export const formatModifierValue = (n: number, asMath?: boolean): string => {
  let result = n < 0 ? `${n}` : `+${n}`
  if (asMath) result = result.replace(/([+-])/, '$1 ')
  return result
}

const statDescription = (stats: CharacterStats): string => {
  const statLines = ORDERED_STAT_IDS.map(
    statId =>
      `\`(${MODIFIER_NAMES[statId]} ${formatModifierValue(
        modifierForStat(stats[statId]),
      )})\` ` + `${STAT_NAMES[statId]} ${stats[statId]}`,
  )

  return statLines.join('\n')
}

export const characterDescription = (character: Character): string =>
  `**${character.name}** the level ${character.level} **${character.class}**\n` +
  `>>> ` +
  `Max HP: **${characterMaxHp(character)}** | ` +
  `Base damage: **d${characterDamageDie(character)}**` +
  '\n' +
  statDescription(character.stats)

export const xpRequiredForLevelUp = (level: number): number => level + 7

export const asStatId = (s: string): CharacterStatId | null => {
  s = s.toLowerCase()
  if (Object.keys(STAT_NAMES).includes(s)) return s as CharacterStatId
  return null
}
