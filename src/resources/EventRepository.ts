import { and, eq } from 'drizzle-orm'

import { OnSiteEvent } from '../aplication/entities/OnSiteEvent'
import { db } from '../db/client'
import * as schema from '../db/schema'
export interface EventRepository {
  create(input: OnSiteEvent): Promise<OnSiteEvent>
}
// Adapter
export class EventRepositoryDrizzle implements EventRepository {
  constructor(private database: typeof db) {}
  async getByDateLatAndLong(params: {
    date: Date
    latitude: number
    longitude: number
  }): Promise<OnSiteEvent | null> {
    const output = await this.database.query.eventsTable.findFirst({
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
    const [output] = await this.database
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
