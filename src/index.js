let lastSearchedCity = "";
let lastRequestTime = 0;
const RATE_LIMIT_MS = 3000;
const CACHE_TTL_MS = 5 * 60 * 1000;
let debounceTimeout = null;

const weatherCache = new Map();

function formatDate(date) {
  let minutes = date.getMinutes();
  let hours = date.getHours();
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let day = days[date.getDay()];
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  return `${day} ${hours}:${minutes}`;
}

function refreshWeather(response) {
  let temperatureElement = document.querySelector("#temperature");
  let cityElement = document.querySelector("#city");
  let countryElement = document.querySelector("#country");
  let descriptionElement = document.querySelector("#description");
  let humidityElement = document.querySelector("#humidity");
  let windSpeedElement = document.querySelector("#wind-speed");
  let timeElement = document.querySelector("#time");
  let iconElement = document.querySelector("#icon");

  let temperature = response.data.temperature.current;
  let date = new Date(response.data.time * 1000);

  cityElement.innerHTML = response.data.city;
  countryElement.innerHTML = response.data.country;
  timeElement.innerHTML = formatDate(date);
  descriptionElement.innerHTML = response.data.condition.description;
  humidityElement.innerHTML = `${response.data.temperature.humidity}%`;
  windSpeedElement.innerHTML = `${response.data.wind.speed}mph`;
  temperatureElement.innerHTML = Math.round(temperature);
  iconElement.innerHTML = `<img src ="${response.data.condition.icon_url}"class="weather-app-icon"/>`;
}

function displayForecast(response) {
  const forecastElement = document.querySelector("#forecast");
  let forecastHtml = "";

  response.data.daily.forEach(function (day) {
    forecastHtml =
      forecastHtml +
      `
      <div class="weather-forecast-day">
        <div class="weather-forecast-date">Tue</div>
        <img src="${day.condition.icon_url}" class="weather-forecast-icon" />
        <div class="weather-forecast-temperatures">
          <div class="weather-forecast-temperature">
            <strong>${Math.round(day.temperature.maximum)}°</strong>
          </div>
          <div class="weather-forecast-temperature">${Math.round(
            day.temperature.minimum
          )}</div>
        </div>
      </div>
    `;
  });

  forecastElement.innerHTML = forecastHtml;
}

function handleApiError(error) {
  if (error.reponse && error.response.status === 429) {
    alert("Too many requests. Please wait a few seconds and try again.");
  } else {
    console.error("API Error:", error);
  }
}

function fetchWeatherData(city) {
  const now = Date.now();
  const cityKey = city.toLowerCase();

  if (cityKey === lastSearchedCity) {
    console.log("Duplicate request avoided.");
    return;
  }
  if (now - lastRequestTime < RATE_LIMIT_MS) {
    console.log("Rate limit hit. Try again shortly.");
    return;
  }

  lastRequestedCity = cityKey;
  lastRequestTime = now;

  if (weatherCache.has(cityKey)) {
    const cachedData = weatherCache.get(cityKey);
    if (now - cachedData.timestamp < CACHE_TTL_MS) {
      console.log("Using cached data for", city);
      refreshWeather(cachedData.current);
      displayForecast(cachedData.forecast);
      return;
    }
  }

  const apiKey = "c3650d7d0ad3c75tcafd67c27c4o8bd0";
  const currentApiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=imperial`;
  const forecastApiUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=imperial`;

  Promise.all([axios.get(currentApiUrl), axuis, get(forecastApiUrl)])
    .then(([currentRes, forecastRes]) => {
      refreshWeather(currentRes);
      displayForecast(forecastRes);

      weatherCache.set(cityKey, {
        timestamp: now,
        current: currentRes,
        forecast: forecastRes,
      });
    })
    .catch(handleApiError);
}

function handleSearch(event) {
  event.preventDefault();

  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    let searchInput = document.querySelector("#search-form-input");
    let city = searchInput.value.trim();

    if (city) {
      fetchWeatherData(city);
    }
  }, 500);
}

const searchFormElement = document.querySelector("#search-form");
searchFormElement.addEventListener("submit", handleSearch);

fetchWeatherData("Buffalo");
