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

const previousSolTemplate = document.querySelector('[data-previous-sol-template]');
const previousSolContainer = document.querySelector('[data-previous-sols]');

const unitToggle = document.querySelector('[data-unit-toggle]');
const metricRadio = document.getElementById('cel');
const imperialRadio = document.getElementById('fah');

previousWeatherToggle.addEventListener('click', () => {
  previousWeather.classList.toggle('show-weather');
})

let selectedSolIndex;

getWeather().then(sols => {
  console.log(sols);
  selectedSolIndex = sols.length - 1;
  // TODO: Will change later but for now I want data for the .wind section
  // selectedSolIndex = 0;

  displaySelectedSol(sols);
  displayPreviousSols(sols);
  updateUnits();

  unitToggle.addEventListener('click', () => {
    // let metricUnits = !metricRadio.checked;
    let metricUnits = !isMetric();
    metricRadio.checked = metricUnits;
    imperialRadio.checked = !metricUnits;
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();

/*    // Don't to have use the above, the following will do.
    // And don't need to change imperialRadio.checked because they belong to the same radio button group.
    metricRadio.checked = !metricRadio.checked;*/
  });

  metricRadio.addEventListener('change', () => {
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();
  });
  imperialRadio.addEventListener('change', () => {
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();
  });
});

function displaySelectedSol(sols) {
  const selectedSol = sols[selectedSolIndex];
  // console.log(selectedSol);
  currentSolElement.innerText = selectedSol.sol;
  currentDateElement.innerText = displayDate(selectedSol.date);
  currentTempHighElement.innerText = displayTemperature(selectedSol.maxTemp);
  currentTempLowElement.innerText = displayTemperature(selectedSol.minTemp);
  windSpeedElement.innerText = displaySpeed(selectedSol.windSpeed);
  windDirectionArrow.style.setProperty('--direction', `${selectedSol.windDirectionDegrees}deg`);
  windDirectionText.innerText = selectedSol.windDirectionCardinal;
}

function displayPreviousSols(sols) {
  previousSolContainer.innerHTML = '';
  sols.forEach((solData, index) => {
    const solContainer = previousSolTemplate.content.cloneNode(true);
    solContainer.querySelector('[data-sol]').innerText = solData.sol;
    solContainer.querySelector('[data-date]').innerText = displayDate(solData.date);
    solContainer.querySelector('[data-temp-high]').innerText = displayTemperature(solData.maxTemp);
    solContainer.querySelector('[data-temp-low]').innerText = displayTemperature(solData.minTemp);
    solContainer.querySelector('[data-select-button]').addEventListener('click', () => {
      selectedSolIndex = index;
      displaySelectedSol(sols);
    });

    previousSolContainer.appendChild(solContainer);
  });
}

function displayDate(date) {
  // The first param is the locale or language you want to use,
  // or use undefined, which will take info base on user's browser and what default they set
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
  return date.toLocaleString(
    undefined,
    {day: 'numeric', month: 'long'}
  )
}

function displayTemperature(temperature) {
  let returnTemp = temperature;
  if(!isMetric()) {
    returnTemp = (temperature * 9/5) + 32;
  }
  return Math.round(returnTemp);
}

function displaySpeed(speed) {
  let returnSpeed = speed;
  if(!isMetric()) {
    returnSpeed = speed / 1.609;
  }
  return Math.round(returnSpeed);
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

      console.log(data);
      // console.log(solData);

      // https://api.nasa.gov/assets/insight/InSight%20Weather%20API%20Documentation.pdf
      // (°F for AT; m/s for HWS; Pa for PRE)
      // AT: atmospheric temperature (32°F − 32) × 5/9 = 0°C
      // HWS: horizontal wind speed. av: average. 1m/s = 3.6k/h. Keep in mind we are switching between kph and mph; Not kph and m/s
      // WD: wind direction
      // First_UTC: Time of first datum
      // const temp = Object.entries(solData).map(([sol, data]) => ({ // [sol, data] is the [key value] set of the entry
      return Object.entries(solData).map(([sol, data]) => ({ // [sol, data] is the [key value] set of the entry
        sol: sol,
        maxTemp: (data.AT.mx - 32) * 5/9,
        minTemp: (data.AT.mn - 32) * 5/9,
        windSpeed: data.HWS ? data.HWS.av * 3.6 : 0,
        windDirectionDegrees: data.WD.most_common? data.WD.most_common.compass_degrees : 0,
        windDirectionCardinal: data.WD.most_common? data.WD.most_common.compass_point : '',
        date: new Date(data.First_UTC)
      }))
      // console.log(temp);
    })
}

function updateUnits() {
  const speedUnits = document.querySelectorAll('[data-speed-unit]')
  const tempUnits = document.querySelectorAll('[data-temp-unit]')
  speedUnits.forEach(unit => {
    unit.innerHTML = isMetric() ? 'kph': 'mph'
  })
  tempUnits.forEach(unit => {
    unit.innerHTML = isMetric() ? 'C': 'F'
  })
}

function isMetric() {
  return metricRadio.checked;
}
