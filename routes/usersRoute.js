import express from 'express'
import { authentication } from '../MiddleWere/userAuthentication.js'
import { readJsonFile } from '../utils/readFile.js'
import fs from 'fs'

const eventsPATH = './data/events.json'
const receiptPATH = './data/receipts.json'

const user = express()
user.use(express.json())


user.post('/tickets/buy', authentication, async (req, res) => {
    
    const users = await readJsonFile('./data/users.json')
    const userFound = users.find(userObj => userObj.username === req.headers["username"])
    
    if (userFound.role === 'user') {

        res.status(401).json({

            error: "only admins can create events"

        })
        
    }

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
    await fs.promises.writeFile(eventsPATH, JSON.stringify(events))

    const newReceipt = {

        username: req.headers["username"],
        password: req.headers["password"],
        eventName: req.body.eventName,
        quantity: req.body.quantity
    }

    receipts.push(newReceipt)
    await fs.promises.writeFile(receiptPATH, JSON.stringify(receipts))

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


user.put('/:username/to/:newUsername/:event', authentication, async (req, res) => {

    const fromUsername = req.params.username
    const toUsername = req.params.newUsername
    const { event } = req.params

    const receipts = await readJsonFile(receiptPATH)
    const eventOfLastUser = receipts.find(receiptObj => receiptObj.username === fromUsername && receiptObj.eventName === event)
    
    receipts.splice(receipts.indexOf(eventOfLastUser), 1)
    eventOfLastUser.username = toUsername
    eventOfLastUser.password = req.headers["password"]
    receipts.push(eventOfLastUser)

    await fs.promises.writeFile(receiptPATH, JSON.stringify(receipts))

    await fs.promises.appendFile('./logs/changes.txt', `update username from ${fromUsername} to ${toUsername} \n`)
    
    res.status(204).json({

        msg: "update username",
        newReceipt: eventOfLastUser

    })

})


user.delete('/:username/:event', authentication, async (req, res) => {

    const { username, event } = req.params


    const receipts = await readJsonFile(receiptPATH)
    const events = await readJsonFile(eventsPATH)

    const findReceipt = receipts.find(receiptObj => receiptObj.username === username && receiptObj.eventName === event)
    const findEvent = events.find(eventObj => eventObj.eventName === event)
    const indexEventFound = events.indexOf(findEvent)

    findEvent.ticketsForSale += findReceipt.quantity
    receipts.splice(receipts.indexOf(findReceipt), 1)
    events.splice(indexEventFound, 1, findEvent)

    await fs.promises.writeFile(eventsPATH, JSON.stringify(events))

    await fs.promises.appendFile('./logs/changes.txt', "receipt deleted successfuly and apdate quantity in events \n")

    res.status(202).json({

        msg: "receipt deleted successfuly and apdate quantity in events"
    
    })

})




export { user }
