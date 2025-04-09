import { includeHTML } from './include.js';
import Chart from 'chart.js/auto';

includeHTML("/partials/header.html", "header");
includeHTML("/partials/footer.html", "footer");

const API_KEY = import.meta.env.VITE_CURRENCY_API_KEY;

const tripSelect = document.getElementById("trip-select");
const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const totalEl = document.getElementById("expense-total");
const categoryFilter = document.getElementById("filter-category");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let exchangeRates = {};
let currentTrip = JSON.parse(localStorage.getItem("currentTrip")) || null;

// 🧠 Trip Info Helpers
function getTripLength(trip) {
  if (!trip || !trip.startDate || !trip.endDate) return 1;
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diff);
}

function getTravelerCount(trip) {
  return (trip?.travelers && trip.travelers > 0) ? trip.travelers : 1;
}

// 💱 Fetch Exchange Rates
async function fetchExchangeRates() {
  try {
    const res = await fetch(`https://api.currencyfreaks.com/latest?apikey=${API_KEY}&symbols=USD,EUR,JPY,GBP`);
    const data = await res.json();
    exchangeRates = {
      USD: 1,
      EUR: parseFloat(data.rates.EUR),
      JPY: parseFloat(data.rates.JPY),
      GBP: parseFloat(data.rates.GBP),
    };
  } catch (err) {
    console.error("Currency fetch error:", err);
    exchangeRates = { USD: 1, EUR: 1.1, JPY: 0.0067, GBP: 1.3 };
  }
}

// 🧠 Load Trips into Dropdown
function loadTripDropdown() {
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  tripSelect.innerHTML = `<option value="">-- Select a Trip --</option>`;

  trips.forEach((trip, index) => {
    const option = document.createElement("option");
    option.value = trip.name;
    option.textContent = trip.name;
    if (currentTrip?.name === trip.name) {
      option.selected = true;
    }
    tripSelect.appendChild(option);
  });

  if (currentTrip?.name) {
    filterExpensesByTrip(currentTrip.name);
  }
}

// ➕ Add New Expense
form.addEventListener("submit", e => {
  e.preventDefault();
  const name = form["expense-name"].value.trim();
  const amount = parseFloat(form["expense-amount"].value);
  const currency = form["expense-currency"].value;
  const category = form["expense-category"].value;
  const frequency = form["expense-frequency"].value;

  if (!name || isNaN(amount) || !currentTrip?.name) return;

  const expense = {
    name,
    amount,
    currency,
    category,
    frequency,
    tripName: currentTrip.name,
    date: new Date().toISOString()
  };

  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  form.reset();
  renderExpenses();
  renderChart();
});

categoryFilter.addEventListener("change", renderExpenses);
tripSelect.addEventListener("change", (e) => {
  const selected = e.target.value;
  const allTrips = JSON.parse(localStorage.getItem("trips")) || [];
  currentTrip = allTrips.find(t => t.name === selected) || null;
  localStorage.setItem("currentTrip", JSON.stringify(currentTrip));
  renderExpenses();
  renderChart();
});

// 💵 Calculate Value per Expense
function calculateExpenseValue(expense) {
  const base = convertToUSD(expense.amount, expense.currency);
  if (expense.frequency === "per-person") {
    return base * getTravelerCount(currentTrip);
  } else if (expense.frequency === "daily") {
    return base * getTripLength(currentTrip);
  } else {
    return base;
  }
}

// 🔁 Render Expense List
function renderExpenses() {
  list.innerHTML = "";
  let total = 0;

  const filtered = categoryFilter.value === "All"
    ? expenses
    : expenses.filter(e => e.category === categoryFilter.value);

  const tripExpenses = currentTrip?.name
    ? filtered.filter(e => e.tripName === currentTrip.name)
    : [];

  tripExpenses.forEach((expense, i) => {
    const base = convertToUSD(expense.amount, expense.currency);
    const days = getTripLength(currentTrip);
    const people = getTravelerCount(currentTrip);

    let multiplier = 1;
    let breakdown = "";

    if (expense.frequency === "daily") {
      multiplier = days;
      breakdown = `(${expense.amount} x ${days} days = ${(base * days).toFixed(2)} USD)`;
    } else if (expense.frequency === "per-person") {
      multiplier = people;
      breakdown = `(${expense.amount} x ${people} people = ${(base * people).toFixed(2)} USD)`;
    } else {
      breakdown = `(${expense.amount} once = ${base.toFixed(2)} USD)`;
    }

    if (expense.frequency === "daily" && people > 1) {
      multiplier = days * people;
      breakdown = `(${expense.amount} x ${people} people x ${days} days = ${(base * people * days).toFixed(2)} USD)`;
    }

    const displayTotal = (base * multiplier).toFixed(2);
    total += parseFloat(displayTotal);

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${expense.name}</strong> - ${expense.currency} ${expense.amount.toFixed(2)}
        <span class="tag">${expense.category}</span>
        <div class="expense-breakdown small-text">${breakdown}</div>
      </div>
      <button class="btn-sm danger" data-index="${i}">✕</button>
    `;
    list.appendChild(li);
  });

  // Remove logic
  list.querySelectorAll(".btn-sm.danger").forEach(btn => {
    btn.addEventListener("click", () => {
      const actualIndex = expenses.findIndex(
        e => e.name === tripExpenses[btn.dataset.index].name &&
             e.date === tripExpenses[btn.dataset.index].date
      );
      if (actualIndex !== -1) {
        expenses.splice(actualIndex, 1);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        renderExpenses();
        renderChart();
      }
    });
  });

  totalEl.textContent = total.toFixed(2);
}


// 🔁 USD Conversion
function convertToUSD(amount, currency) {
  const rate = exchangeRates[currency] || 1;
  return amount / rate;
}

// 📊 Chart
function renderChart() {
  const ctx = document.getElementById("expense-chart");
  const categoryTotals = {};

  const tripExpenses = currentTrip?.name
    ? expenses.filter(e => e.tripName === currentTrip.name)
    : [];

  tripExpenses.forEach(e => {
    const value = calculateExpenseValue(e);
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + value;
  });

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: "Expenses by Category",
      data: Object.values(categoryTotals),
      backgroundColor: [
        "#006d77", "#83c5be", "#e29578", "#ffddd2", "#edf6f9", "#999"
      ],
    }]
  };

  if (window.expenseChart) window.expenseChart.destroy();
  window.expenseChart = new Chart(ctx, {
    type: "pie",
    data: chartData
  });
}

// Export
document.getElementById("export-csv").addEventListener("click", () => {
  const headers = "Name,Amount,Currency,Category,Frequency,Trip,Date\n";
  const rows = expenses.map(e =>
    `${e.name},${e.amount},${e.currency},${e.category},${e.frequency},${e.tripName},${e.date}`
  ).join("\n");
  const blob = new Blob([headers + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();
});

document.getElementById("export-pdf").addEventListener("click", () => {
  window.print();
});

await fetchExchangeRates();
loadTripDropdown();
renderExpenses();
renderChart();
