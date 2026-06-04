import 'dotenv/config'

import { and, eq } from 'drizzle-orm'
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
  async getByDateLatAndLong(params: {
    date: Date
    latitude: number
    longitude: number
  }): Promise<OnSiteEvent | null> {
    const output = await db.query.eventsTable.findFirst({
      where: and(
        eq(schema.eventsTable.date, params.date),
        eq(schema.eventsTable.latitude, params.latitude.toString()),
        eq(schema.eventsTable.longitude, params.longitude.toString())
      ),
    })

    if (!output) {
      return null
    }

    return {
      date: output.date,
      id: output.id,
      latitude: Number(output.latitude),
      longitude: Number(output.longitude),
      name: output.name,
      ownerId: output.owner_id,
      ticketPriceInCents: output.ticket_price_in_cents,
    }
  }

  async create(input: OnSiteEvent) {
    const [output] = await db
      .insert(schema.eventsTable)
      .values({
        // @ts-expect-error - Drizzle espera snake_case, mas a interface é camelCase
        id: input.id,
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
