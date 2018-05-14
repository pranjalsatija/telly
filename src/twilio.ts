
import * as twilio from "twilio";

let lookupsClient: twilio.LookupsClient;
let smsClient: twilio.RestClient;

export function authenticate() {
    lookupsClient = new twilio.LookupsClient(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    smsClient = new twilio.RestClient(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

export async function standardizePhoneNumber(phoneNumber: string): Promise<any> {
    return new Promise((fulfill, reject) => {
        lookupsClient.phoneNumbers(phoneNumber).get((error, response) => {
            if (error != null && error.status === 404) {
                reject(`Invalid phone number: ${phoneNumber}.`);
            } else if (response.phone_number != null) {
                const standardizedNumber = response.phone_number;
                fulfill(standardizedNumber);
            } else {
                reject(error);
            }
        });
    });
}

export async function sendSMS(phoneNumber: string, message: string) {
    await smsClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
    });
}
