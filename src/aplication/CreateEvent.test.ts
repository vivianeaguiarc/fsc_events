import { StartedPostgreSqlContainer } from '@testcontainers/postgresql'

import { db } from '../db/client'
import { eventsTable } from '../db/schema'
import { startPostgresTestDb } from '../db/test-db'
import { EventRepositoryDrizzle } from '../resources/EventRepository'
import { CreateEvent } from './CreateEvent'

describe('POST /events', () => {
  const makeSut = () => {
    const eventRepository = new EventRepositoryDrizzle(database)
    const sut = new CreateEvent(eventRepository)
    return { sut, eventRepository }
  }
  let database: typeof db
  let container: StartedPostgreSqlContainer

  beforeAll(async () => {
    const testDatabase = await startPostgresTestDb()
    database = testDatabase.db
    container = testDatabase.container
  })
  beforeEach(async () => {
    await database.delete(eventsTable).execute()
  })

  afterAll(async () => {
    await database.$client.end()
    await container.stop()
  })

  test('Deve criar um evento com sucesso', async () => {
    const createEvent = new CreateEvent(new EventRepositoryDrizzle(database))
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
    const { sut } = makeSut()
    const input = {
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: 'invalid-uuid',
    }

    const output = sut.execute(input)

    await expect(output).rejects.toThrow('Invalid ownerId format')
  })

  test('Deve retornar erro se o ticketPriceInCents for negativo', async () => {
    const { sut } = makeSut()
    const input = {
      name: 'Evento de Teste',
      ticketPriceInCents: -5000,
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = sut.execute(input)

    await expect(output).rejects.toThrow(
      'ticketPriceInCents must be a positive integer'
    )
  })

  test('Deve retornar erro se a latitude for inválida', async () => {
    const { sut } = makeSut()
    const input = {
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: -91,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = sut.execute(input)

    await expect(output).rejects.toThrow('latitude must be between -90 and 90')
  })

  test('Deve retornar erro se a longitude for inválida', async () => {
    const { sut } = makeSut()
    const input = {
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: 40.7128,
      longitude: -181,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = sut.execute(input)

    await expect(output).rejects.toThrow(
      'longitude must be between -180 and 180'
    )
  })

  test('Deve retornar erro se a data for no passado', async () => {
    const { sut } = makeSut()
    const input = {
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() - 2)),
      ownerId: crypto.randomUUID(),
    }

    const output = sut.execute(input)

    await expect(output).rejects.toThrow('date must be in the future')
  })

  test('Deve lançar um erro se já existir um evento na mesma data e localização', async () => {
    const { sut } = makeSut()
    const date = new Date(new Date().setHours(new Date().getHours() + 2))

    const input = {
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: -90,
      longitude: -100,
      date,
      ownerId: crypto.randomUUID(),
    }

    const output = await sut.execute(input)

    expect(output.name).toBe(input.name)
    expect(output.ticketPriceInCents).toBe(input.ticketPriceInCents)

    const output2 = sut.execute(input)

    await expect(output2).rejects.toThrow(
      'An event already exists at the same date and location'
    )
  })
  test('Deve chamar o repository com os parâmetros corretos', async () => {
    const { sut, eventRepository } = makeSut()

    const spy = vi.spyOn(eventRepository, 'create')

    const input = {
      name: 'FSC Presencial',
      ticketPriceInCents: 2000,
      latitude: -90.0,
      longitude: -180.0,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    await sut.execute(input)

    expect(spy).toHaveBeenCalledWith({
      id: expect.any(String),
      ...input,
    })
  })
})
