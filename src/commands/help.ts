import {CommandHandler} from './index'

const code = (str: string): string => `\`${str}\``

export const help: CommandHandler = (args, message) => {
  message.author.send(`
Welcome to Dungeon World!

${code('dw help')}
> Show this text

${code('dw createchar <NAME> <CLASS> <STATS>')}
> Create a character with the given name, class, and slash-separated ability scores (str/dex/con/int/wis/cha)
> **NOTE:** If you already have a character with the given name, this will overwrite that existing character.
> e.g. ${code('dw savechar Sigurd cleric 16/8/12/13/15/9')}

${code('dw active')}
> Show your active character

${code('dw active <NAME>')}
> Set your active character

${code('roll +<ABILITY> [+n|-n]')}
> Make a roll for your character using the given \`ABILITY\` (str/dex/con/int/wis/cha)
> You can optionally provide an additional modifier \`n\` to the roll.
> The result will also include an indicator for success 👌, partial success 👍, or failure 👎.

${code('mark xp')}
> Mark XP for your character
> The new XP total will be displayed as an emoji reaction: 1️⃣ through 🔟9️⃣ (i.e. 19).
> _Exception 1:_ If your character has enough XP to level up, ⏫ will be displayed.
> _Exception 2:_ If your character has more than 19 XP, *️⃣ will be displayed.

${code('levelup <ABILITY>')}
> Level up your character and increase one of their \`ABILITY\` scores
`)
}
