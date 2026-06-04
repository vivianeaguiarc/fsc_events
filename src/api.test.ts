import axios from 'axios'

axios.defaults.validateStatus = () => true

describe.skip('POST /events', () => {
  test('Deve criar um evento com sucesso', async () => {
    const input = {
      name: `Evento de Teste ${crypto.randomUUID()}`,
      ticketPriceInCents: 5000,
      latitude: Number((Math.random() * 89).toFixed(6)),
      longitude: Number((Math.random() * 179).toFixed(6)),
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const response = await axios.post('http://localhost:3000/events', input)

    expect(response.status).toBe(201)
  })

  test('Deve retornar 400 se createEvent lançar uma exceção', async () => {
    const input = {
      name: `Evento de Teste ${crypto.randomUUID()}`,
      ticketPriceInCents: 5000,
      latitude: Number((Math.random() * 89).toFixed(6)),
      longitude: Number((Math.random() * 179).toFixed(6)),
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: 'invalid-uuid',
    }

    const response = await axios.post('http://localhost:3000/events', input)

    expect(response.status).toBe(400)
  })
})
