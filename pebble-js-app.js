/* jshint -W097 */
'use strict';

var API_KEY = 'REPLACE ME WITH YOUR REAL API KEY';

var Pebble = Pebble || {};
var options = {
  'hourmode': '1'
};
var forceweather = 'no';
var locationid_before_config;
var locationstring_before_config;
var weather_provider_before_config;
var windunit_before_config;
var last_coord_lat;
var last_coord_long;
var last_location;
var last_weather_update;
var current_coord_lat;
var current_coord_long;
var dict = {};


var interval = setInterval(stayAlive, 300000);



function stayAlive() {
  console.log("Trying to stay alive...");
}


function locationSuccess(pos) {

  current_coord_lat = (pos.coords.latitude).toFixed(2);
  current_coord_long = (pos.coords.longitude).toFixed(2);

  getForecastIOWeather();
}

function openWeatherToYahooIconId(id) {
  // https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2

  // the original map is from the Yahoo API, long since dead. Some
  // documentation here: https://gist.github.com/bzerangue/805520
  if (id == 800) { // clear
    return 32;
  } else if (id >= 500 && id < 600) { // rain, ignores some specific things like 511 freezing rain
    return 12;
  } else if (id >= 600 && id < 700) { // snow/sleet
    return 16;
  } else if (id >= 700 && id < 800) { // fog/haze
    return 20;
  } else if (id >= 803 && id < 900) { // cloudy
    return 26;
  } else if (id >= 800 && id < 803) { // partly cloudy
    return 30;
  } else { // unknown
    return 48;
  }
}

