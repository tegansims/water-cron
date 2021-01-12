var CronJob = require("cron").CronJob;
require("dotenv").config();
const axios = require("axios").default;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const gifLimit = 50;

const gifSearchTermArray = [
  "Drink water",
  "Drink more water",
  "So thirsty",
  "Stay hydrated",
];

const messageArray = [
  ...gifSearchTermArray,
  "Drink up, chap",
  "Don't get parched",
  "Is it droughty in your mouthy",
  "Bottoms up",
  "Cheers",
  "Down the hatch",
  "Chin chin",
  "Salut",
  "Prost",
  "Get it down yer, lad",
  "Neck it",
  "Don't make mom mad, drink some more, you old cad"
];
const randomiser = (array) => array[Math.floor(Math.random() * array.length)];
const randomGifObject = () => Math.floor(gifLimit * Math.random());

const sendSMS = (gifUrl, message) =>
  client.messages
    .create({
      body: `Tegan says "${message}!" ${gifUrl}`, // Twilio cannot send MMS (mediaUrl) to UK numbers
      from: process.env.TWILIO_FROM,
      to: process.env.TWILIO_TO,
    })
    .then((message) => console.log("message errorCode: ", message.errorCode))
    .catch((err) => console.log({ err }));

const getRandomisedGIF = async () => {
  try {
    const randomSearchTerm = randomiser(gifSearchTermArray);
    const url = `https://api.giphy.com/v1/gifs/search?q=${randomSearchTerm}&limit=${gifLimit}&api_key=${process.env.API_KEY}`;
    const imageUrl = await axios(url).then(
      (resp) => resp.data.data[randomGifObject()].images.original.url
    );
    return imageUrl;
  } catch (err) {
    console.log({ err });
  }
};

const job = new CronJob(
    "0 0 9-17 * * 1-5",
//   "*/5 * * * * *",
  async () => {
    console.log("Starting ", new Date());
    const gif = await getRandomisedGIF();
    const messageToSend = randomiser(messageArray);
    console.log("Gif ", new Date(), messageToSend, gif);
    await sendSMS(gif, messageToSend);
    console.log("--------------------------");
  }
);

job.start();
