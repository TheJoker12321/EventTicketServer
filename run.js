import { app, PORT } from './app.js'


app.listen(PORT, () => {

    console.log(`start running server on port: http://localhost:${PORT}`);
    
})