function getForecastIOWeather() {
  console.log("*openweathermap*");
  var today = new Date();
  var yyyy = today.getFullYear();
  var mm = today.getMonth() + 1;
  var dd = today.getDate();
  var hh = today.getHours();
  var mmm = ('0' + today.getMinutes()).slice(-2);
  var url;

  var units = (options.tempformat === 'yes') ? 'imperial' : 'metric';


  if (options.locationstring) {
    url = 'https://api.openweathermap.org/data/3.0/onecall?lat=' + options.locationlat + '&lon=' + options.locationlon + '&units=' + units + '&exclude=minutely,hourly,alerts&appid=' + API_KEY;
    // console.log("Forecast.io using custom location");
  } else {
    url = 'https://api.openweathermap.org/data/3.0/onecall?lat=' + current_coord_lat + '&lon=' + current_coord_long + '&units=' + units + '&exclude=minutely,hourly,alerts&appid=' + API_KEY;
    // console.log("Forecast.io using GPS");
  }

  //  console.log(url);

  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var json = JSON.parse(this.responseText);
    //  console.log(JSON.stringify(json, null, 4));

    var temperature = parseInt(Math.round(json.current.temp));
    var icon_code = json.current.weather[0].id;

    var forecast_high = parseInt(Math.round(json.daily[0].temp.max));
    var forecast_low = parseInt(Math.round(json.daily[0].temp.min));
    var forecast_id_code = json.daily[0].weather[0].id;

    var windspeed = parseInt(Math.round(json.current.wind_speed));
    var winddirection = parseInt(json.current.wind_deg);
    var windchill = parseInt(Math.round(json.current.feels_like));
    var baropressure = parseInt(Math.round(json.current.pressure));
    var humidity = parseInt(json.current.humidity);
    var icon;
    var forecast_id;
    var sunrise_human;
    var sunset_human;
    var human_sunrise_hour_24;
    var human_sunset_hour_24;
    var human_sunrise_hour_12;
    var human_sunset_hour_12;

    icon = openWeatherToYahooIconId(icon_code);
    forecast_id = openWeatherToYahooIconId(forecast_id_code);

    var cardinal;
    var direction;
    if (winddirection > 11.25 && winddirection < 56.25) {
      cardinal = "NE";
      direction = 1;
    } else if (winddirection > 56.25 && winddirection < 101.25) {
      cardinal = "E";
      direction = 2;
    } else if (winddirection > 101.25 && winddirection < 146.25) {
      cardinal = "SE";
      direction = 3;
    } else if (winddirection > 146.25 && winddirection < 191.25) {
      cardinal = "S";
      direction = 4;
    } else if (winddirection > 191.25 && winddirection < 236.25) {
      cardinal = "SW";
      direction = 5;
    } else if (winddirection > 236.25 && winddirection < 281.25) {
      cardinal = "W";
      direction = 6;
    } else if (winddirection > 281.25 && winddirection < 326.25) {
      cardinal = "NW";
      direction = 7;
    } else {
      cardinal = "N";
      direction = 0;
    }



    // var sunrise = parseInt(json.daily[0].sunrise);
    // var sunset = parseInt(json.daily[0].sunset);

    var timeoffset = today.getTimezoneOffset();
    // console.log('offset is ' + timeoffset);

    var sunrise_seconds = parseInt(json.daily[0].sunrise);
    var sunset_seconds = parseInt(json.daily[0].sunset);

    var sunrise = new Date(sunrise_seconds * 1000);
    var sunset = new Date(sunset_seconds * 1000);

    var pubdate = parseInt(json.current.dt);
    var datumnu = Date.now();

    options.weatherupdate = yyyy + '/' + mm + '/' + dd + ' ' + hh + ':' + mmm;
    // options.locationtext = locationtext;
    options.weatherdate = pubdate;


    // console.log('JS: Now: ' + today + ', Sunrise: ' + sunrise_seconds + ', Sunset:' + sunset_seconds);



    if (options.hourmode) {

      if (options.ingennolla == 'yes') {
        sunrise_human = String(sunrise.getHours()) + ('0' + sunrise.getMinutes()).slice(-2);
        sunset_human = String(sunset.getHours()) + ('0' + sunset.getMinutes()).slice(-2);
      } else {
        sunrise_human = ('0' + sunrise.getHours()).slice(-2) + ('0' + sunrise.getMinutes()).slice(-2);
        sunset_human = ('0' + sunset.getHours()).slice(-2) + ('0' + sunset.getMinutes()).slice(-2);
      }

    } else {

      human_sunrise_hour_24 = parseInt(sunrise.getHours());
      human_sunset_hour_24 = parseInt(sunset.getHours());


      if (human_sunrise_hour_24 > 12) {
        human_sunrise_hour_12 = human_sunrise_hour_24 - 12;
      } else {
        human_sunrise_hour_12 = human_sunrise_hour_24;
      }

      if (human_sunset_hour_24 > 12) {
        human_sunset_hour_12 = human_sunset_hour_24 - 12;
      } else {
        human_sunset_hour_12 = human_sunset_hour_24;
      }

      if (options.ingennolla == 'yes') {
        sunrise_human = String(human_sunrise_hour_12) + ('0' + sunrise.getMinutes()).slice(-2);
        sunset_human = String(human_sunset_hour_12) + ('0' + sunset.getMinutes()).slice(-2);
      } else {
        sunrise_human = ('0' + human_sunrise_hour_12).slice(-2) + ('0' + sunrise.getMinutes()).slice(-2);
        sunset_human = ('0' + human_sunset_hour_12).slice(-2) + ('0' + sunset.getMinutes()).slice(-2);
      }

    }


    localStorage.setItem('JS_WEATHERUPDATE', options.weatherupdate);
    localStorage.setItem('JS_WEATHERDATE', options.weatherdate);
    localStorage.setItem('JS_LOCATIONTEXT', options.locationtext);
    localStorage.setItem('JS_LASTWEATHERUPDATESTAMP', datumnu);
    last_weather_update = datumnu;

    var dictionary = {
      'KEY_WEATHERID': icon,
      'KEY_TEMPERATURE': temperature,
      'KEY_FORECAST_ID': forecast_id,
      'KEY_FORECAST_HIGH': forecast_high,
      'KEY_FORECAST_LOW': forecast_low,
      'KEY_PRESSURE': String(baropressure),
      'KEY_HUMIDITY': String(humidity),
      'KEY_WINDSPEED': String(windspeed),
      'KEY_WINDDIRECTION': direction,
      'KEY_WINDCHILL': windchill,
      'KEY_SUNRISE': sunrise_seconds,
      'KEY_SUNRISE_HUMAN': sunrise_human,
      'KEY_SUNSET': sunset_seconds,
      'KEY_SUNSET_HUMAN': sunset_human,
      'KEY_TIMEOFFSET': parseInt(timeoffset),
      'KEY_WEATHERPROVIDER': 'forecastio'
    };

    // console.log(JSON.stringify(dictionary, null, 4));

    // Send to Pebble MessageQueue.sendAppMessage
    Pebble.sendAppMessage(dictionary,
      function (e) {
        console.log('Weather sent to Pebble with success', e);
      },
      function (e) {
        console.log('Error sending weather info to Pebble!', e);
      }
    );
  };
  xhr.open('GET', url);
  xhr.send();
}




