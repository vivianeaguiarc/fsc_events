import express from 'express'

import { CreateEvent } from './aplication/CreateEvent'
import { db } from './db/client'
import { EventRepositoryDrizzle } from './resources/EventRepository'

const app = express()

app.use(express.json())

app.post('/events', async (req, res) => {
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
    res.status(201).json(event)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'

    return res.status(400).json({ message })
  }
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
