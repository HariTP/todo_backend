require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const router = require('./routes/routes'); 
const authRouter = require('./routes/authRouter');
const authMiddleware = require('./middleware/auth');

const { updatePriority, twilio_call } = require('./utils/cron_jobs');

const connectDB = require('./config/connection');

connectDB(process.env.DB_URL);

app.use(express.json());

app.use('/api', authMiddleware);
app.use('/api',router);
app.use('/',authRouter);

updatePriority.start();
twilio_call.start();

app.listen(PORT, ()=> {
    console.log("Server active:)");
})