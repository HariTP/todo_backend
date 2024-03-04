const task = require('../models/tasks');
const user = require('../models/users');
const setPriority = require('./setPriority');
const cron = require('node-cron');
const make_call = require('./make_call');

let updatePriority = cron.schedule('* * * * *', async () => {
    const alltasks = await task.find({});
    if (!alltasks.length) {
        updatePriority.stop();
        updatePriority.start();
    }
    for (let i=0; i<alltasks.length; i++) {
        if (alltasks[i].deleted_at==null) {
            await task.findOneAndUpdate({id: alltasks[i].id}, {priority: setPriority(alltasks[i].due_date)});
        }
    }
});

let twilio_call = cron.schedule('* * * * *', async () => {
    try {
        const alltasks = await task.find({});
        if (!alltasks.length) {
            twilio_call.stop();
            twilio_call.start();
        }
    
        alldefaulters = [];
        for (let i=0; i<alltasks.length; i++) {
            if (alltasks[i].deleted_at==null && alltasks[i].due_date < new Date() && alltasks[i].status != "DONE") {
                const defaulter =  await user.findOne({user_id: alltasks[i].user_id});
                if (defaulter) {
                    alldefaulters.push(defaulter);
                }
            }
        } 
    
        //Sort the alldefaulters bsed on priority
        alldefaulters.sort((a, b) => a.priority - b.priority);

        if (!alldefaulters.length) {
            console.log("no defaulters");
            twilio_call.stop();
            twilio_call.start();
        }
        for (let i=0; i<alldefaulters.length; i++) {
            const phone_no = "+91" + alldefaulters[i].phone;
            let status;
            (async () => {
                const temp_status = await make_call(phone_no);
                if (temp_status) {
                    status = temp_status;
                }
                })();
            if (status=="completed" || status=="in_progress") {
                twilio_call.stop();
                twilio_call.start();
            }
        }
    } catch (err) {
        console.log("twilio_call error: ",err);
    }
})

module.exports = {
    updatePriority,
    twilio_call
};