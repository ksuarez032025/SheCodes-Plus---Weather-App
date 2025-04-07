let lastSearchedCity = "";
let lastRequestTime = 0;
const RATE_LIMIT_MS = 3000;
let debounceTimeout = null;

function refreshWeather(response) {
  let temperatureElement = document.querySelector("#temperature");
  let temperature = response.data.temperature.current;
  let cityElement = document.querySelector("#city");
  let countryElement = document.querySelector("#country");
  let descriptionElement = document.querySelector("#description");
  let humidityElement = document.querySelector("#humidity");
  let windSpeedElement = document.querySelector("#wind-speed");
  let timeElement = document.querySelector("#time");
  let date = new Date(response.data.time * 1000);
  let iconElement = document.querySelector("#icon");

  cityElement.innerHTML = response.data.city;
  countryElement.innerHTML = response.data.country;
  timeElement.innerHTML = formatDate(date);
  descriptionElement.innerHTML = response.data.condition.description;
  humidityElement.innerHTML = `${response.data.temperature.humidity}%`;
  windSpeedElement.innerHTML = `${response.data.wind.speed}mph`;
  temperatureElement.innerHTML = Math.round(temperature);
  iconElement.innerHTML = `<img src ="${response.data.condition.icon_url}"class="weather-app-icon"/>`;

  getForecast(response.data.city);
}

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

function searchCity(city) {
  const now = Date.now();

  if (city.toLowerCase() === lastSearchedCity.toLowerCase()) {
    console.log("Duplicate request avoided.");
    return;
  }

  if (now - lastRequestTime < RATE_LIMIT_MS) {
    console.log("Rate limit hit. Try again shortly.");
    return;
  }

  lastSearchedCity = city;
  lastRequestTime = now;

  let apiKey = "c3650d7d0ad3c75tcafd67c27c4o8bd0";
  let apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=imperial`;

  axios.get(apiUrl).then(refreshWeather).catch(handleApiError);

  console.log("API requested:", apiUrl);
}

function handleApiError(error) {
  if (error.response && error.response.status === 429) {
    alert("Too many requests. Please wait a few seconds and try again.");
  } else {
    console.error("API Error:", error);
  }
}

function handleSearch(event) {
  event.preventDefault();

  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    let searchInput = document.querySelector("#search-form-input");
    let city = searchInput.value.trim();

    if (city) {
      searchCity(city);
    }
  }, 500);
}

function getForecast(city) {
  let apiKey = "c3650d7d0ad3c75tcafd67c27c4o8bd0";
  let apiUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=imperial`;
  axios(apiUrl).then(displayForecast);
}

function displayForecast(response) {
  console.log(response.data);

  let days = ["Tue", "Wed", "Thu", "Fri", "Sat"];
  let forecastHtml = "";

  days.forEach(function (day) {
    forecastHtml =
      forecastHtml +
      `
      <div class="weather-forecast-day">
        <div class="weather-forecast-date">${day}</div>
        <div class="weather-forecast-icon">⛅</div>
        <div class="weather-forecast-temperatures">
          <div class="weather-forecast-temperature">
            <strong>15°</strong>
          </div>
          <div class="weather-forecast-temperature">9°</div>
        </div>
      </div>
    `;
  });

  let forecastElement = document.querySelector("#forecast");
  forecastElement.innerHTML = forecastHtml;
}

let searchFormElement = document.querySelector("#search-form");
searchFormElement.addEventListener("submit", handleSearch);

searchCity("Buffalo");
getForecast("Buffalo");
