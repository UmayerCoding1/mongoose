import  express  from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    // origin: process.env.CORS_ORIGIN,
    origin: ['http://localhost:5173'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true, limit: '36kb'}));
app.use(express.static('../public/upload'));  
app.use(cookieParser());



// routes import
import userRouter from './routes/user.routes.js'
// import uploadRouter from './routes/fileUpload.routes.js';


// routes declaration
app.use('/api/users', userRouter);
// app.use('/api', uploadRouter)
export {app};
