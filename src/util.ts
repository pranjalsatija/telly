
import * as firebase from "firebase-admin";
import * as randomstring from "randomstring";
import * as twilio from "./twilio";

export let standardizePhoneNumber = twilio.standardizePhoneNumber;
export let sendSMS = twilio.sendSMS;

export async function createVerificationCode(phoneNumber: string): Promise<string> {
    const verificationCode: string = randomstring.generate({
        charset: "numeric",
        length: 6,
    });

    return new Promise<string>((fulfill, reject) => {
        firebase.database().ref("/verificationCodes").push({
            issued_at: firebase.database.ServerValue.TIMESTAMP,
            phone_number: phoneNumber,
            verification_code: verificationCode,
        }, (error) => {
            (error != null) ? reject(error) : fulfill(verificationCode);
        });
    });
}

export function deleteAllVerificationCodes(phoneNumber: string) {
    const verificationCodes = firebase.database().ref("/verificationCodes");
    verificationCodes.orderByChild("phone_number").equalTo(phoneNumber).once("value", (snapshot) => {
        snapshot.forEach((child) => {
            if (child.key) {
                verificationCodes.child(child.key).remove();
            }

            return false;
        });
    });
}

export async function generateToken(phoneNumber: string): Promise<any> {
    return await firebase.auth().createCustomToken(phoneNumber);
}

export async function getVerificationCode(phoneNumber: string): Promise<string> {
    return new Promise<string>((fulfill, reject) => {
        const verificationCodesRef = firebase.database().ref("/verificationCodes");
        verificationCodesRef.orderByChild("phone_number").equalTo(phoneNumber).once("value", (snapshot) => {
            if (snapshot.val() == null) {
                reject({
                    code: 404,
                    message: "There are no verification codes for this phone number. Call `/auth/start` first.",
                });
            } else {
                const verificationCodes: any[] = [];
                snapshot.forEach((verificationCode) => {
                    verificationCodes.push(verificationCode.val());
                    return false;
                });

                fulfill(verificationCodes[verificationCodes.length - 1].verification_code);
            }
        });
    });
}
