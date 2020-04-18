import {ServerCommandHandler} from '../commands'
import {
  CLASSES,
  CharacterStats,
  ORDERED_STAT_IDS,
  createCharacterForUser,
} from '../characters'
import {databaseUserForMessage, characterDescription} from '../utils'

const statsFromString = (s: string): CharacterStats => {
  const stats: CharacterStats = {str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0}
  const values = s.split('/').map(n => parseInt(n, 10))
  if (values.length !== ORDERED_STAT_IDS.length)
    throw Error('wrong number of stats')

  for (const [i, statId] of ORDERED_STAT_IDS.entries()) {
    const value = values[i]
    if (isFinite(i)) {
      stats[statId] = value
    }
  }

  return stats
}

export const createCharacter: ServerCommandHandler = async (args, message) => {
  if (!message.member) return
  if (!message.guild) return

  const charName = args.shift()
  if (!charName) return

  const charClass = (args.shift() || '').toLowerCase()
  if (!CLASSES.includes(charClass)) return

  const statString = args.shift()
  if (!statString) return
  const charStats = statsFromString(statString)

  const dbUser = databaseUserForMessage(message)

  const character = await createCharacterForUser(
    dbUser,
    charName,
    charClass,
    charStats,
  )

  message.channel.send(`Saved!\n${characterDescription(character)}`)
}
