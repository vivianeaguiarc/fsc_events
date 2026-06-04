import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
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

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'FSC Events',
      description: 'FSC Events backend service',
      version: '1.0.0',
    },
    servers: [
      {
        description: 'local server',
        url: 'http://localhost:3000',
      },
      {
        description: 'Development server',
        url: 'http://fullstackclub.com.br',
      },
    ],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})
app.after(() => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/events',
    schema: {
      tags: ['Events'],
      body: z.object({
        name: z.string().describe('Event name'),
        ownerId: z.uuid().describe('Owner ID'),
        ticketPriceInCents: z.number().describe('Ticket price in cents'),
        latitude: z.number().describe('Event latitude'),
        longitude: z.number().describe('Event longitude'),
        date: z.string().datetime().describe('Event date'),
      }),
      response: {
        201: z.object({
          id: z.uuid(),
          name: z.string().describe('FSC presencial'),
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
})

async function run() {
  await app.ready()

  await app.listen({ port: 3000 }, () => {
    console.log('Server is running on port 3000')
  })
}

run()
