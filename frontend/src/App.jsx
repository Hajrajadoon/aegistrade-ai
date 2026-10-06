import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Bot,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const SUPPORTED_ASSETS = [
  { symbol: "BTCUSDT", name: "BTC / USDT", label: "BTC" },
  { symbol: "ETHUSDT", name: "ETH / USDT", label: "ETH" },
  { symbol: "SOLUSDT", name: "SOL / USDT", label: "SOL" },
  { symbol: "DOGEUSDT", name: "DOGE / USDT", label: "DOGE" },
  { symbol: "XRPUSDT", name: "XRP / USDT", label: "XRP" },
  { symbol: "ADAUSDT", name: "ADA / USDT", label: "ADA" },
  { symbol: "BNBUSDT", name: "BNB / USDT", label: "BNB" },
  { symbol: "LTCUSDT", name: "LTC / USDT", label: "LTC" },
];

function calculateEMA(values, period) {
  if (!values.length) return [];
  const multiplier = 2 / (period + 1);
  const ema = [values[0]];
  for (let i = 1; i < values.length; i += 1) {
    ema.push((values[i] - ema[i - 1]) * multiplier + ema[i - 1]);
  }
  return ema;
}

function calculateRSI(values, period = 14) {
  if (values.length < period + 1) return values.map(() => 50);
  const result = Array(values.length).fill(50);
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i += 1) {
    const change = values[i] - values[i - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }
  let averageGain = gains / period;
  let averageLoss = losses / period;
  result[period] = averageLoss === 0 ? 100 : 100 - 100 / (1 + averageGain / averageLoss);
  for (let i = period + 1; i < values.length; i += 1) {
    const change = values[i] - values[i - 1];
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;
    result[i] = averageLoss === 0 ? 100 : 100 - 100 / (1 + averageGain / averageLoss);
  }
  return result;
}

function calculateMACD(values) {
  const ema12 = calculateEMA(values, 12);
  const ema26 = calculateEMA(values, 26);
  return values.map((_, index) => ema12[index] - ema26[index]);
}

function generateSignal(candles) {
  if (candles.length < 30) {
    return {
      signal: "HOLD",
      confidence: 50,
      reason: "Waiting for enough market data to confirm a direction.",
      factors: [],
      score: 0,
    };
  }

  const closes = candles.map((candle) => Number(candle.close));
  const volumes = candles.map((candle) => Number(candle.volume || 0));
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  const last = closes.length - 1;
  const previous = Math.max(0, last - 3);
  const currentPrice = closes[last];
  const trendGap = ((ema9[last] - ema21[last]) / ema21[last]) * 100;
  const ema9Slope = ((ema9[last] - ema9[previous]) / ema9[previous]) * 100;
  const momentum = ((currentPrice - closes[previous]) / closes[previous]) * 100;
  const recentVolumes = volumes.slice(Math.max(0, last - 19), last + 1);
  const avgVolume = recentVolumes.reduce((sum, value) => sum + value, 0) / Math.max(1, recentVolumes.length);
  const volumeRatio = avgVolume > 0 ? volumes[last] / avgVolume : 1;

  let score = 0;
  const factors = [];
  if (ema9[last] > ema21[last]) {
    score += 2;
    factors.push("EMA trend bullish");
  } else {
    score -= 2;
    factors.push("EMA trend bearish");
  }
  if (ema9Slope > 0.03) {
    score += 1;
    factors.push("short-term momentum rising");
  } else if (ema9Slope < -0.03) {
    score -= 1;
    factors.push("short-term momentum falling");
  }
  if (currentPrice > ema9[last]) {
    score += 1;
    factors.push("price above EMA9");
  } else if (currentPrice < ema9[last]) {
    score -= 1;
    factors.push("price below EMA9");
  }
  if (rsi[last] >= 52 && rsi[last] <= 68) {
    score += 2;
    factors.push("RSI supports bullish momentum");
  } else if (rsi[last] >= 32 && rsi[last] <= 48) {
    score -= 2;
    factors.push("RSI supports bearish momentum");
  } else if (rsi[last] > 72) {
    score -= 1;
    factors.push("RSI is overbought");
  } else if (rsi[last] < 28) {
    score += 1;
    factors.push("RSI is oversold");
  }
  if (macd[last] > 0) {
    score += 2;
    factors.push("MACD is positive");
  } else {
    score -= 2;
    factors.push("MACD is negative");
  }
  if (momentum > 0.08) {
    score += 1;
    factors.push("recent price momentum positive");
  } else if (momentum < -0.08) {
    score -= 1;
    factors.push("recent price momentum negative");
  }
  if (volumeRatio > 1.15) {
    if (momentum > 0) {
      score += 1;
      factors.push("volume confirms buying activity");
    } else if (momentum < 0) {
      score -= 1;
      factors.push("volume confirms selling activity");
    }
  }

  let signal = "HOLD";
  if (score >= 6) signal = "LONG";
  if (score <= -6) signal = "SHORT";
  const absoluteScore = Math.abs(score);
  let confidence = Math.min(92, 50 + absoluteScore * 5);
  if (signal === "HOLD") confidence = Math.min(68, 50 + absoluteScore * 3);
  let reason = "Signals are mixed; Aegis is waiting for stronger confirmation.";
  if (signal === "LONG") reason = `Bullish confirmation from ${factors.slice(0, 4).join(", ")}.`;
  if (signal === "SHORT") reason = `Bearish confirmation from ${factors.slice(0, 4).join(", ")}.`;

  return {
    signal,
    confidence: Math.round(confidence),
    reason,
    factors,
    score,
    rsi: rsi[last],
    ema9: ema9[last],
    ema21: ema21[last],
    macd: macd[last],
    momentum,
    trendGap,
    volumeRatio,
  };
}

