import express from 'express'
import { authentication } from '../MiddleWere/userAuthentication.js'
import { readJsonFile } from '../utils/readFile.js'
import fs from 'fs'

const eventsPATH = './data/events.json'
const receiptPATH = './data/receipts.json'

const user = express()
user.use(express.json())


user.post('/tickets/buy', authentication, async (req, res) => {

    const events = await readJsonFile(eventsPATH)
    const receipts = await readJsonFile(receiptPATH)

    const findEvent = events.find(eventObj => eventObj.eventName === req.body.eventName)

    if (!findEvent) {

        return res.status(404).json({

            error: 'event not found'

        })

    }
    const indexEventFound = events.indexOf(findEvent)
    findEvent.ticketsForSale -= req.body.quantity

    if (findEvent.ticketsForSale < 0) {

        return res.json({

            error: 'There are not enough tickets'

        })

    }

    events.splice(indexEventFound, 1, findEvent)
    await fs.promises.writeFile(eventsPATH, events)

    const newReceipt = {

        username: req.headers["username"],
        password: req.headers["password"],
        eventName: req.body.eventName,
        quantity: req.body.quantity
    }

    receipts.push(newReceipt)
    await fs.promises.writeFile(receiptPATH, receipts)

    res.status(201).json({

        "message": "Tickets purchased successfully"

    })

})


user.get('/:username/summary', authentication, async (req, res) => {

    const { username } = req.params

    const receipts = await readJsonFile(receiptPATH)
    const userReceipts = receipts.filter(receiptObj => receiptObj.username === username)

    let sumTickets = 0
    let events = []

    for (const receiptObj of userReceipts) {

        sumTickets += receiptObj.quantity
        events.push(receiptObj.eventName)
    }

    res.status(200).json({

        "totalTicketsBought": sumTickets,
        "events": events,
        "averageTicketsPerEvent": sumTickets / events.length

    })


})




export { user }
