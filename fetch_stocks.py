#!/usr/bin/env python3
import re, json, urllib.request, time

STOCKS = [('AAPL','NASDAQ','苹果'),('META','NASDAQ','Meta'),('GOOGL','NASDAQ','谷歌')]

def fetch(sym, exch):
    url = f'https://www.google.com/finance/quote/{sym}:{exch}'
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=15).read().decode()
    price = float(re.search(r'data-last-price="([^"]+)"', html).group(1))
    idx = html.find('data-last-price')
    snippet = html[idx:idx+2000]
    pcts = re.findall(r'([\-+]?\d+\.\d+)%', snippet)
    vals = re.findall(r'>([\-+]\d+\.\d+)<', snippet)
    chg = float(vals[0]) if vals else 0
    pct = float(pcts[0]) if pcts else 0
    if chg < 0: pct = -abs(pct)
    return {'symbol':sym,'name':'','price':price,'change':chg,'changePct':pct}

results = []
for sym, exch, name in STOCKS:
    try:
        q = fetch(sym, exch)
        q['name'] = name
        results.append(q)
    except Exception as e:
        print(f'Error {sym}: {e}')

data = {'stocks':results,'updated':time.strftime('%Y-%m-%d %H:%M',time.localtime())}
out = '/Users/htec/.openclaw/workspace/telegram-stock-app/stocks.json'
with open(out,'w') as f:
    json.dump(data, f, ensure_ascii=False)
print(json.dumps(data, ensure_ascii=False, indent=2))
