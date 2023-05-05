# DIN Time Pebble - OpenWeatherMap

This is a mod of the fantastic DIN Time Pebble watchface by Christian Liljeberg.
He has long since moved on to Fitbit (I don't blame him) but here I am,
steadfastly using my Time Steel and waiting for something better than a Pebble
to arrive (hasn't happened yet!).

## Installation

1. Download the DIN Time pbw [from the Rebble store](https://apps.rebble.io/en_US/application/54f9cb9ecf945829e8000048?dev_settings=true&native=false)
2. Edit `pebble-js-app.js` in this repo with a valid `API_KEY` from your
   [OpenWeatherMap API keys page](https://home.openweathermap.org/api_keys).
3. Edit the .pbw file with 7zip or similar (it's just a .zip file) and replace
   pebble-js-app.js with the one you just edited
4. Save the .pbw to your phone and sideload it. You may need to use the
   [Rebble Sideload Helper](https://play.google.com/store/apps/details?id=io.rebble.charon)
   on Android.
5. Rejoice, for you have weather once again.

### Technical details

I nuked the Yahoo stuff, and made `getForecastIOWeather` grab data from
OpenWeatherMap instead. Roughly mapped weather icons (see
`openWeatherToYahooIconId`), open a PR if there's an edge case that could be
better handled. The compiled part of the app uses the Yahoo IDs, which are
documented [here](https://gist.github.com/bzerangue/805520)

`testRig.html` is a tiny little html file that just loads up some test data to
make sure the API works. Uncomment the final console.log in
`getForecastIOWeather` and you should see sane looking data.
