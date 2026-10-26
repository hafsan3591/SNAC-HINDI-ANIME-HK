// anime-data.js — SNAC ANIME Default Database

const DEFAULT_TELEGRAM = "https://t.me/SNAC_hindi_anime";

const animeList = [
  {
  "id": "q",
  "title": "The Summer Hikaru Died",
  "titleBn": "The Summer Hikaru Died",
  "genre": [
    "Horror",
    "Mystery",
    "Psychological",
    "Supernatural",
    "Drama"
  ],
  "year": 2024,
  "language": "Hindi Dubbed",
  "status": "Ongoing",
  "rating": 8.1,
  "trending": false,
  "latest": true,
  "poster": "https://i.ibb.co/yF2M3vPj/6c1c0a618a99.jpg",
  "description": "একই গ্রামে বেড়ে ওঠা দুই প্রিয় বন্ধুর একজন পাহাড়ে হারিয়ে যাওয়ার পর ফিরে এলেও, রহস্যময় সেই রূপান্তরের পেছনে লুকিয়ে থাকা এক ভয়াল ও পরাবাস্তব সত্তাকে আবিষ্কার করে অপর বন্ধু এক শিহরণ জাগানো বাস্তবতার মুখোমুখি হয়।",
  "telegramUrl": "https://t.me/SNAC_hindi_anime/283"
}
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { animeList, DEFAULT_TELEGRAM };
}