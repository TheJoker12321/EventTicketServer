import express from 'express'
import { authentication } from '../MiddleWere/userAuthentication.js'
import { readJsonFile } from '../utils/readFile.js'
import fs from 'fs'


const PATH = './data/events.json'

const event = express()
event.use(express.json())


event.post('/', authentication, async (req, res) => {

    const newEvent = {

        eventName: req.body.eventName,
        ticketsForSale: req.body.ticketsForSale,
        username: req.headers["username"],
        password: req.headers["password"]

    }

    const events = await readJsonFile(PATH)
    events.push(newEvent)

    await fs.promises.writeFile(PATH, JSON.stringify(events))

    res.status(201).json({

        message: "Event created successfully"

    })

})


export { event }