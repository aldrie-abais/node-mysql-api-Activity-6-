import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerDocs from './_helpers/swagger';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// CORS Configuration
const corsOrigin = process.env.CORS_ORIGIN;
// app.use(cors({
//     origin: process.env.NODE_ENV === 'production'
//         ? (corsOrigin ? corsOrigin.split(',').map((x: string) => x.trim()) : false)
//         : 'http://localhost:4200', // Explicitly allows your Angular app in development
//     credentials: true
// }));

app.use(cors({
    origin: (origin, callback) => {
        // Allow the request if it's your Vercel app
        if (!origin || origin.startsWith('https://abais-lab7-activity-angular.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// api routes
app.use('/accounts', accountsController);

// swagger docs route
app.use('/api-docs', swaggerDocs);

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));