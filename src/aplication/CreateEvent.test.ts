import { CreateEvent, type EventRepository } from './CreateEvent'

type EventInput = {
  name: string
  ownerId: string
  ticketPriceInCents: number
  latitude: number
  longitude: number
  date: Date
}

type EventOutput = EventInput & {
  id: string
}

describe('POST /events', () => {
  class EventInMemoryRepository implements EventRepository {
    private events: EventOutput[] = []

    async create(input: EventInput): Promise<EventOutput> {
      const event = { id: crypto.randomUUID(), ...input }
      this.events.push(event)
      return event
    }
  }

  const createEvent = new CreateEvent(new EventInMemoryRepository())

  test('Deve criar um evento com sucesso', async () => {
    const input = {
      id: crypto.randomUUID(),
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = await createEvent.execute(input)

    expect(output.name).toBe(input.name)
    expect(output.ticketPriceInCents).toBe(input.ticketPriceInCents)
    expect(output.id).toBeDefined()
    expect(typeof output.id).toBe('string')
  })

  test('Deve retornar erro se o ownerId não for um UUID válido', async () => {
    const input = {
      id: crypto.randomUUID(),
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: 'invalid-uuid',
    }

    const output = createEvent.execute(input)

    await expect(output).rejects.toThrow('Invalid ownerId format')
  })

  test('Deve retornar erro se o ticketPriceInCents for negativo', async () => {
    const input = {
      id: crypto.randomUUID(),
      name: 'Evento de Teste',
      ticketPriceInCents: -5000,
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = createEvent.execute(input)

    await expect(output).rejects.toThrow(
      'ticketPriceInCents must be a positive integer'
    )
  })

  test('Deve retornar erro se a latitude for inválida', async () => {
    const input = {
      id: crypto.randomUUID(),
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: -91,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = createEvent.execute(input)

    await expect(output).rejects.toThrow('latitude must be between -90 and 90')
  })

  test('Deve retornar erro se a longitude for inválida', async () => {
    const input = {
      id: crypto.randomUUID(),
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: 40.7128,
      longitude: -181,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = createEvent.execute(input)

    await expect(output).rejects.toThrow(
      'longitude must be between -180 and 180'
    )
  })

  test('Deve retornar erro se a data for no passado', async () => {
    const input = {
      id: crypto.randomUUID(),
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() - 2)),
      ownerId: crypto.randomUUID(),
    }

    const output = createEvent.execute(input)

    await expect(output).rejects.toThrow('date must be in the future')
  })
})
