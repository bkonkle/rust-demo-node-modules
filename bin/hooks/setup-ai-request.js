/* eslint-disable unicorn/no-anonymous-default-export, unicorn/prefer-module */
module.exports = (request, _context) => ({
  ...request,
  body: JSON.stringify({
    text: getRandomInput(),
  }),
})

function getRandomInput() {
  const inputs =
    // eslint-disable-next-line n/prefer-global/process
    process.env.USE_LONG_INPUTS === 'true' ? longInputs : shortInputs

  const randomIndex = Math.floor(Math.random() * inputs.length)

  return inputs[randomIndex] ?? ''
}

const shortInputs = [
  'will it snow in amy',
  'is it warm in botna',
  'find on dress parade',
  'show the movie times',
  'find now and forever',
  'add to the rock games',
  'play some sixties music',
  'show me movie schedules',
  'rate this textbook a zero',
  'find the work i looked up',
  'i rate secret water as a 4',
  'what film is playing nearby',
  'weather next year in canada',
  'play songs by sarah harding',
  'add this song to blues roots',
  'in one hour find king of hearts',
  'play the new noise theology e p',
  'rate this current novel 1 stars',
  'play some jungle music on iheart',
  'give 1 point to current textbook',
  'add this artist to pop 2017 picks',
  'play arif music from the fourties',
  'add karusellen to jazz brasileiro',
  'rate the current chronicle a zero',
  'will it snow in mt on june 13 2038',
  'rate lamy of santa fe 5 of 6 stars',
  'play a melody from elmer bernstein',
  'play some steve boyett chant music',
  'what s the weather here on 2/7/2021',
  'add tune to my mellow bars playlist',
  'find a video game called family dog',
  'where can i find conduct unbecoming',
  'give 1 out of 6 points to this novel',
  'find a movie called living in america',
  'please search the young warriors game',
  'what is the weather of east portal ks',
  'rate the current novel four of 6 stars',
  'make me a reservation in south carolina',
  'get the video game of the chipmunk song',
  'add strong to the metal monday playlist',
  'what movies are playing at mann theatres',
  'i rate shadow of suribachi at five stars',
  'rate the chronicle ten from tomorrow a 2',
  'is unbeatable harold at century theatres',
]

const longInputs = [
  'find worldly goods starting now at a movie house',
  'where can i purchase the tv show time for heroes',
  'add the song don t drink the water to my playlist',
  'what is the weather forecast for my current place',
  'add garry shider album to my classical essentials',
  'play the last sound track by soko from around 1975',
  'play a new symphony by perfecto de castro on lastfm',
  'show the movie schedule of animated movies close by',
  'play me a top-ten song by phil ochs on groove shark',
  'restaurant in bulgaria this week party for 9 numbers',
  'what will the weather be in berville ak on feb 6 2017',
  'please add a track to my playlist called this is coti',
  'can you add confessions to my playlist called clásica',
  'please play the newest music by evil jared hasselhoff',
  'add the da brat track to the soak up the sun playlist',
  'on june 27 2026 i d like to go to a delaware gastropub',
  'what time is beat the devil coming on at mann theatres',
  'add sabrina salerno to the grime instrumentals playlist',
  'rate the book an appeal from the new to the old whigs a 0',
  'book a table for 8 at a restaurant that serves far breton',
  'add nothing fancy to meditate to sounds of nature playlist',
  'what movie theatre is showing if the huns came to melbourne',
  'will the wind die down at my current location by supper time',
  'can you let me know what animated movies are playing close by',
  'add this tune by rod argent to propuesta alternativa playlist',
  'coon chicken inn restaurant for 1 am for me clarice and debbie',
  'rate awaiting strange gods: weird and lovecraftian fictions a 1',
  'book a table today at a steakhouse for eight that serves sashimi',
  'i want to put look to you on the playlist named 80s classic hits',
  'what will the weather be in lago vista on october fourteenth 2022',
  'can you get me reservations for a highly rated restaurant in seychelles',
  'rate cuisines of the axis of evil and other irritating states one out of 6',
  'book a spot for ten at a top-rated caucasian restaurant not far from selmer',
  'put lindsey cardinale into my hillary clinton s women s history month playlist',
  'make a reservation at a bakery that has acquacotta in central african republic for five',
  'find a reservation at a restaurant that serves gougère in laneville with a party of nine',
  'i want to bring four people to a place that s close to downtown that serves churrascaria cuisine',
  'what is the weather going to be like in klondike gold rush national historical park on february the 28th 2034',
]