function locationError(e) {
  // console.log('Error requesting location! Using old if available.', e);
  if (last_location) {
    //  console.log('Using last location instead of GPS.');
    getForecastIOWeather();
  } else {
    //  console.log('No recent location available.');
  }
}

// Get Location lat+lon
function getLocation() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {
      timeout: 10000,
      maximumAge: Infinity
    }
  );
}

Pebble.addEventListener('showConfiguration', function () {
  console.log('Showing config');
  if (Pebble.getActiveWatchInfo) {
    var info = Pebble.getActiveWatchInfo();
    options.model = info.platform;
    //console.log('Pebble hardware: ' + info.platform);
  } else {
    options.model = 'aplite';
  }

  //Load the remote config page
  var location;
  if (options.model === 'chalk') {
    location = 'http://christianliljeberg.se/pebble/dintime/settings/264/settings_chalk.html?';
  } else {
    location = 'http://christianliljeberg.se/pebble/dintime/settings/264/settings_aplite_basalt.html?';
  }

  //console.log(location + encodeURIComponent(JSON.stringify(options)));
  Pebble.openURL(location + encodeURIComponent(JSON.stringify(options)));
});


Pebble.addEventListener('webviewclosed', function (e) {
  console.log('configuration closed');
  //webview closed
  // console.log(decodeURIComponent(e.response));

  if (e.response.length > 5) {
    options = JSON.parse(decodeURIComponent(e.response));
    // console.log('Options = ' + JSON.stringify(options));
    // console.log('Location before config = ' + locationstring_before_config);

    if ((locationid_before_config !== options.locationid) || (locationstring_before_config !== options.locationstring) || (weather_provider_before_config !== options.defaultWeatherProvider) || (windunit_before_config !== options.windunit)) {
      //  console.log("Forcing weather update from JS");
      forceweather = 'yes';
    } else {
      //   console.log("Weather provider did not change.");
      forceweather = 'no';
    }

    if (!options.locationstring) {
      options.locationlat = "";
      options.locationlon = "";
    }

    var updatetid = parseInt(options.vadertid) * 60;

    if (!options.tema) {
      options.tema = '1451';
    }

    var fixad_bgcol = (options.bakgrundsfarg || '#0000FF').replace('#', '0x');
    var fixad_timecol = (options.timfarg || '#FFFFFF').replace('#', '0x');
    var fixad_minutcol = (options.minutfarg || '#FFFFFF').replace('#', '0x');

    var fixad_tempcol = (options.tempfarg || '#FFFFFF').replace('#', '0x');
    var fixad_boxcol = (options.boxfarg || '#FFFFFF').replace('#', '0x');
    var fixad_boxlinecol = (options.boxlinjefarg || '#FFFFFF').replace('#', '0x');
    var fixad_daycol = (options.dagfarg).replace('#', '0x');
    var fixad_datecol = (options.datumfarg || '#FFFFFF').replace('#', '0x');
    var fixad_dateboxcol = (options.datumboxfarg || '#FFFFFF').replace('#', '0x');
    var fixad_powercol = (options.powerfarg || '#FFFFFF').replace('#', '0x');
    var fixad_bticoncol = (options.bticonfarg || '#0000FF').replace('#', '0x');
    var fixad_btboxcol = (options.btboxfarg || '#FF0000').replace('#', '0x');
    var fixad_secscol = (options.sekfarg || '#FFFFFF').replace('#', '0x');
    var fixad_timebgcol = (options.tidbakgrundsfarg || '#0000FF').replace('#', '0x');
    var fixad_iconcol = (options.ikonfarg || '#FFFFFF').replace('#', '0x');

    var fixad_popupbackcol = (options.popupbackfarg || '#000000').replace('#', '0x');
    var fixad_popuplinescol = (options.popuplinesfarg || '#FFFFFF').replace('#', '0x');
    var fixad_popupfrontcol = (options.popupfrontfarg || '#FFFFFF').replace('#', '0x');




    if (options.model !== 'aplite') {
      dict = {
        'KEY_PREF_BATTSTYLE': parseInt(options.batteristil),
        'KEY_PREF_SHOWBATTERY': options.showBattery,
        //'KEY_PREF_SHOWBORDER': options.showBorder,
        'KEY_PREF_HIDEBT': options.bluetooth,
        'KEY_PREF_CHIME': parseInt(options.chime),
        'KEY_PREF_UPDATEINTERVAL': parseInt(updatetid),
        'KEY_PREF_BTBUZZ': options.btbuzz,
        'KEY_PREF_HIDEWEATHER': options.vader,
        'KEY_TEMP_FORMAT_F': options.tempformat,
        'KEY_PREF_HIDEDATE': options.datum,
        'KEY_PREF_NOZERO': options.ingennolla,
        'KEY_PREF_DATE_YYMMDD': options.yymmdd,
        'KEY_PREF_LANG': parseInt(options.sprak),
        'KEY_PREF_FLIPPED': options.flipped,
        'KEY_PREF_INVERT': options.inverted,
        'KEY_PREF_THEME': parseInt(options.tema),
        'KEY_PREF_SECONDS': options.sekunder,
        'KEY_PREF_SIMPLEICONS': options.enklaikoner,
        'KEY_QUIET_START': parseInt(options.quietmodestart),
        'KEY_QUIET_END': parseInt(options.quietmodeend),
        'KEY_FORCEW': forceweather,
        'KEY_PREF_USEOVERLAY': options.useoverlay,
        'KEY_PREF_USEHEALTH': options.usehealth,
        'KEY_BGCOL': parseInt(fixad_bgcol),
        'KEY_TIMECOL': parseInt(fixad_timecol),
        'KEY_MINUTECOL': parseInt(fixad_minutcol),
        'KEY_TEMPCOL': parseInt(fixad_tempcol),
        'KEY_DATECOL': parseInt(fixad_datecol),
        'KEY_DAYCOL': parseInt(fixad_daycol),
        'KEY_DATEBOXCOL': parseInt(fixad_dateboxcol),
        'KEY_LINECOL': parseInt(fixad_boxlinecol),
        'KEY_BOXCOL': parseInt(fixad_boxcol),
        'KEY_BTICNCOL': parseInt(fixad_bticoncol),
        'KEY_BTBOXCOL': parseInt(fixad_btboxcol),
        'KEY_POWERCOL': parseInt(fixad_powercol),
        'KEY_SECSCOL': parseInt(fixad_secscol),
        'KEY_TIMEBGCOL': parseInt(fixad_timebgcol),
        'KEY_ICONCOL': parseInt(fixad_iconcol),
        'KEY_POPUPBACKCOL': parseInt(fixad_popupbackcol),
        'KEY_POPUPFRONTCOL': parseInt(fixad_popupfrontcol),
        'KEY_POPUPLINESCOL': parseInt(fixad_popuplinescol)
      };
    } else {
      // Prepare Aplite AppMessage payload
      dict = {
        'KEY_PREF_BATTSTYLE': parseInt(options.batteristil),
        'KEY_PREF_SHOWBATTERY': options.showBattery,
        //'KEY_PREF_SHOWBORDER': options.showBorder,
        'KEY_PREF_HIDEBT': options.bluetooth,
        'KEY_PREF_CHIME': parseInt(options.chime),
        'KEY_PREF_UPDATEINTERVAL': parseInt(updatetid),
        'KEY_PREF_BTBUZZ': options.btbuzz,
        'KEY_PREF_HIDEWEATHER': options.vader,
        'KEY_TEMP_FORMAT_F': options.tempformat,
        'KEY_PREF_HIDEDATE': options.datum,
        'KEY_PREF_NOZERO': options.ingennolla,
        'KEY_PREF_DATE_YYMMDD': options.yymmdd,
        'KEY_PREF_LANG': parseInt(options.sprak),
        'KEY_PREF_FLIPPED': options.flipped,
        'KEY_PREF_INVERT': options.inverted,
        'KEY_PREF_THEME': parseInt(options.tema),
        'KEY_PREF_SECONDS': options.sekunder,
        'KEY_PREF_SIMPLEICONS': options.enklaikoner,
        'KEY_QUIET_START': parseInt(options.quietmodestart),
        'KEY_QUIET_END': parseInt(options.quietmodeend),
        'KEY_FORCEW': forceweather,
        'KEY_PREF_USEOVERLAY': options.useoverlay
      };
    }

    //console.log(JSON.stringify(dict, null, 4));

    //Send to Pebble
    Pebble.sendAppMessage(dict,
      function () {
        console.log('Sending settings data...');
      },
      function (e) {
        console.log('Settings feedback failed!', e);
      }
    );
    saveLocalData(options);
  } else {
    console.log('Cancelled');
  }
});

