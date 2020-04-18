import {Message, Guild} from 'discord.js'

// type ArrayValues<A> = A extends (infer V)[] ? V : never

export interface ServerMessage extends Message {
  readonly guild: Guild
}
