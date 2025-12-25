import { readJsonFile } from "../utils/readFile.js";

const PATH = './data/users.json'



/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */

async function checkUniqueUsername(req, res, next) {

    const username = req.body.username

    const users = await readJsonFile(PATH)
    const findUser = users.find(userObj => userObj.username === username)

    if (findUser) {

        return res.status(404).json({
            error: 'username already exists'
        })

    }

    next() 

}

export { checkUniqueUsername }