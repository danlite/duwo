import {firestore} from 'firebase-admin'
import {ServerMessage} from './types'
import {databaseUserForMessage} from './utils'

export interface CharacterStats {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}
export type CharacterStatId = keyof CharacterStats

export const modifierForStat = (s: number): number => {
  if (s <= 3) return -3
  if (s <= 5) return -2
  if (s <= 8) return -1
  if (s <= 12) return 0
  if (s <= 15) return 1
  if (s <= 17) return 2
  return 3
}

export const ORDERED_STAT_IDS: Array<CharacterStatId> = [
  'str',
  'dex',
  'con',
  'int',
  'wis',
  'cha',
]

export const STAT_NAMES: {[id in CharacterStatId]: string} = {
  cha: 'Charisma',
  con: 'Constitution',
  dex: 'Dexterity',
  int: 'Intelligence',
  str: 'Strength',
  wis: 'Wisdom',
}

export const MODIFIER_NAMES: {[id in CharacterStatId]: string} = {
  cha: 'CHA',
  con: 'CON',
  dex: 'DEX',
  int: 'INT',
  str: 'STR',
  wis: 'WIS',
}

export const CLASSES = [
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'immolator',
  'paladin',
  'ranger',
  'thief',
  'wizard',
]

const CLASS_BASE_HP = {
  barbarian: 8,
  bard: 6,
  cleric: 8,
  druid: 6,
  fighter: 10,
  immolator: 4,
  paladin: 10,
  ranger: 8,
  thief: 6,
  wizard: 4,
}

const CLASS_DAMAGE_DIE = {
  barbarian: 10,
  bard: 6,
  cleric: 6,
  druid: 6,
  fighter: 10,
  immolator: 8,
  paladin: 10,
  ranger: 8,
  thief: 8,
  wizard: 4,
}

export const characterMaxHp = (character: Character): number => {
  let base = 4
  if (character.class in CLASS_BASE_HP)
    base = CLASS_BASE_HP[character.class as keyof typeof CLASS_BASE_HP]

  return base + character.stats.con
}

export const characterDamageDie = (character: Character): number => {
  if (character.class in CLASS_DAMAGE_DIE)
    return CLASS_DAMAGE_DIE[character.class as keyof typeof CLASS_DAMAGE_DIE]

  return 1
}

export interface Character {
  name: string
  class: string
  stats: CharacterStats
  xp: number
  level: number
}

const characterRefForUser = (
  user: firestore.DocumentReference,
  charName: string,
): firestore.DocumentReference => user.collection('characters').doc(charName)

export const characterForUser = async (
  user: firestore.DocumentReference,
  charName: string,
): Promise<Character> => {
  const snapshot = await characterRefForUser(user, charName).get()
  if (!snapshot.exists) throw Error('character does not exist')

  const data = await snapshot.data()
  if (!data) throw Error('character does not exist')

  const char = data as Character
  char.xp = char.xp || 0
  char.level = char.level || 1
  return char
}

export const createCharacterForUser = async (
  user: firestore.DocumentReference,
  characterName: string,
  characterClass: string,
  characterStats: CharacterStats,
): Promise<Character> => {
  const character: Character = {
    name: characterName,
    class: characterClass,
    stats: characterStats,
    xp: 0,
    level: 1,
  }

  await characterRefForUser(user, characterName).set(character)

  return character
}

export const updateCharacterForUser = async (
  user: firestore.DocumentReference,
  characterName: string,
  character: Character,
): Promise<Character> => {
  const characterRef = characterRefForUser(user, characterName)
  await characterRef.set({...character, name: characterName})
  return characterForUser(user, characterName)
}

export const activeCharacterForUser = async (
  message: ServerMessage,
): Promise<Character> => {
  try {
    const userRef = databaseUserForMessage(message)
    const userSnapshot = await userRef.get()
    if (!userSnapshot.exists) throw Error()

    const activeCharName: string = (await userSnapshot.data())
      ?.activeCharacterName

    if (!activeCharName) throw Error()

    return await characterForUser(userRef, activeCharName)
  } catch (e) {
    message.channel.send('❌ no active character')
    throw e
  }
}
