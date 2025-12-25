import { readJsonFile } from "../utils/readFile.js";

const PATH = './data/users.json'


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */

async function authentication(req, res, next) {
    
    const username = req.headers["username"]
    const password = req.headers["password"]

    const users = await readJsonFile(PATH)
    const userFound = users.find(userObj => userObj.username === username && userObj.password === password)

    if (!userFound) {

        return res.status(400).json({

            error: 'user not found so you can not create or update.'
        
        })

    }

    next()

}


export { authentication }