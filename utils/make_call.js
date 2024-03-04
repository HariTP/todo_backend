const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const make_call = async (phone_no) => { 
    try {
        await client.calls.create({
            url: 'http://demo.twilio.com/docs/voice.xml',
            to: phone_no,
            from: process.env.TWILIO_PHONE
        });
        const wait = async () => {
            setTimeout(async () => {
            const list = await client.calls.list({limit: 1})
            if (list[0].status == "queued" || list[0].status == "ringing") {
                wait();
            } else {
                return list[0];
            }
            }, 1000);
        }
        wait();
    } catch (error) {
        console.error("Error making call:", error);
    }
}
module.exports = make_call;