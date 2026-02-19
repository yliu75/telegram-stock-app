const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

async function init() {
  document.getElementById('app').innerHTML = '<div class="loading">📈 获取行情中...</div>';
  try {
    const res = await fetch('stocks.json?' + Date.now());
    const data = await res.json();
    render(data);
  } catch(e) {
    document.getElementById('app').innerHTML = '<div class="error"><p>获取行情失败</p><button onclick="init()">重试</button></div>';
  }
}

function render(data) {
  let cards = '';
  const logos = {AAPL:'🍎',META:'Ⓜ️',GOOGL:'🔍'};
  for (const s of data.stocks) {
    const cls = s.change >= 0 ? 'up' : 'down';
    const sign = s.change >= 0 ? '+' : '';
    cards += `<div class="card">
      <div class="top"><span class="name">${logos[s.symbol]||'📊'} ${s.name}</span><span class="symbol">${s.symbol}</span></div>
      <div class="price">$${s.price.toFixed(2)}</div>
      <div class="change ${cls}">${sign}${s.change.toFixed(2)} (${sign}${s.changePct.toFixed(2)}%)</div>
    </div>`;
  }
  document.getElementById('app').innerHTML = `
    <div class="header"><h1>📈 股票行情</h1><div class="time">更新于 ${data.updated}</div></div>
    <div class="cards">${cards}</div>
    <button class="refresh" onclick="init()">🔄 刷新</button>`;
}

init();