function saveLocalData(options) {
  localStorage.setItem('KEY_PREF_BATTSTYLE', options.batteristil);
  localStorage.setItem('KEY_PREF_SHOWBATTERY', options.showBattery);
  localStorage.setItem('KEY_PREF_SHOWBORDER', options.showBorder);
  localStorage.setItem('KEY_PREF_HIDEBT', options.bluetooth);
  localStorage.setItem('KEY_PREF_BTBUZZ', options.btbuzz);
  localStorage.setItem('KEY_PREF_CHIME', options.chime);
  localStorage.setItem('KEY_PREF_UPDATEINTERVAL', options.vadertid);
  localStorage.setItem('KEY_PREF_HIDEWEATHER', options.vader);
  localStorage.setItem('JS_TEMPFORMAT', options.tempformat);
  localStorage.setItem('KEY_PREF_HIDEDATE', options.datum);
  localStorage.setItem('KEY_PREF_NOZERO', options.ingennolla);
  localStorage.setItem('KEY_PREF_DATE_YYMMDD', options.yymmdd);
  localStorage.setItem('KEY_PREF_LANG', options.sprak);
  localStorage.setItem('KEY_PREF_FLIPPED', options.flipped);
  localStorage.setItem('KEY_PREF_INVERT', options.inverted);
  localStorage.setItem('KEY_PREF_THEME', options.tema);
  localStorage.setItem('KEY_PREF_SECONDS', options.sekunder);
  localStorage.setItem('KEY_PREF_SIMPLEICONS', options.enklaikoner);

  localStorage.setItem('KEY_QUIET', options.quietmode);
  localStorage.setItem('KEY_QUIET_START', options.quietmodestart);
  localStorage.setItem('KEY_QUIET_END', options.quietmodeend);

  localStorage.setItem('JS_BGCOL', options.bakgrundsfarg);
  localStorage.setItem('JS_TIMECOL', options.timfarg);
  localStorage.setItem('JS_MINUTECOL', options.minutfarg);
  localStorage.setItem('JS_TEMPCOL', options.tempfarg);
  localStorage.setItem('JS_BOXCOL', options.boxfarg);
  localStorage.setItem('JS_BOXLINECOL', options.boxlinjefarg);
  localStorage.setItem('JS_DATECOL', options.datumfarg);
  localStorage.setItem('JS_DAYCOL', options.dagfarg);
  localStorage.setItem('JS_DATEBOXCOL', options.datumboxfarg);
  localStorage.setItem('JS_POWERCOL', options.powerfarg);
  localStorage.setItem('JS_BTICONCOL', options.bticonfarg);
  localStorage.setItem('JS_BTBOXCOL', options.btboxfarg);
  localStorage.setItem('JS_BTSECSCOL', options.sekfarg);
  localStorage.setItem('JS_TIMEBGCOL', options.tidbakgrundsfarg);
  localStorage.setItem('JS_ICONCOL', options.ikonfarg);
  localStorage.setItem('JS_POPUPFRONTCOL', options.popupfrontfarg);
  localStorage.setItem('JS_POPUPBACKCOL', options.popupbackfarg);
  localStorage.setItem('JS_POPUPLINESCOL', options.popuplinesfarg);


  localStorage.setItem('JS_LOCATION', options.locationid);
  localStorage.setItem('JS_USEDEFAULTWEATHERPROVIDER', options.defaultWeatherProvider);
  localStorage.setItem('JS_FORECASTIOKEY', options.forecastiokey);
  localStorage.setItem('JS_SELECTEDLAT', options.locationlat);
  localStorage.setItem('JS_SELECTEDLON', options.locationlon);
  localStorage.setItem('JS_SELECTEDLON', options.locationlon);
  localStorage.setItem('JS_LOCATIONSTRING', options.locationstring);
  localStorage.setItem('KEY_USEOVERLAY', options.useoverlay);
  localStorage.setItem('KEY_USEHEALTH', options.usehealth);
  localStorage.setItem('JS_WINDUNIT', options.windunit);

  // localStorage.setItem('JS_WEATHERPROVIDERTEXT', weatherprovidertext);



  loadLocalData();
}

