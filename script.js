// JavaScript for app logic

// DOM references for input, button, and display areas
const input = document.getElementById('city');
const button = document.getElementById('search');
const status = document.getElementById('status');
const result = document.getElementById('result');
const place = document.getElementById('place');
const rows = document.getElementById('rows');

// Main search logic triggered on button click
button.addEventListener('click', async () => {
  const city = input.value.trim();
  if (!city) {
    status.textContent = 'Please enter a city name.';
    return;
  }

  try {
    status.textContent = 'Loading weather data...';

    // Fetch city coordinates using geocoding API
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`);
    const geo = await geoRes.json();
    if (!geo.results || geo.results.length === 0) throw new Error('City not found');

    // Select the first valid result
    const bestMatch = geo.results.find(r => r.latitude && r.longitude) || geo.results[0];
    const { latitude, longitude, name, country } = bestMatch;

    // Fetch hourly weather forecast using Open-Meteo API
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,wind_speed_10m&forecast_days=1&timezone=auto`);
    const data = await weatherRes.json();

    if (!data.hourly) throw new Error('Weather data not available');

    // Update location title
    place.textContent = `${name}, ${country}`;

    // Create array of hourly data and compute score
    const hours = data.hourly.time.map((t, i) => {
      const temp = (data.hourly.temperature_2m[i] * 9/5) + 32;
      const wind = data.hourly.wind_speed_10m[i] * 2.23694;
      const rain = data.hourly.precipitation[i];
      const score = calcScore(temp, wind, rain);
      return { time: t, temp, wind, rain, score };
    });

    // Show daytime hours only
    const dayHours = hours.slice(6, 22);
    const topScore = Math.max(...dayHours.map(h => h.score));

    // Build table rows dynamically
    rows.innerHTML = dayHours.map(h => {
      const level = h.score > 75 ? 'high' : h.score > 50 ? 'medium' : 'low';
      const time = new Date(h.time).toLocaleTimeString([], { hour: 'numeric', hour12: true });
      const highlight = h.score === topScore ? 'highlight' : '';
      return `<tr class="${highlight}">
        <td>${time}</td>
        <td>${h.temp.toFixed(0)}</td>
        <td>${h.wind.toFixed(1)}</td>
        <td>${h.rain}</td>
        <td class="score ${level}">${h.score}</td>
      </tr>`;
    }).join('');

    // Make sure at least one row is highlighted
    const highlighted = document.querySelectorAll('tr.highlight');
    if (highlighted.length === 0 && rows.firstChild) {
      rows.firstChild.classList.add('highlight');
    }

    // Display results and clear status
    result.hidden = false;
    status.textContent = '';
  } catch (err) {
    // Handle and display any error
    status.textContent = 'Error: ' + err.message;
    result.hidden = true;
  }
});

// Function to calculate comfort score based on temperature, wind, and rain
function calcScore(temp, wind, rain) {
  let score = 100 - Math.abs(60 - temp) - wind * 2 - rain * 20;
  return Math.max(0, Math.min(100, Math.round(score)));
}