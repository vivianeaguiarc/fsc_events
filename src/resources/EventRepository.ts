import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'

import { OnSiteEvent } from '../aplication/entities/OnSiteEvent'
import * as schema from '../db/schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

const db = drizzle(process.env.DATABASE_URL, { schema })

export interface EventRepository {
  create(input: OnSiteEvent): Promise<OnSiteEvent>
}
// Adapter
export class EventRepositoryDrizzle implements EventRepository {
  async create(input: OnSiteEvent) {
    const [output] = await db
      .insert(schema.eventsTable)
      .values({
        date: input.date,
        latitude: input.latitude,
        longitude: input.longitude,
        name: input.name,
        owner_id: input.ownerId,
        ticket_price_in_cents: input.ticketPriceInCents,
      })
      .returning()
    return {
      id: output.id,
      name: output.name,
      ownerId: output.owner_id,
      ticketPriceInCents: output.ticket_price_in_cents,
      latitude: Number(output.latitude),
      longitude: Number(output.longitude),
      date: new Date(output.date),
    }
  }
}
