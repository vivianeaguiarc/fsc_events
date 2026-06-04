import axios from 'axios'

axios.defaults.validateStatus = () => true

describe('POST /events', () => {
  test('Deve criar um evento com sucesso', async () => {
    const input = {
      name: `Evento de Teste ${crypto.randomUUID()}`,
      ticketPriceInCents: 5000,
      latitude: Number((Math.random() * 89).toFixed(6)),
      longitude: Number((Math.random() * 179).toFixed(6)),
      date: new Date(Date.now() + 60 * 60 * 1000 + Math.random() * 1000000),
      ownerId: crypto.randomUUID(),
    }

    const response = await axios.post('http://localhost:3000/events', input)

    if (response.status !== 201) {
      console.log(response.status)
      console.log(response.data)
    }

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
      name: `Evento de Teste ${crypto.randomUUID()}`,
      ticketPriceInCents: 5000,
      latitude: Number((Math.random() * 89).toFixed(6)),
      longitude: Number((Math.random() * 179).toFixed(6)),
      date: new Date(Date.now() + 60 * 60 * 1000 + Math.random() * 1000000),
      ownerId: 'invalid-uuid',
    }

    const response = await axios.post('http://localhost:3000/events', input)

    expect(response.status).toBe(400)
  })
})
