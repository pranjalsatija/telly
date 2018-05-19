# telly
An unopinionated Typescript service that makes it easy to add phone number authentication to your app.

## What is telly?
telly is a simple, host-it-yourself API that lets you add phone number authentication to your app. It exposes 2 API routes that let you start authentication (request a code), and finish it (verify the code). It's designed to be simple, modular, and flexible so that it integrates easily with the rest of your backend.

telly uses Twilio to send SMS messages to the user's phone, and Firebase's Realtime DB to store verification codes while the user completes verification. If a user is successfully verified, telly generates an auth token that you can then use with your service. All 3 of these components are pluggable, meaning you can easily replace Twilio with your own SMS provider, use a different solution for storing codes between the start and end of the authentication cycle, and (most importantly), provide custom logic for token generation upon successful authentication. You don't need to know anything about Twilio or Firebase to use telly; you just need to provide an account SID and auth token for Twilio, and a database URL and service account file for Firebase (see the docs for more).

## How can I use telly?
### Cloning
To start, you'll need to clone the repo and fetch the NPM packages:
```
cd someDirectory
git clone https://github.com/pranjalsatija/telly
cd telly
npm install
```

### Setup
Then, create a `.env` file and place it in the root of the cloned directory. Your `.env` will need to contain the following keys:
* `FIREBASE_DB_URL`: The URL for your Firebase Realtime Database. If you don't have one yet, you can follow [this link](https://firebase.google.com/docs/database/) to get one set up.
* `FIREBASE_SERVICE_ACCOUNT`: The path to your [service account file](https://firebase.google.com/docs/admin/setup) from Firebase.
* `PORT`: The port number you want telly to serve on.
* `SERVICE_NAME`: The name of the app or website you're making. telly uses this to format SMS messages to users: *Your verification code for <SERVICE_NAME> is XXXXXX.*
* `TWILIO_PHONE_NUMBER`: The Twilio phone number you want telly to use to send SMS messages. If you haven't used Twilio before, you can follow [this link](https://www.twilio.com/docs/sms/quickstart) to get set up with an account. It doesn't matter what language you choose in the quickstart because you don't have to write any of your own Twilio code. You just need a working Twilio phone number, account SID, and auth token.
* `TWILIO_SID`: Your Twilio account SID.
* `TWILIO_TOKEN`: Your Twilio auth token.

### Deployment
It's up to you to deploy telly however you want. You can use the hosting provider of your choice, but I recommend AWS Elastic Beanstalk. It's easy to set up, load balance, and auto scale. It also supports SSL at the load balancer level until telly supports it on its own.

### Usage
Usage is pretty simple. For brevity, we'll assume that you've hosted your telly server at `mytellyserver.com`.
* To send a code to a user, send a `POST` request to `mytellyserver.com/auth/start`. The request should contain a JSON body with a `phone_number` key. You don't need to validate or standardize this number yourself. telly uses the [Twilio Format Lookup API](https://www.twilio.com/lookup) to automatically ensure that phone numbers are valid and convert them to the E164 format before storing them in your Firebase database. This ensures that inconsistent formatting doesn't lead to errors. If an invalid phone number is provided, you'll get a 404 response with an error message.
* To verify a code that a user entered, send a `POST` request to `mytellyserver.com/auth/finish`. The request should contain a JSON body with `phone_number` and `verification_code` keys. The phone number should be the number you want to verify, and the verification code should be the code the user entered. telly will convert the phone number to E164, find the most recent verification code sent to that number, and check if it matches. If it does, a token will be generated and returned in the response. If not, an appropriate error will be returned. Once a verification code is used, it is deleted from the database, so don't rely on telly for accurate logs of when users have signed up or logged in.
* To resend a code, just send another `POST` to the `start` endpoint. When you call `finish`, telly only checks the most recently sent code, so all old codes are automatically invalidated. In the near future, telly will support token expiration so that old tokens will become invalid after a period of time.

### Customization
telly comes with a `util.ts` file that contains code for core logic like standardizing phone numbers, sending SMS messages, generating tokens, etc. You can easily customize how telly works by modifying or replacing the declarations in util.ts. Most of the functionality is pretty self explanatory, but here's some rudimentary documentation:
* `standardizePhoneNumber()`: Responsible for taking a phone number in any arbitrary format and standardizing it. This is required so that variations in how a phone number is formatted don't lead to lookup errors. For example, 1234567890, 123-456-7890, (123)-456-7890, and 123.456.7890 are all the same phone number, but each is formatted differently. `standardizePhoneNumber()` is responsible for converting all of those representations into one consistent representation that can be used for database queries. By default, `standardizePhoneNumber()` uses the free [Twilio Format Lookup API](https://www.twilio.com/lookup) to convert numbers to the E164 format, but your implementation is free to use any format. Just remember that inconsistent standardization will lead to errors when users authenticate. If a number is invalid, you should throw an error from this function.
* `sendSMS()`: Responsible for taking a phone number and a message, and sending the provided message to the phone number. By default, `sendSMS()` uses Twilio's SMS API to send messages.
* `createVerificationCode()`: Responsible for creating a verification code that a user can use to verify their phone number. This function should also save the verification code somewhere so that `getVerificationCode()` can retrieve it later. By default, this function uses the `randomstring` NPM package to generate a 6 digit numerical code, and it saves it in Firebase under the `/verificationCodes` tree.
* `deleteAllVerificationCodes()`: Responsible for deleting all the verification codes that have been issued to a specified phone number.
* `generateToken()`: Responsible for generating an auth token that users can use with your service. By default, this function uses the Firebase Admin API to generate a JWT that can be used for Firebase Custom Auth.
* `getVerificationCode()`: Responsible for getting the verification code issued to a specific phone number. In some cases, multiple codes may have been issues to a specific number. For security and practicality reasons, this function should return the last one that was issued.

## What's next?
- [X] Make it easier to "plug" the phone number validation, SMS sending, and verification code storage functionality.
- [ ] Add SSL to telly so that all connections are forcibly established over HTTPS.
- [ ] Add rate limiting so that developers can control how often the same user can request a code.
- [X] Add customizable code generation.
- [ ] Add token expiration so that tokens automatically become invalid after a certain time.
- [ ] Add support for custom SMS bodies.
