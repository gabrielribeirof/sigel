import { Application } from './application.js'
import { ExpressHttpServer } from './infrastructure/http/express.http-server.js'

const httpServer = new ExpressHttpServer()
new Application(httpServer)
