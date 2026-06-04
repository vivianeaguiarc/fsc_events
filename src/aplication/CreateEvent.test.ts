import { db } from '../db/client'
import { EventRepositoryDrizzle } from '../resources/EventRepository'
import { CreateEvent } from './CreateEvent'

describe('POST /events', () => {
  const createEvent = new CreateEvent(new EventRepositoryDrizzle(db))

  test('Deve criar um evento com sucesso', async () => {
    const input = {
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
    expect(output.latitude).toBe(input.latitude)
    expect(output.longitude).toBe(input.longitude)
    expect(new Date(output.date)).toEqual(input.date)
  })

  test('Deve retornar erro se o ownerId não for um UUID válido', async () => {
    const input = {
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

  test('Deve lançar um erro se já existir um evento na mesma data e localização', async () => {
    const date = new Date(new Date().setHours(new Date().getHours() + 2))

    const input = {
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: -90,
      longitude: -100,
      date,
      ownerId: crypto.randomUUID(),
    }

    const output = await createEvent.execute(input)

    expect(output.name).toBe(input.name)
    expect(output.ticketPriceInCents).toBe(input.ticketPriceInCents)

    const output2 = createEvent.execute(input)

    await expect(output2).rejects.toThrow(
      'An event already exists at the same date and location'
    )
  })
})
