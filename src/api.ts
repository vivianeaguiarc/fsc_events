import fastify, { FastifyReply, FastifyRequest } from 'fastify'

import { CreateEvent } from './aplication/CreateEvent'
import { db } from './db/client'
import { EventRepositoryDrizzle } from './resources/EventRepository'

const app = fastify()

app.post('/events', async (req: FastifyRequest, res: FastifyReply) => {
  const { name, ownerId, ticketPriceInCents, latitude, longitude, date } =
    req.body as {
      name: string
    }
  try {
    const eventRepositoryDrizzle = new EventRepositoryDrizzle(db)
    const createEvent = new CreateEvent(eventRepositoryDrizzle)
    const event = await createEvent.execute({
      name,
      ownerId,
      ticketPriceInCents,
      latitude,
      longitude,
      date: new Date(date),
    })
    res.status(201).send(event)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'

    return res.status(400).send({ message })
  }
})

app.listen({ port: 3000 }, () => {
  console.log('Server is running on port 3000')
})
