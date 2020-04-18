import {ServerMessage} from '../types'
import {
  activeCharacterForUser,
  MODIFIER_NAMES,
  modifierForStat,
} from '../characters'
import {formatModifierValue, asStatId} from '../utils'

export const rollPlusStat = async (
  message: ServerMessage,
  stat: string,
  extraModifier?: number,
): Promise<void> => {
  stat = stat.toLowerCase()
  const character = await activeCharacterForUser(message)
  if (!character) return

  let modifier = 0
  let modifierName = 'nothing'

  const statAsNumber = parseInt(stat)
  if (isFinite(statAsNumber)) {
    modifier = statAsNumber
    modifierName = `${statAsNumber}`
  } else {
    const statId = asStatId(stat)
    if (statId !== null) {
      modifierName = MODIFIER_NAMES[statId]
      modifier = modifierForStat(character.stats[statId])
    }
  }

  const rolls = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ]
  const total = rolls[0] + rolls[1] + modifier + (extraModifier || 0)

  const mathSections = [
    `(${rolls.join(' + ')})`,
    formatModifierValue(modifier, true),
  ]

  if (extraModifier) {
    mathSections.push(formatModifierValue(extraModifier, true))
  }

  let outcomeEmoji
  if (total < 7) outcomeEmoji = '👎'
  else if (total < 10) outcomeEmoji = '👍'
  else outcomeEmoji = '👌'

  const output =
    `**${character.name}** ` +
    `rolling+${modifierName}${
      extraModifier ? ' ' + formatModifierValue(extraModifier, true) : ''
    }:\n` +
    `\`${mathSections.join(' ')}\` ` +
    `= **${total}** ` +
    outcomeEmoji

  message.channel.send(output)
}
