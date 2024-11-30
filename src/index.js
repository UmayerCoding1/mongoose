import dotenv from 'dotenv';
dotenv.config({path: './../.env'});
import connectDB from './db/index.js';
import { app } from './app.js';


connectDB()
.then(() => {

  app.on('error', (error) => {
    console.log('ERROR', error);
    throw(error)
  })


  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running at PORT${process.env.PORT}`);
  })
})
.catch(err => {
  console.log("MONGO DB connection failed !!!", err);
})