function loadLocalData() {
  options.batteristil = localStorage.getItem('KEY_PREF_BATTSTYLE') || '1';
  options.showBattery = localStorage.getItem('KEY_PREF_SHOWBATTERY') || 'yes';
  options.showBorder = localStorage.getItem('KEY_PREF_SHOWBORDER') || 'yes';
  options.bluetooth = localStorage.getItem('KEY_PREF_HIDEBT') || 'no';
  options.btbuzz = localStorage.getItem('KEY_PREF_BTBUZZ') || 'no';
  options.chime = localStorage.getItem('KEY_PREF_CHIME') || '0';
  options.vadertid = localStorage.getItem('KEY_PREF_UPDATEINTERVAL') || '30';
  options.vader = localStorage.getItem('KEY_PREF_HIDEWEATHER') || 'no';
  options.tempformat = localStorage.getItem('JS_TEMPFORMAT') || 'yes';
  options.datum = localStorage.getItem('KEY_PREF_HIDEDATE') || 'no';
  options.ingennolla = localStorage.getItem('KEY_PREF_NOZERO') || 'no';
  options.yymmdd = localStorage.getItem('KEY_PREF_DATE_YYMMDD') || 'no';
  options.sprak = localStorage.getItem('KEY_PREF_LANG') || '0';
  options.flipped = localStorage.getItem('KEY_PREF_FLIPPED') || 'no';
  options.inverted = localStorage.getItem('KEY_PREF_INVERT') || 'no';
  options.tema = localStorage.getItem('KEY_PREF_THEME') || '1451';
  options.sekunder = localStorage.getItem('KEY_PREF_SECONDS') || 'no';
  options.enklaikoner = localStorage.getItem('KEY_PREF_SIMPLEICONS') || 'no';
  options.quietmode = localStorage.getItem('KEY_QUIET') || 'no';
  options.quietmodestart = localStorage.getItem('KEY_QUIET_START') || '0';
  options.quietmodeend = localStorage.getItem('KEY_QUIET_END') || '0';
  options.weatherdate = localStorage.getItem('JS_WEATHERDATE');
  options.weatherupdate = localStorage.getItem('JS_WEATHERUPDATE');
  options.locationtext = localStorage.getItem('JS_LOCATIONTEXT');
  options.locationid = localStorage.getItem('JS_LOCATION');


  locationid_before_config = localStorage.getItem('JS_LOCATION');
  last_location = localStorage.getItem('JS_LASTLOCATION');
  last_coord_lat = localStorage.getItem('JS_LASTLAT');
  last_coord_long = localStorage.getItem('JS_LASTLONG');
  last_weather_update = localStorage.getItem('JS_LASTWEATHERUPDATESTAMP');


  options.defaultWeatherProvider = localStorage.getItem('JS_USEDEFAULTWEATHERPROVIDER');
  weather_provider_before_config = options.defaultWeatherProvider;

  //  weatherprovidertext = localStorage.getItem('JS_WEATHERPROVIDERTEXT');

  options.forecastiokey = localStorage.getItem('JS_FORECASTIOKEY');
  options.locationlat = localStorage.getItem('JS_SELECTEDLAT') || '0';
  options.locationlon = localStorage.getItem('JS_SELECTEDLON') || '0';
  options.locationstring = localStorage.getItem('JS_LOCATIONSTRING');
  locationstring_before_config = options.locationstring;
  options.useoverlay = localStorage.getItem('KEY_USEOVERLAY') || 'yes';
  options.usehealth = localStorage.getItem('KEY_USEHEALTH') || 'yes';
  options.windunit = localStorage.getItem('JS_WINDUNIT');
  windunit_before_config = options.windunit;


  if (options.vadertid < 15) {
    options.vadertid = 15;
  }

  options.quietmode = (options.quietmodestart === options.quietmodeend) ? 'no' : 'yes';

  if ((options.model !== 'aplite') || (options.model !== 'diorite')) {
    options.bakgrundsfarg = localStorage.getItem('JS_BGCOL') || '#0000FF';
    options.timfarg = localStorage.getItem('JS_TIMECOL') || '#FFFFFF';
    options.minutfarg = localStorage.getItem('JS_MINUTECOL') || '#FFFFFF';
    options.tempfarg = localStorage.getItem('JS_TEMPCOL') || '#FFFFFF';
    options.boxfarg = localStorage.getItem('JS_BOXCOL') || '#0000FF';
    options.boxlinjefarg = localStorage.getItem('JS_BOXLINECOL') || '#FFFFFF';
    options.datumfarg = localStorage.getItem('JS_DATECOL') || '#000000';
    options.dagfarg = localStorage.getItem('JS_DAYCOL') || '#FFFFFF';
    options.datumboxfarg = localStorage.getItem('JS_DATEBOXCOL') || '#FFFFFF';
    options.powerfarg = localStorage.getItem('JS_POWERCOL') || '#FFFFFF';
    options.bticonfarg = localStorage.getItem('JS_BTICONCOL') || '#0000FF';
    options.btboxfarg = localStorage.getItem('JS_BTBOXCOL') || '#FF0000';
    options.sekfarg = localStorage.getItem('JS_BTSECSCOL') || '#FFFFFF';
    options.tidbakgrundsfarg = localStorage.getItem('JS_TIMEBGCOL') || '#0000FF';
    options.ikonfarg = localStorage.getItem('JS_ICONCOL') || '#FFFFFF';
    options.ikonfarg = localStorage.getItem('JS_ICONCOL') || '#FFFFFF';
    options.popupfrontfarg = localStorage.getItem('JS_POPUPFRONTCOL') || '#FFFFFF';
    options.popupbackfarg = localStorage.getItem('JS_POPUPBACKCOL') || '#000000';
    options.popuplinesfarg = localStorage.getItem('JS_POPUPLINESCOL') || '#FFFFFF';
  }
}


Pebble.addEventListener('ready', function () {
  console.log('PebbleKit JS ready!');
  if (Pebble.getActiveWatchInfo) {
    // Available.
    var info = Pebble.getActiveWatchInfo();
    options.model = info.platform;
    console.log('Pebble hardware: ' + info.platform);
  } else {
    options.model = 'aplite';
  }
  loadLocalData();
  Pebble.sendAppMessage({ 'KEY_JSREADY': 1 });
});

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage', function (e) {
  console.log('AppMessage received!');

  options.hourmode = e.payload.KEY_HOURMODE;
  //console.log(JSON.stringify(e.payload));

  if (options.locationstring) {
    getForecastIOWeather();
  } else {
    getLocation();
  }
});
