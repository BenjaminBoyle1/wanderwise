# 🌍 WanderWise – Smart Travel Planner

WanderWise is a modern, interactive travel planning web app that helps users organize trips, track expenses, create itineraries, and view location-based weather — all in one beautiful dashboard.

Built using **Vite**, **vanilla JS**, and modular HTML/CSS structure, it’s optimized for performance, clarity, and user experience.

---

## ✨ Features

### 🗺️ Trip Dashboard
- Add new trips by clicking anywhere on the interactive Google Map
- Location is reverse geocoded to city/state/country
- Trips saved with start/end dates and number of travelers
- Custom markers on map via `AdvancedMarkerElement`

### 🧾 Expense Tracker
- Track trip-specific expenses in multiple currencies (USD, EUR, GBP, JPY)
- Set frequency: once, daily, or per person
- Smart cost calculations: shows breakdown like `($40 × 3 days × 2 travelers = $240)`
- Filter expenses by category
- Live pie chart using Chart.js
- Export to CSV or print/save as PDF

### 📅 Itinerary Builder
- Add detailed daily activities per trip
- Groups entries by date with expandable forecast
- Weather forecast displayed inline per day
- Export readable itinerary for printing or saving

### 🌦️ Weather Page
- View 3-day forecasts for any city
- Auto-suggest city names
- Geolocation support (“Use My Location”)
- Forecasts cached locally for fast reuse

---

## 🧠 Tech Stack

- ⚡ **Vite** for blazing fast dev/build
- 🗺️ **Google Maps JavaScript API** + Advanced Markers
- 💸 **CurrencyFreaks API** for exchange rates
- ☁️ **OpenWeatherMap API** for forecasts
- 📦 **LocalStorage** for persistence
- 📊 **Chart.js** for expense visualization
- ♿ Fully accessible labels, responsive layout, and dark-mode ready

---

## 🗂️ Project Structure

```
wander-wise/
├── public/
│   ├── images/
│   ├── json/
│   └── partials/             # header.html and footer.html
├── pages/
│   ├── index.html
│   ├── expenses.html
│   ├── itinerary.html
│   ├── weather.html
├── src/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── dashboard.js
│   │   ├── expenses.js
│   │   ├── itinerary.js
│   │   ├── weather.js
│   │   └── include.js
├── .env                      # API keys
├── vite.config.js
└── README.md
```

---

## 🛠️ Setup & Development

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/wander-wise.git
cd wander-wise
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API keys in a `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GOOGLE_MAP_ID=your_map_id_here
VITE_OPENWEATHER_API_KEY=your_openweather_key
VITE_CURRENCY_API_KEY=your_currencyfreaks_key
```

### 4. Start the dev server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

---

## 🌐 Deployment

Easily deployable to **Netlify**, **Vercel**, or **GitHub Pages** (with Vite static adapter).

Make sure your environment variables are set in the Netlify Dashboard (`.env` not used at runtime unless bundled with a server).

---

## 🤝 Credits

- [OpenWeatherMap](https://openweathermap.org)
- [CurrencyFreaks](https://currencyfreaks.com)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview)
- [Coolors](https://coolors.co/palette/006d77-83c5be-edf6f9-ffddd2-e29578) for the color palette

---

## 📸 Screenshots

> Add screenshots of dashboard, expenses, itinerary, and map here.

---

## 📄 License

MIT License. Use freely, build boldly. 🚀