function money(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return number.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function App() {
  const [market, setMarket] = useState(null);
  const [candles, setCandles] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [watchlist, setWatchlist] = useState([]);
  const [interval, setIntervalValue] = useState("15m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paperStatus, setPaperStatus] = useState(null);
  const [paperLoading, setPaperLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState("");
  const [tradeLoading, setTradeLoading] = useState(false);
  const [lastRisk, setLastRisk] = useState(null);
  const [executionStatus, setExecutionStatus] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [executionLoading, setExecutionLoading] = useState(false);
  const [executionMessage, setExecutionMessage] = useState("");
  const [lastWeexOrder, setLastWeexOrder] = useState(null);

  const loadExecutionStatus = async () => {
    try {
      const [executionResponse, authResponse] = await Promise.allSettled([
        axios.get(`${API_URL}/api/trading/weex/execution/status`),
        axios.get(`${API_URL}/api/trading/weex/auth/status`),
      ]);
      if (executionResponse.status === "fulfilled") setExecutionStatus(executionResponse.value.data);
      if (authResponse.status === "fulfilled") setAuthStatus(authResponse.value.data);
    } catch (err) {
      console.error("WEEX status loading error:", err);
    }
  };

  const loadPaperStatus = async () => {
    try {
      setPaperLoading(true);
      const response = await axios.get(`${API_URL}/api/trading/paper/status`);
      setPaperStatus(response.data);
    } catch (err) {
      console.error("Paper trading status error:", err);
    } finally {
      setPaperLoading(false);
    }
  };

  const analysis = useMemo(() => generateSignal(candles), [candles]);

  const liveCap = Number(executionStatus?.max_live_order_notional_usdt || 100);
  const entryPrice = Number(market?.last_price || 0);
  const capQuantity = entryPrice > 0 ? liveCap / entryPrice : 0;
  const liveReady = executionStatus?.real_orders_allowed === true && authStatus?.configured === true;
  const liveEnabledButBlocked = executionStatus?.live_trading_enabled === true && !liveReady;

  const openPaperTrade = async () => {
    if (!market) return setTradeMessage("Market data is not available yet.");
    if (analysis.signal === "HOLD") return setTradeMessage("No trade opened because the AI signal is HOLD.");
    if (!paperStatus) return setTradeMessage("Paper trading account is still loading.");
    if (paperStatus.open_position_count > 0) return setTradeMessage("A paper position is already open.");
    try {
      setTradeLoading(true);
      setTradeMessage("");
      const riskResponse = await axios.post(`${API_URL}/api/trading/risk/calculate`, {
        balance: paperStatus.balance || 10000,
        entry_price: market.last_price,
        side: analysis.signal,
        risk_percent: 1,
        stop_loss_percent: 1,
        take_profit_percent: 2,
      });
      const risk = riskResponse.data.risk;
      setLastRisk(risk);
      const tradeResponse = await axios.post(`${API_URL}/api/trading/paper/open`, {
        symbol: selectedSymbol,
        side: analysis.signal,
        entry_price: risk.entry_price,
        quantity: risk.position_size,
        stop_loss: risk.stop_loss_price,
        take_profit: risk.take_profit_price,
        confidence: analysis.confidence,
        signal_reason: analysis.reason,
      });
      if (tradeResponse.data.status === "success") {
        setTradeMessage(`${analysis.signal} paper trade opened successfully.`);
        await loadPaperStatus();
      }
    } catch (err) {
      setTradeMessage(err.response?.data?.detail || "Unable to open paper trade.");
    } finally {
      setTradeLoading(false);
    }
  };

  const closePaperTrade = async () => {
    const position = paperStatus?.open_positions?.[0];
    if (!position || !market) return setTradeMessage("No open paper position is available.");
    if (position.symbol !== selectedSymbol) return setTradeMessage(`Switch back to ${position.symbol} to close the active position.`);
    try {
      setTradeLoading(true);
      const response = await axios.post(`${API_URL}/api/trading/paper/close`, {
        symbol: position.symbol,
        exit_price: market.last_price,
        reason: "MANUAL",
      });
      if (response.data.status === "success") {
        const pnl = Number(response.data.trade?.pnl || 0);
        setTradeMessage(`Paper trade closed. P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`);
        await loadPaperStatus();
      }
    } catch (err) {
      setTradeMessage(err.response?.data?.detail || "Unable to close paper trade.");
    } finally {
      setTradeLoading(false);
    }
  };

  const executeWeexTrade = async () => {
    if (!market) return setExecutionMessage("Market data is not available yet.");
    if (analysis.signal === "HOLD") return setExecutionMessage("No exchange order prepared because the AI signal is HOLD.");
    if (liveEnabledButBlocked) return setExecutionMessage("Live trading is enabled, but authenticated execution is not ready. Check the backend credentials and refresh the execution status.");

    try {
      setExecutionLoading(true);
      setExecutionMessage("");
      setLastWeexOrder(null);

      const riskResponse = await axios.post(`${API_URL}/api/trading/risk/calculate`, {
        balance: paperStatus?.balance || 10000,
        entry_price: market.last_price,
        side: analysis.signal,
        risk_percent: 1,
        stop_loss_percent: 1,
        take_profit_percent: 2,
      });
      const risk = riskResponse.data.risk;
      setLastRisk(risk);

      // Keep both development validation and live execution inside the backend safety cap.
      const safeQuantity = Math.min(Number(risk.position_size), capQuantity);
      if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) {
        throw new Error("Unable to calculate a safe WEEX quantity.");
      }

      const clientOrderId = `aegis-${Date.now().toString(36)}`.slice(0, 36);
      const orderResponse = await axios.post(`${API_URL}/api/trading/weex/order`, {
        symbol: selectedSymbol,
        position_side: analysis.signal,
        quantity: safeQuantity,
        entry_price: market.last_price,
        take_profit: risk.take_profit_price,
        stop_loss: risk.stop_loss_price,
        client_order_id: clientOrderId,
        reduce_only: false,
      });

      const result = orderResponse.data;
      setLastWeexOrder(result);

      if (result.status === "blocked") {
        setExecutionMessage(`Order validated but not sent. Test notional: $${money(safeQuantity * market.last_price)}.`);
      } else if (result.status === "submitted") {
        const response = result.response || {};
        const orderId = response.orderId || response.order_id || response.data?.orderId;
        setExecutionMessage(orderId ? `WEEX ${analysis.signal} order accepted. Order ID: ${orderId}` : `WEEX ${analysis.signal} order accepted by the exchange.`);
      } else {
        setExecutionMessage(result.message || "WEEX order request completed.");
      }
      await loadExecutionStatus();
    } catch (err) {
      console.error("WEEX execution error:", err);
      setExecutionMessage(err.response?.data?.detail || err.response?.data?.message || err.message || "Unable to process the WEEX order.");
    } finally {
      setExecutionLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tickerResult, candlesResult] = await Promise.allSettled([
        axios.get(`${API_URL}/api/market/ticker?symbol=${selectedSymbol}`),
        axios.get(`${API_URL}/api/market/candles?symbol=${selectedSymbol}&interval=${interval}&limit=100`),
      ]);
      if (tickerResult.status === "rejected" || candlesResult.status === "rejected") {
        const detail = tickerResult.status === "rejected"
          ? tickerResult.reason?.response?.data?.detail || tickerResult.reason?.message
          : candlesResult.reason?.response?.data?.detail || candlesResult.reason?.message;
        setError(`Unable to load ${selectedSymbol} market data. ${detail || "Please make sure the FastAPI backend is running."}`);
        return;
      }
      setMarket(tickerResult.value.data);
      setCandles(candlesResult.value.data.candles || []);
      const watchResults = await Promise.allSettled(SUPPORTED_ASSETS.map((asset) => axios.get(`${API_URL}/api/market/ticker?symbol=${asset.symbol}`)));
      setWatchlist(watchResults.filter((r) => r.status === "fulfilled").map((r) => r.value.data));
      await loadPaperStatus();
      await loadExecutionStatus();
    } catch (err) {
      console.error("Dashboard refresh error:", err);
      setError("Unable to refresh the dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 30000);
    return () => clearInterval(timer);
  }, [interval, selectedSymbol]);

  useEffect(() => {
    const refreshTicker = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/market/ticker?symbol=${selectedSymbol}`);
        setMarket((current) => ({ ...(current || {}), ...response.data }));
        setWatchlist((current) => current.map((item) => item.symbol === selectedSymbol ? { ...item, ...response.data } : item));
      } catch (err) {
        console.error("Live ticker refresh error:", err);
      }
    };
    refreshTicker();
    const timer = setInterval(refreshTicker, 5000);
    return () => clearInterval(timer);
  }, [selectedSymbol]);

  const chartData = useMemo(() => candles.map((candle) => ({
    time: new Date(candle.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    price: Number(candle.close),
  })), [candles]);

  const priceChange = Number(market?.price_change_percent || 0);
  const isPositive = priceChange >= 0;
  const signalClass = analysis.signal === "LONG" ? "long" : analysis.signal === "SHORT" ? "short" : "hold";
  const selectedName = SUPPORTED_ASSETS.find((asset) => asset.symbol === selectedSymbol)?.name || selectedSymbol;
  const realOrdersAllowed = executionStatus?.real_orders_allowed === true;

  // Calculate performance directly from completed trade history so the
  // statistics always stay synchronized with the trades shown below.
  const performanceStats = useMemo(() => {
    const history = Array.isArray(paperStatus?.trade_history) ? paperStatus.trade_history : [];
    const completedTrades = history.length;
    const winningTrades = history.filter((trade) => Number(trade?.pnl || 0) > 0).length;
    const losingTrades = history.filter((trade) => Number(trade?.pnl || 0) < 0).length;
    const realizedPnl = history.reduce((total, trade) => total + Number(trade?.pnl || 0), 0);
    const winRate = completedTrades > 0 ? (winningTrades / completedTrades) * 100 : 0;

    return {
      totalTrades: completedTrades,
      winningTrades,
      losingTrades,
      winRate,
      realizedPnl,
    };
  }, [paperStatus?.trade_history]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><ShieldCheck size={28} /></div>
          <div><h1>AegisTrade AI</h1><p>AI-Powered Trading Intelligence</p></div>
        </div>
        <div className="connection"><span className="status-dot"></span>WEEX V3 Market Connected</div>
      </header>

      <main className="dashboard">
        <section className="hero">
          <div>
            <p className="eyebrow">AUTONOMOUS TRADING SYSTEM</p>
            <h2>Trade smarter.<br /><span>Trade with Aegis.</span></h2>
            <p className="hero-text">Real-time market intelligence, technical analysis, AI-generated signals and risk-controlled execution.</p>
          </div>
          <div className="ai-status"><Bot size={30} /><div><strong>AI Engine</strong><span>{analysis.signal === "HOLD" ? "Monitoring market" : `${analysis.signal} signal detected`}</span></div></div>
        </section>

        {error && <div className="error">{error}</div>}

        <section className="section-heading">
          <div><p className="eyebrow">LIVE MARKET</p><h3>{selectedName} Futures</h3></div>
          <div className="controls">
            <select value={selectedSymbol} onChange={(e) => { setSelectedSymbol(e.target.value); setTradeMessage(""); setLastRisk(null); }} style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "inherit", fontWeight: 700 }}>
              {SUPPORTED_ASSETS.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.label} / USDT</option>)}
            </select>
            <div className="timeframes">{["5m", "15m", "1h", "4h"].map((value) => <button key={value} className={interval === value ? "timeframe active" : "timeframe"} onClick={() => setIntervalValue(value)}>{value}</button>)}</div>
            <button className="refresh-button" onClick={fetchData} disabled={loading}><RefreshCw size={17} className={loading ? "spin" : ""} />{loading ? "Updating..." : "Refresh"}</button>
          </div>
        </section>

        <section className="market-grid">
          <div className="market-card price-card"><div className="card-label"><Activity size={17} />Last Price</div><div className="price">{market ? `$${money(market.last_price)}` : "--"}</div><div className={`change ${isPositive ? "positive" : "negative"}`}>{isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}{market ? `${priceChange.toFixed(2)}%` : "--"}<span>24h</span></div></div>
          <div className="market-card"><div className="card-label"><TrendingUp size={17} />Best Bid</div><div className="metric">{market ? `$${money(market.best_bid)}` : "--"}</div><small>Highest current buy price</small></div>
          <div className="market-card"><div className="card-label"><TrendingDown size={17} />Best Ask</div><div className="metric">{market ? `$${money(market.best_ask)}` : "--"}</div><small>Lowest current sell price</small></div>
          <div className="market-card"><div className="card-label"><Activity size={17} />24h Volume</div><div className="metric">{market ? money(market.volume_24h, 0) : "--"}</div><small>Quote volume</small></div>
        </section>

        <section className="watchlist">
          {SUPPORTED_ASSETS.map((asset) => {
            const item = watchlist.find((row) => row.symbol === asset.symbol);
            const change = Number(item?.price_change_percent || 0);
            return <button key={asset.symbol} className={asset.symbol === selectedSymbol ? "watch-card active" : "watch-card"} onClick={() => setSelectedSymbol(asset.symbol)}><strong>{asset.label}/USDT</strong><span>{item ? `$${money(item.last_price, 4)}` : "Loading..."}</span><small>{item ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}% 24h` : "--"}</small></button>;
          })}
        </section>

        <section className="main-grid">
          <div className="panel chart-panel">
            <div className="panel-header"><div><p className="eyebrow">PRICE ACTION</p><h3>{selectedName}</h3></div><span className="chart-live">LIVE</span></div>
            <div className="chart">{chartData.length ? <ResponsiveContainer width="100%" height={330}><LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} /><XAxis dataKey="time" tick={{ fontSize: 10 }} minTickGap={35} /><YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} width={75} /><Tooltip contentStyle={{ background: "#101c17", border: "1px solid rgba(255,255,255,.1)", borderRadius: "8px" }} /><Line type="monotone" dataKey="price" stroke="#39d990" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer> : <div className="chart-empty">Loading market data...</div>}</div>
          </div>

          <div className="panel signal-panel">
            <div className="panel-header"><div><p className="eyebrow">AI SIGNAL</p><h3>Market Intelligence</h3></div><Bot size={23} /></div>
            <div className={`signal-box ${signalClass}`}><div className="signal-title">{analysis.signal}</div><div className="confidence">{analysis.confidence}% confidence</div><p>{analysis.reason}</p></div>
            <div className="indicator-list"><div><span>RSI (14)</span><strong>{Number.isFinite(analysis.rsi) ? analysis.rsi.toFixed(1) : "--"}</strong></div><div><span>EMA (9)</span><strong>{Number.isFinite(analysis.ema9) ? analysis.ema9.toFixed(2) : "--"}</strong></div><div><span>EMA (21)</span><strong>{Number.isFinite(analysis.ema21) ? analysis.ema21.toFixed(2) : "--"}</strong></div><div><span>MACD</span><strong>{Number.isFinite(analysis.macd) ? analysis.macd.toFixed(2) : "--"}</strong></div></div>
            {analysis.signal !== "HOLD" && <button onClick={openPaperTrade} disabled={tradeLoading || paperStatus?.open_position_count > 0} style={{ width: "100%", marginTop: 18, padding: "13px 18px", border: "none", borderRadius: 10, background: analysis.signal === "LONG" ? "#39d990" : "#ff6b6b", color: "#07110c", fontWeight: 800 }}>{tradeLoading ? "OPENING..." : "OPEN LONG/SHORT PAPER TRADE"}</button>}
            {tradeMessage && <p className="message">{tradeMessage}</p>}
          </div>
        </section>

        {lastRisk && <section className="panel" style={{ marginTop: 20 }}><div className="panel-header"><div><p className="eyebrow">TRADE PLAN</p><h3>Risk-Controlled Position</h3></div><span className="safe-badge">1% RISK</span></div><div className="risk-list"><div><span>Entry</span><strong>${money(lastRisk.entry_price)}</strong></div><div><span>Position Size</span><strong>{Number(lastRisk.position_size).toFixed(6)}</strong></div><div><span>Stop Loss</span><strong>${money(lastRisk.stop_loss_price)}</strong></div><div><span>Take Profit</span><strong>${money(lastRisk.take_profit_price)}</strong></div><div><span>Risk / Reward</span><strong>1 : {lastRisk.risk_reward_ratio}</strong></div><div><span>Potential Loss</span><strong>${money(lastRisk.risk_amount || 100)}</strong></div><div><span>Potential Profit</span><strong>${money(lastRisk.reward_amount || 200)}</strong></div></div></section>}

        <section className="bottom-grid">
          <div className="panel"><div className="panel-header"><div><p className="eyebrow">RISK CONTROL</p><h3>Risk Manager</h3></div><span className="safe-badge"><ShieldCheck size={15} />Protected</span></div><div className="risk-list"><div><span>Trading Mode</span><strong>{paperStatus?.mode || "Simulation"}</strong></div><div><span>Real Orders</span><strong>{realOrdersAllowed ? "Authorized" : "Disabled"}</strong></div><div><span>Signal Engine</span><strong>Active</strong></div><div><span>Risk Engine</span><strong>Active</strong></div></div></div>
          <div className="panel"><div className="panel-header"><div><p className="eyebrow">SYSTEM</p><h3>Aegis Status</h3></div><span className="safe-badge">ONLINE</span></div><div className="system-status"><div><span className="status-dot"></span>WEEX market feed</div><div><span className="status-dot"></span>Technical analysis</div><div><span className="status-dot"></span>AI signal engine</div><div><span className="status-dot"></span>Paper trading engine</div><div className={realOrdersAllowed ? "" : "status-off"}><span className={realOrdersAllowed ? "status-dot" : ""}></span>{realOrdersAllowed ? "Authenticated real execution available" : "Real execution protected"}</div></div></div>
        </section>

        <section className="bottom-grid">
          <div className="panel"><div className="panel-header"><div><p className="eyebrow">PAPER TRADING</p><h3>Simulation Account</h3></div><span className="safe-badge">SIMULATION</span></div><div className="risk-list"><div><span>Balance</span><strong>${money(paperStatus?.balance)}</strong></div><div><span>Open Positions</span><strong>{paperStatus?.open_position_count ?? 0}</strong></div><div><span>Total Trades</span><strong>{paperStatus?.total_trades ?? 0}</strong></div><div><span>Real Orders</span><strong>{realOrdersAllowed ? "Authorized" : "Disabled"}</strong></div></div>{paperStatus?.open_positions?.map((position) => <button key={position.id || position.symbol} onClick={closePaperTrade} disabled={tradeLoading || position.symbol !== selectedSymbol} style={{ width: "100%", marginTop: 16, padding: "12px", border: "none", borderRadius: 10, fontWeight: 800 }}>{tradeLoading ? "CLOSING..." : `CLOSE ${position.symbol} PAPER TRADE`}</button>)}</div>
          <div className="panel"><div className="panel-header"><div><p className="eyebrow">ENGINE</p><h3>Paper Trading Status</h3></div><span className="safe-badge">ONLINE</span></div><div className="system-status"><div><span className="status-dot"></span>Paper engine connected</div><div><span className="status-dot"></span>Virtual balance active</div><div><span className="status-dot"></span>Trade history active</div><div className="status-off"><span></span>Real exchange execution protected</div></div></div>
        </section>

        <section className="bottom-grid">
          <div className="panel">
            <div className="panel-header"><div><p className="eyebrow">WEEX EXECUTION</p><h3>Exchange Order Control</h3></div><span className="safe-badge">{realOrdersAllowed ? "READY" : "PROTECTED"}</span></div>
            <div className="risk-list"><div><span>Execution Mode</span><strong>{executionStatus?.mode || "BLOCKED"}</strong></div><div><span>Live Trading</span><strong>{executionStatus?.live_trading_enabled ? "Enabled" : "Disabled"}</strong></div><div><span>API Credentials</span><strong>{authStatus?.configured ? "Configured" : "Not configured"}</strong></div><div><span>Authentication</span><strong>{liveReady ? "Ready" : "Protected"}</strong></div><div><span>Selected Asset</span><strong>{selectedSymbol}</strong></div><div><span>Safety Limit</span><strong>${money(liveCap)}</strong></div></div>
            <button onClick={loadExecutionStatus} disabled={executionLoading} style={{ width: "100%", marginTop: 16, padding: "11px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "inherit", fontWeight: 700 }}><RefreshCw size={15} /> Refresh execution status</button>
            <button onClick={executeWeexTrade} disabled={executionLoading || !market || analysis.signal === "HOLD" || liveEnabledButBlocked} style={{ width: "100%", marginTop: 12, padding: "13px 18px", border: "none", borderRadius: 10, background: analysis.signal === "LONG" ? "#39d990" : analysis.signal === "SHORT" ? "#ff6b6b" : "rgba(255,255,255,.12)", color: "#07110c", fontWeight: 800, opacity: executionLoading || !market || analysis.signal === "HOLD" || liveEnabledButBlocked ? 0.55 : 1 }}>{executionLoading ? "PROCESSING ORDER..." : analysis.signal === "HOLD" ? "AI HOLD — NO ORDER" : realOrdersAllowed ? `SEND ${analysis.signal} WEEX ORDER` : `TEST ${analysis.signal} WEEX ORDER`}</button>
            {executionMessage && <p className="message">{executionMessage}</p>}
            {lastWeexOrder?.response && <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "rgba(255,255,255,.03)" }}><strong>Exchange Response</strong><div style={{ marginTop: 8, fontSize: 13 }}>Order ID: {lastWeexOrder.response.orderId || "--"}</div><div style={{ marginTop: 4, fontSize: 13 }}>Client Order ID: {lastWeexOrder.response.clientOrderId || lastWeexOrder.request?.newClientOrderId || "--"}</div><div style={{ marginTop: 4, fontSize: 13 }}>Accepted: {lastWeexOrder.response.success === true ? "Yes" : "No"}</div></div>}
            <p style={{ margin: "12px 0 0", fontSize: 12, opacity: 0.65, lineHeight: 1.5 }}>Credentials stay on the backend. Exchange orders remain disabled until the backend permits them. The order quantity is also constrained by the configured notional safety limit.</p>
          </div>

          <div className="panel"><div className="panel-header"><div><p className="eyebrow">EXECUTION FLOW</p><h3>Signal → Risk → Exchange</h3></div><span className="safe-badge">PROTECTED</span></div><div className="system-status"><div><span className="status-dot"></span>AI signal generated</div><div><span className="status-dot"></span>Risk manager calculates size</div><div><span className="status-dot"></span>Stop loss / take profit prepared</div><div><span className="status-dot"></span>Authenticated backend gate checked</div><div className={realOrdersAllowed ? "" : "status-off"}><span className={realOrdersAllowed ? "status-dot" : ""}></span>{realOrdersAllowed ? "Exchange execution authorized" : "Exchange execution not authorized"}</div></div></div>
        </section>

        {lastRisk && <section className="panel" style={{ marginTop: 20 }}><div className="panel-header"><div><p className="eyebrow">CURRENT ORDER PLAN</p><h3>Execution Parameters</h3></div><span className="safe-badge">{analysis.signal}</span></div><div className="risk-list"><div><span>Side</span><strong>{analysis.signal}</strong></div><div><span>Safe Quantity</span><strong>{Math.min(Number(lastRisk.position_size || 0), capQuantity).toFixed(6)}</strong></div><div><span>Entry</span><strong>${money(lastRisk.entry_price)}</strong></div><div><span>Stop Loss</span><strong>${money(lastRisk.stop_loss_price)}</strong></div><div><span>Take Profit</span><strong>${money(lastRisk.take_profit_price)}</strong></div><div><span>Maximum Notional</span><strong>${money(liveCap)}</strong></div></div></section>}

        <section className="bottom-grid" style={{ marginTop: 20 }}>
          <div className="panel"><div className="panel-header"><div><p className="eyebrow">PERFORMANCE</p><h3>Trading Statistics</h3></div><span className="safe-badge">SIMULATION</span></div><div className="risk-list"><div><span>Total Trades</span><strong>{performanceStats.totalTrades}</strong></div><div><span>Winning Trades</span><strong>{performanceStats.winningTrades}</strong></div><div><span>Losing Trades</span><strong>{performanceStats.losingTrades}</strong></div><div><span>Win Rate</span><strong>{performanceStats.winRate.toFixed(1)}%</strong></div><div><span>Realized P&L</span><strong>{performanceStats.realizedPnl >= 0 ? "+" : "-"}${Math.abs(performanceStats.realizedPnl).toFixed(2)}</strong></div><div><span>Current Balance</span><strong>${money(paperStatus?.balance)}</strong></div></div></div>
          <div className="panel"><div className="panel-header"><div><p className="eyebrow">TRADE HISTORY</p><h3>Completed Trades</h3></div><span className="safe-badge">{paperStatus?.trade_history?.length || 0} TRADES</span></div>{paperStatus?.trade_history?.length ? <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr><th style={{ textAlign: "left", padding: 8 }}>Asset</th><th style={{ textAlign: "left", padding: 8 }}>Side</th><th style={{ textAlign: "right", padding: 8 }}>Entry</th><th style={{ textAlign: "right", padding: 8 }}>Exit</th><th style={{ textAlign: "right", padding: 8 }}>P&L</th></tr></thead><tbody>{paperStatus.trade_history.slice(0, 10).map((trade) => { const pnl = Number(trade.pnl || 0); return <tr key={trade.id}><td style={{ padding: 8 }}>{trade.symbol}</td><td style={{ padding: 8 }}>{trade.side}</td><td style={{ textAlign: "right", padding: 8 }}>${money(trade.entry_price)}</td><td style={{ textAlign: "right", padding: 8 }}>${money(trade.exit_price)}</td><td style={{ textAlign: "right", padding: 8, fontWeight: 700 }}>{pnl >= 0 ? "+" : "-"}${Math.abs(pnl).toFixed(2)}</td></tr>; })}</tbody></table></div> : <div style={{ padding: 24, textAlign: "center", opacity: 0.65 }}>No completed paper trades yet.</div>}</div>
        </section>
      </main>

      <footer><span>AegisTrade AI</span><span>WEEX AI Wars II</span><span>{realOrdersAllowed ? "Live execution authorized by backend" : "Development Mode • No real trades"}</span></footer>
    </div>
  );
}

export default App;