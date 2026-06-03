import axios from 'axios'

axios.defaults.validateStatus = () => true

describe('POST /events', () => {
  test('Deve criar um evento com sucesso', async () => {
    const input = {
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const response = await axios.post('http://localhost:3000/events', input)

    expect(response.status).toBe(201)
    expect(response.data.name).toBe(input.name)
    expect(response.data.ticketPriceInCents).toBe(input.ticketPriceInCents)
    expect(response.data.ownerId).toBe(input.ownerId)
    expect(new Date(response.data.date)).toEqual(input.date)
    expect(Number(response.data.latitude)).toBe(input.latitude)
    expect(Number(response.data.longitude)).toBe(input.longitude)
  })

  test('Deve retornar 400 se createEvent lançar uma exceção', async () => {
    const input = {
      name: 'Evento de Teste',
      ticketPriceInCents: 5000,
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: 'invalid-uuid',
    }

    const response = await axios.post('http://localhost:3000/events', input)

    expect(response.status).toBe(400)
  })
})
