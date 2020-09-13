const API_KEY = 'T3xnpBcDG90dkVHCH9j9hFh5ggU8ScnQbEgAHR1s'
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`

// Change this if you need to
const previousWeatherToggle = document.querySelector('.show-previous-weather');
const previousWeather = document.querySelector('.previous-weather');

const currentSolElement = document.querySelector('[data-current-sol]');
const currentDateElement = document.querySelector('[data-current-date]');
const currentTempHighElement = document.querySelector('[data-current-temp-high]');
const currentTempLowElement = document.querySelector('[data-current-temp-low]');
const windSpeedElement = document.querySelector('[data-wind-speed]');
const windDirectionText = document.querySelector('[data-wind-direction-text]');
const windDirectionArrow = document.querySelector('[data-wind-direction-arrow]');

previousWeatherToggle.addEventListener('click', () => {
  previousWeather.classList.toggle('show-weather');
})

let selectedSolIndex;

getWeather().then(sols => {
  console.log(sols);
  selectedSolIndex = sols.length - 1;
  displaySelectedSol(sols);
});

function displaySelectedSol(sols) {
  const selectedSol = sols[selectedSolIndex];
  // console.log(selectedSol);
  currentSolElement.innerText = selectedSol.sol;
  currentDateElement.innerText = selectedSol.date;
  currentTempHighElement.innerText = selectedSol.maxTemp;
  currentTempLowElement.innerText = selectedSol.minTemp;
  windSpeedElement.innerText = selectedSol.windSpeed;

  windDirectionArrow.style.setProperty('--direction', `${selectedSol.windDirectionDegrees}deg`);

  windDirectionText.innerText = selectedSol.windDirectionCardinal;
}

function getWeather() {
  return fetch(API_URL)
    .then(res => res.json())
    .then(data => {

      const {
        sol_keys,
        validity_checks,
        ...solData
      } = data;

      // console.log(data);
      // console.log(solData);

      // https://api.nasa.gov/assets/insight/InSight%20Weather%20API%20Documentation.pdf
      // (°F for AT; m/s for HWS; Pa for PRE) TODO: Need to do conversion later...
      // AT: atmospheric temperature
      // HWS: horizontal wind speed. av: average
      // WD: wind direction
      // First_UTC: Time of first datum
      // const temp = Object.entries(solData).map(([sol, data]) => ({ // [sol, data] is the [key value] set of the entry
      return Object.entries(solData).map(([sol, data]) => ({ // [sol, data] is the [key value] set of the entry
        sol: sol,
        maxTemp: data.AT.mx,
        minTemp: data.AT.mn,
        windSpeed: data.HWS ? data.HWS.av : 0,
        windDirectionDegrees: data.WD.most_common? data.WD.most_common.compass_degrees : 0,
        windDirectionCardinal: data.WD.most_common? data.WD.most_common.compass_point : '',
        date: new Date(data.First_UTC)
      }))
      // console.log(temp);
    })
}

