# telly
An unopinionated Typescript service that makes it easy to add phone number authentication to your app.

## What is telly?
Telly is a simple, host-it-yourself API that lets you add phone number authentication to your app. It exposes 2 API routes that let you start authentication (request a code), and finish it (verify the code). It's designed to be simple, modular, and flexible so that it integrates easily with the rest of your backend.

Telly uses Twilio to send SMS messages to the user's phone, and Firebase's Realtime DB to store verification codes while the user completes verification. If a user is successfully verified, telly generates an auth token that you can then use with your service. All 3 of these components are pluggable, meaning you can easily replace Twilio with your own SMS provider, use a different solution for storing codes between the start and end of the authentication cycle, and (most importantly), provide custom logic for token generation upon successful authentication. You don't need to know anything about Twilio or Firebase to use Telly; you just need to provide an account SID and auth token for Twilio, and a database URL and service account file for Firebase (see the docs for more).

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
For now, customizing telly as mentioned above isn't that easy. I'll be updating it soon so that you can really easily replace the logic for phone number related tasks, database storage and retrieval, and token generation. When I do, this section will be updated.

## What's next?
- [ ] Make it easier to "plug" the phone number validation, SMS sending, and verification code storage functionality.
- [ ] Add SSL to telly so that all connections are forcibly established over HTTPS.
- [ ] Add rate limiting so that developers can control how often the same user can request a code.
- [ ] Add customizable code generation.
- [ ] Add token expiration so that tokens automatically become invalid after a certain time.
- [ ] Add support for custom SMS bodies.
