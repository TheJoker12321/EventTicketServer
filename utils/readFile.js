import fs from 'fs'


/**
 * 
 * @param {*} path 
 * @returns 
 */

async function readJsonFile(path) {

    const data = JSON.parse(await fs.promises.readFile(path, 'utf8'))

    return data

}


export { readJsonFile }