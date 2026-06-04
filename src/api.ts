import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import z from 'zod'

import { CreateEvent } from './aplication/CreateEvent'
import { db } from './db/client'
import { EventRepositoryDrizzle } from './resources/EventRepository'

const app = fastify()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'POST',
  url: '/events',
  schema: {
    body: z.object({}),
    response: {
      201: z.object({
        id: z.uuid(),
        name: z.string(),
        ownerId: z.uuid(),
        ticketPriceInCents: z.number(),
        latitude: z.number(),
        longitude: z.number(),
        date: z.string().datetime(),
      }),
      400: z.object({
        message: z.string(),
      }),
    },
  },
  handler: async (req, res) => {
    const { name, ownerId, ticketPriceInCents, latitude, longitude, date } =
      req.body
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
      res.status(201).send({
        ...event,
        date: event.date.toISOString(),
      })
    } catch (error: unknown) {
      console.error(error)

      if (error instanceof Error) {
        return res.status(400).send({ message: error.message })
      }

      return res.status(400).send({ message: 'Unexpected error' })
    }
  },
})

app.listen({ port: 3000 }, () => {
  console.log('Server is running on port 3000')
})
