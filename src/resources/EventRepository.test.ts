import { EventRepositoryDrizzle } from './EventRepository'

describe('EventRepositoryDrizzle', () => {
  const repository = new EventRepositoryDrizzle()

  test('Deve criar um evento com sucesso', async () => {
    const input = {
      id: crypto.randomUUID(),
      name: 'Evento de Teste Repository',
      ticketPriceInCents: 5000,
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = await repository.create(input)

    expect(output.id).toBe(input.id)
    expect(output.name).toBe(input.name)
    expect(output.ownerId).toBe(input.ownerId)
    expect(output.ticketPriceInCents).toBe(input.ticketPriceInCents)
    expect(output.latitude).toBe(input.latitude)
    expect(output.longitude).toBe(input.longitude)
    expect(output.date).toEqual(input.date)
  })

  test('Deve buscar um evento por data, latitude e longitude', async () => {
    const input = {
      id: crypto.randomUUID(),
      name: 'Evento de Teste Busca',
      ticketPriceInCents: 5000,
      latitude: -90,
      longitude: -100,
      date: new Date(new Date().setHours(new Date().getHours() + 2)),
      ownerId: crypto.randomUUID(),
    }

    await repository.create(input)

    const output = await repository.getByDateLatAndLong({
      date: input.date,
      latitude: input.latitude,
      longitude: input.longitude,
    })

    expect(output).not.toBeNull()
    expect(output?.id).toBe(input.id)
    expect(output?.name).toBe(input.name)
    expect(output?.ownerId).toBe(input.ownerId)
    expect(output?.ticketPriceInCents).toBe(input.ticketPriceInCents)
    expect(output?.latitude).toBe(input.latitude)
    expect(output?.longitude).toBe(input.longitude)
    expect(output?.date).toEqual(input.date)
  })

  test('Deve retornar null se não encontrar evento na mesma data e localização', async () => {
    const output = await repository.getByDateLatAndLong({
      date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      latitude: 1,
      longitude: 1,
    })

    expect(output).toBeNull()
  })
})
