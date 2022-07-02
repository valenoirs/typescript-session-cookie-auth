import config from './config/config'
import express, {Express, Request, Response} from 'express'
import { connect } from 'mongoose'
import helmet from 'helmet'
import morgan from 'morgan'
import { createStream } from 'rotating-file-stream'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import path from 'path'

// Add user property to express session
// declare module 'express-session' {
//     interface SessionData {
//         user?: any;
//     }
// }

// Import Routes
import { router as userRoute } from './routes/user.route'

// Init
const app: Express = express()
const port = config.PORT
const accessLogStream = createStream(`access.log`, {
    interval: '1d',
    path: path.join(__dirname, 'log')
})

// Connect to database
connect(process.env.MONGO_URI!)
.then(() => {
    console.log('[server]: OK! successfully-connected-to-mongodb')
})
.catch(error => {
    console.error('[server]: ERR! failed-connecting-to-mongo-database', error)
})

// Initialize MongoStore
const store = MongoStore.create({
    mongoUrl: config.MONGO_URI,
    collectionName: config.SESSION_COLLECTION_NAME
})

// Middleware
app.use(morgan('combined', {
    stream: accessLogStream
}))
app.use(helmet())
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// Session
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
     saveUninitialized: true,
     store,
     cookie: {
        maxAge: config.SESSION_LIFETIME
     }
}))

// HTTP Routes
app.use('/api/v1/user/', userRoute)

// Ping
app.get('/ping', (req: Request, res: Response) => {
    console.log(`[server]: OK! ${req.headers.host} pinging the server`)
    return res.status(200).send({
        success:true,
        status: 200,
        data: {
            message: 'valenoirs',
        }
    })
})

// 404
app.use('/', (req: Request, res: Response) => {
    console.log(`[server]: ERR! ${req.headers.host} 404 path`)
    return res.status(404).send({
        error: true,
        status: 404,
        type: 'NotFound',
        data: {
            message: 'No API endpoint found.'
        }
    })
})

// Server
app.listen(port, (): void => {
    console.log(`[server]: OK! server running at port ${port}`)
})