const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const STOCKS = [
  {symbol:'AAPL',name:'苹果',logo:'🍎'},
  {symbol:'META',name:'Meta',logo:'Ⓜ️'},
  {symbol:'GOOGL',name:'谷歌',logo:'🔍'}
];

async function fetchQuotes() {
  const symbols = STOCKS.map(s=>s.symbol).join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.quoteResponse.result;
  } catch {
    // fallback: try via corsproxy
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    const data = await res.json();
    return data.quoteResponse.result;
  }
}

function render(quotes) {
  const now = new Date().toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'});
  let cards = '';
  for (const s of STOCKS) {
    const q = quotes.find(x=>x.symbol===s.symbol);
    if (!q) continue;
    const chg = q.regularMarketChange||0;
    const chgPct = q.regularMarketChangePercent||0;
    const cls = chg>=0?'up':'down';
    const sign = chg>=0?'+':'';
    cards += `<div class="card">
      <div class="top"><span class="name">${s.logo} ${s.name}</span><span class="symbol">${s.symbol}</span></div>
      <div class="price">$${q.regularMarketPrice.toFixed(2)}</div>
      <div class="change ${cls}">${sign}${chg.toFixed(2)} (${sign}${chgPct.toFixed(2)}%)</div>
      <div class="row"><span>开盘 $${(q.regularMarketOpen||0).toFixed(2)}</span><span>最高 $${(q.regularMarketDayHigh||0).toFixed(2)}</span><span>最低 $${(q.regularMarketDayLow||0).toFixed(2)}</span></div>
    </div>`;
  }
  document.getElementById('app').innerHTML = `
    <div class="header"><h1>📈 股票行情</h1><div class="time">更新于 ${now}</div></div>
    <div class="cards">${cards}</div>
    <button class="refresh" onclick="init()">🔄 刷新</button>`;
}

function showError(msg) {
  document.getElementById('app').innerHTML = `<div class="error"><p>${msg}</p><button onclick="init()">重试</button></div>`;
}

async function init() {
  document.getElementById('app').innerHTML = '<div class="loading">📈 获取行情中...</div>';
  try {
    const quotes = await fetchQuotes();
    render(quotes);
  } catch(e) {
    showError('获取行情失败，请检查网络');
  }
}

init();
