import{i as d}from"./include-BTc5-h4F.js";d("/partials/header.html","header");d("/partials/footer.html","footer");document.addEventListener("DOMContentLoaded",()=>{const o=document.getElementById("expense-name"),a=document.getElementById("expense-amount"),s=document.getElementById("expense-list"),c=document.getElementById("expense-total");function l(){const n=JSON.parse(localStorage.getItem("expenses"))||[];s.innerHTML="";let t=0;n.forEach((e,r)=>{t+=parseFloat(e.amount);const m=document.createElement("li");m.textContent=`${e.name} - $${e.amount.toFixed(2)}`,s.appendChild(m)}),c.textContent=t.toFixed(2)}document.getElementById("add-expense-btn").addEventListener("click",()=>{const n=o.value.trim(),t=parseFloat(a.value);if(!n||isNaN(t))return;const e=JSON.parse(localStorage.getItem("expenses"))||[];e.push({name:n,amount:t}),localStorage.setItem("expenses",JSON.stringify(e)),o.value="",a.value="",l()}),l()});
