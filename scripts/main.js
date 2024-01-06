// Today 
const date = document.querySelector('.current__weather__date')
const city = document.querySelector('.current__weather__city')
const currentWeatherHours = document.querySelector('.current__weather__hours')
const currentWeatherTemperature = document.querySelector('.current__weather__temperature')
const weatherConditionIcon = document.querySelector('.current__weather__condition__icon')
const weatherCondition = document.querySelector('.current__weather__condition')
const windDirection = document.querySelector('.wind__direction')
const windSpeed = document.querySelector('.wind__speed')
const humidity = document.querySelector('.humidity')

// Upcoming Days
const upcomingDaysDate = document.querySelectorAll('.upcoming__days__date')
const upcomingDaysMaxTemp = document.querySelectorAll('.upcoming__days__max-temp')
const upcomingDaysMinTemp = document.querySelectorAll('.upcoming__days__min-temp')
const upcomingDaysConditionIcon = document.querySelectorAll('.upcoming__days__condition__icon')
const upcomingDaysCondition = document.querySelectorAll('.upcoming__days__condition')


const temperature = document.querySelectorAll('.temperature')
const loader = document.querySelector('.loader')
const errorMessage = document.querySelector('.error-message')
const [form] = document.forms
const [search, submit] = form.elements


const DIRECTIONS = {
    'N': "North",
    'E': "East",
    'S': "South",
    'W': "West",
    'NE': "Northeast",
    'SE': "Southeast",
    'NW': "Northwest",
    'SW': "Northwest",
    'NNE': "North-Northeast",
    'NNW': "North-northwest",
    'ENE': "East-northeast",
    'ESE': "East-southeast",
    'SSE': "South-southeast",
    'SSW': "South-southwest",
    'WSW': "West-southwest",
    'WNW': "West-northwest"
}

const API_KEY = "7781024c26d94bb99ff164424233012"
const API = "https://api.weatherapi.com/v1/forecast.json"

let isDown = false;
let startX;
let scrollLeft;

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
    errorMessage.textContent = "Browser Doesn't Support Geolocation."
}

// Events
form.addEventListener('submit', e => {
    e.preventDefault()
    if (search.value) {
        submit.disabled = true
        getWeather(0, 0, search.value)
    }
})

temperature.forEach(element => {
    element.addEventListener('click', function (e) {
        toggleTemperature(e.target)
    })
})

currentWeatherHours.addEventListener('mousedown', (e) => {
    isDown = true;
    currentWeatherHours.classList.add('active');
    startX = e.pageX - currentWeatherHours.offsetLeft;
    scrollLeft = currentWeatherHours.scrollLeft;
});

currentWeatherHours.addEventListener('mouseleave', () => {
    isDown = false;
    currentWeatherHours.classList.remove('active');
});

currentWeatherHours.addEventListener('mouseup', () => {
    isDown = false;
    currentWeatherHours.classList.remove('active');
});

currentWeatherHours.addEventListener('mousemove', (e) => {
    if (!isDown) return;

    e.preventDefault();

    const x = e.pageX - currentWeatherHours.offsetLeft;
    const walk = x - startX
    currentWeatherHours.scrollLeft = scrollLeft - walk;
});

function setPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    getWeather(latitude, longitude);
}

function showError(error) {
    errorMessage.textContent = error.message
}

async function getWeather(latitude, longitude, cityName = '') {

    let query = cityName ? cityName : `${latitude},${longitude}`

    const res = await fetch(`${API}?key=${API_KEY}&q=${query}&days=3`, {
        headers: {
            "Content-Type": "application/json",
        },
    })

    const data = await res.json()

    search.value = ''
    submit.disabled = false

    if (res.ok) {

        displayCurrentWeather(data)

        let start = new Date(data.location.localtime).getHours() + 1
        start = start >= 24 ? 0 : start

        displayHours(data.forecast.forecastday, start)

        displayUpcomingDays(data.forecast.forecastday.slice(1))

        loader.classList.add('hide')

        return;
    }
    errorMessage.textContent = 'City not found'
    setTimeout(() => { errorMessage.textContent = '' }, 2000)
}
function displayHours(days, start) {
    for (let i = 0; i < 2; i++) {
        for (let j = start; j < days[i].hour.length && currentWeatherHours.children.length < 24; j++) {
            let hour = document.createElement('div')
            hour.className = "hour"
            hour.innerHTML = `<div
                    class="bg-body-secondary rounded shadow p-2 d-flex flex-column align-items-center justify-content-center gap-3"
                >
                <span >${days[i].hour[j].time.split` `[1]}</span>
                <div>
                    <img src="${days[i].hour[j].condition.icon}" loading="lazy" />
                </div>
                <div>
                    <h5 class="m-0 temperature" data-temp="${days[i].hour[j].temp_f}&#xb0;F" onclick="toggleTemperature(this)">${days[i].hour[j].temp_c}&#xb0;C</h5>
                </div>
            </div>`
            currentWeatherHours.append(hour)
        }
        start = 0;
    }
}

function getCurrentDate(currentDate) {
    let date = new Date(currentDate);
    let daynumber = date.toLocaleString('en-us', { day: 'numeric' });
    let dayname = date.toLocaleString('en-us', { weekday: 'long' });
    let monthname = date.toLocaleString('en-us', { month: 'long' });

    return `${dayname} ${daynumber} ${monthname}`
}

function displayCurrentWeather({ location, current }) {
    date.textContent = getCurrentDate(location.localtime)
    city.textContent = `${location.name}, ${location.country}`
    currentWeatherTemperature.innerHTML = `${current.temp_c}&#xb0;C`
    currentWeatherTemperature.dataset.temp = `${current.temp_f}&#xb0;F`
    weatherCondition.textContent = current.condition.text
    weatherConditionIcon.setAttribute('src', current.condition.icon)
    weatherConditionIcon.setAttribute('alt', current.condition.text)
    windDirection.textContent = DIRECTIONS[current.wind_dir]
    windSpeed.textContent = `${current.wind_kph}km/h`
    humidity.textContent = `${current.humidity}%`
}

function displayUpcomingDays(weather) {
    weather.forEach(({ day, date }, index) => {
        upcomingDaysConditionIcon[index].setAttribute('src', day.condition.icon,)
        upcomingDaysConditionIcon[index].setAttribute('alt', day.condition.text)
        upcomingDaysDate[index].textContent = getCurrentDate(date)
        upcomingDaysMaxTemp[index].innerHTML = `${day.maxtemp_c}&#xb0;C`
        upcomingDaysMaxTemp[index].dataset.temp = `${day.maxtemp_f}&#xb0;F`
        upcomingDaysMinTemp[index].innerHTML = `${day.mintemp_c}&#xb0;C`
        upcomingDaysMinTemp[index].dataset.temp = `${day.mintemp_f}&#xb0;F`
        upcomingDaysCondition[index].textContent = day.condition.text
    })
}

function toggleTemperature(element) {
    let tmp = element.innerHTML
    element.innerHTML = element.dataset.temp
    element.dataset.temp = tmp;
}