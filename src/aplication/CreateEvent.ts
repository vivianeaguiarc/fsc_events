import { OnSiteEvent } from './entities/OnSiteEvent'

interface Input {
  name: string
  ownerId: string
  ticketPriceInCents: number
  latitude: number
  longitude: number
  date: Date
}

// Ports
export interface EventRepository {
  create: (input: OnSiteEvent) => Promise<OnSiteEvent>
  getByDateLatAndLong: (params: {
    date: Date
    latitude: number
    longitude: number
  }) => Promise<OnSiteEvent | null>
}

export class CreateEvent {
  constructor(private readonly eventRepository: EventRepository) {}
  async execute(input: Input) {
    const { name, ticketPriceInCents, latitude, longitude, date, ownerId } =
      input
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        ownerId
      )
    ) {
      throw new Error('Invalid ownerId format')
    }
    if (ticketPriceInCents < 0) {
      throw new Error('ticketPriceInCents must be a positive integer')
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error('latitude must be between -90 and 90')
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('longitude must be between -180 and 180')
    }
    // BUSINESS RULE
    // a data é no futuro?
    const now = new Date()
    if (date < now) {
      throw new Error('date must be in the future')
    }
    // nao posso criar um eventona mesma data (dia e horário), latitude e longitude)
    const existentEvent = await this.eventRepository.getByDateLatAndLong({
      date,
      latitude,
      longitude,
    })
    if (existentEvent) {
      throw new Error('An event already exists at the same date and location')
    }
    const event = await this.eventRepository.create({
      id: crypto.randomUUID(),
      name,
      ownerId,
      ticketPriceInCents,
      latitude,
      longitude,
      date,
    })
    return event
  }
}
