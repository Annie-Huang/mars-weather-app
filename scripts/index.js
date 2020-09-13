const API_KEY = 'DEMO_KEY'
const API_URL = `https://api.nasa.gov/insight_weather/?api_key={API_KEY}&feedtype=json&ver=1.0`

// Change this if you need to
const previousWeatherToggle = document.querySelector('.show-previous-weather');
const previousWeather = document.querySelector('.previous-weather');

previousWeatherToggle.addEventListener('click', () => {
  previousWeather.classList.toggle('show-weather');
})
