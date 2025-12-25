import express from 'express'
import { readJsonFile } from './utils/readFile.js'
import { checkUniqueUsername } from './MiddleWere/checkUsername.js'
import fs from 'fs'
import { user } from './routes/usersRoute.js'
import { event } from './routes/eventsRoute.js'

const PORT = 3001
const PATH = './data/users.json'

const app = express()
app.use(express.json())
app.use('/users', user)
app.use('/creator/events', event)


app.get('/health', (req, res) => {

    res.status(200).json({

        msg: 'The route is working'

    })

}) 



app.post('/user/register',checkUniqueUsername , async (req, res) => {

    const username = req.body.username
    const password = req.body.password
    const role = 'user'

    const users = await readJsonFile(PATH);
    users.push({

        username,
        password,
        role: req.header('admin') === '1234' ? 'admin' : role
    
    });

    await fs.promises.writeFile(PATH, JSON.stringify(users));

    res.status(201).json({

          "message": "User registered successfully" 

    })

})


export { app, PORT }