const API_KEY = '1c3e4098aaa37b6d14de75e6b071fd01';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loader = document.getElementById('loader');
const error = document.getElementById('error');
const weatherInfo = document.getElementById('weatherInfo');
const toggleBtn = document.getElementById('toggleBtn');

let isCelsius = true;
let currentTemp = 0;
let currentFeelsLike = 0;

window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            () => {
                fetchWeatherByCity('London');
            }
        );
    } else {
        fetchWeatherByCity('London');
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
        }
    }
});

toggleBtn.addEventListener('click', () => {
    isCelsius = !isCelsius;
    toggleBtn.textContent = isCelsius ? 'Switch to °F' : 'Switch to °C';
    updateTemperatureDisplay();
});

async function fetchWeatherByCity(city) {
    showLoader();
    try {
        const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        displayWeather(data);
        fetchForecast(city);
    } catch (err) {
        showError('City not found. Please try again.');
    }
}

async function fetchWeatherByCoords(lat, lon) {
    showLoader();
    try {
        const response = await fetch(`${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Unable to fetch weather');
        const data = await response.json();
        displayWeather(data);
        fetchForecast(data.name);
    } catch (err) {
        showError('Unable to fetch weather data.');
    }
}

async function fetchForecast(city) {
    try {
        const response = await fetch(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Forecast not available');
        const data = await response.json();
        displayForecast(data);
    } catch (err) {
        console.error('Forecast error:', err);
    }
}

function displayWeather(data) {
    currentTemp = data.main.temp;
    currentFeelsLike = data.main.feels_like;

    document.getElementById('cityName').textContent = data.name;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;

    updateTemperatureDisplay();
    updateBackground(data.weather[0].main.toLowerCase());
    hideLoader();
    weatherInfo.style.display = 'block';
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather">
            <div class="forecast-temp">${temp}°C</div>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

function updateTemperatureDisplay() {
    const temp = isCelsius ? currentTemp : (currentTemp * 9/5) + 32;
    const feels = isCelsius ? currentFeelsLike : (currentFeelsLike * 9/5) + 32;
    const unit = isCelsius ? '°C' : '°F';

    document.getElementById('temperature').textContent = `${Math.round(temp)}${unit}`;
    document.getElementById('feelsLike').textContent = `${Math.round(feels)}${unit}`;
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('en-US', options);
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('dateTime').textContent = `${date} | ${time}`;
}

function updateBackground(weather) {
    document.body.className = '';
    if (weather.includes('clear')) {
        document.body.classList.add('clear');
    } else if (weather.includes('cloud')) {
        document.body.classList.add('clouds');
    } else if (weather.includes('rain') || weather.includes('drizzle')) {
        document.body.classList.add('rain');
    } else {
        document.body.classList.add('default');
    }
}

function showLoader() {
    loader.style.display = 'block';
    weatherInfo.style.display = 'none';
    error.style.display = 'none';
}

function hideLoader() {
    loader.style.display = 'none';
}

function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
    weatherInfo.style.display = 'none';
    hideLoader();
}
