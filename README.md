# AegisTrade AI

## AI-Powered Trading Intelligence for WEEX Futures

> **Trade smarter. Trade with Aegis.**

AegisTrade AI is an AI-powered futures trading intelligence system designed for the **WEEX AI Wars II: Human vs AI** competition.

The system combines real-time WEEX futures market data, multi-indicator technical analysis, AI-driven trading signals, risk management, paper trading, and protected WEEX execution into a single trading intelligence platform.

AegisTrade is designed around one core principle:

> **An AI signal should not directly become an exchange order. The signal should first pass through risk controls and execution safety checks.**

---

# 📑 Table of Contents

- [Overview](#-overview)
- [Problem](#-problem)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [How AegisTrade AI Works](#-how-aegistrade-ai-works)
- [System Architecture](#-system-architecture)
- [Architecture Components](#-architecture-components)
- [AI Signal Strategy](#-ai-signal-strategy)
- [Signal Decision Logic](#-signal-decision-logic)
- [Why HOLD Matters](#-why-hold-matters)
- [Risk Management](#-risk-management)
- [Execution Safety](#-execution-safety)
- [WEEX Integration](#-weex-integration)
- [Paper Trading](#-paper-trading)
- [Security](#-security)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Deployment](#-deployment)
- [Demo Flow](#-demo-flow)
- [Supported Markets](#-supported-markets)
- [Future Improvements](#-future-improvements)
- [Competition](#-competition)
- [Disclaimer](#-disclaimer)

---

# 🔎 Overview

AegisTrade AI provides an integrated environment for monitoring futures markets, analyzing market conditions, generating AI-assisted trading signals, applying risk controls, and safely demonstrating trade execution.

The platform is built to reduce the gap between:

**Market Data → Analysis → Decision → Risk Validation → Execution**

Instead of requiring the user to manually inspect multiple indicators and calculate trading parameters, AegisTrade brings these processes together in one dashboard.

The application provides:

- Real-time market information
- Technical indicators
- AI-generated trading signals
- Confidence scoring
- Risk calculations
- Paper trading
- Trade history
- WEEX execution protection
- Live trading safety controls

---

# ❗ Problem

Futures trading can require traders to make several decisions very quickly.

A trader may need to:

1. Monitor price movement
2. Analyze market trend
3. Check momentum
4. Evaluate RSI
5. Compare moving averages
6. Inspect MACD
7. Consider volume
8. Calculate position size
9. Set stop-loss and take-profit
10. Decide whether the trade is actually worth taking
11. Execute the trade

Performing these tasks manually can result in:

- Delayed decisions
- Inconsistent analysis
- Emotional trading
- Poor risk control
- Overtrading
- Incorrect position sizing

AegisTrade AI addresses this workflow by combining market intelligence, signal generation, and risk validation into a single system.

---

# 💡 Solution

AegisTrade AI continuously evaluates market information and produces a structured trading decision:

The decision is based on multiple technical inputs rather than a single indicator.

The resulting signal is then passed through the risk-management and execution-safety layers.

The complete workflow is:

WEEX Market Data
        ↓
Market Intelligence
        ↓
Technical Analysis
        ↓
AI Signal Engine
        ↓
Risk Manager
        ↓
Execution Safety
        ↓
Paper Trading / Protected WEEX Execution
This architecture makes risk management part of the trading workflow rather than an afterthought.
✨ Key Features
1. Real-Time WEEX Market Intelligence

AegisTrade connects to WEEX futures market endpoints to retrieve current market information.

The dashboard can display information including:

Current price
Best bid
Best ask
24-hour high
24-hour low
24-hour volume
Price change
Candlestick data
Market symbols
Trading intervals
2. Multi-Indicator AI Signal Engine

The signal engine evaluates several technical inputs:

EMA 9
EMA 21
RSI 14
MACD
Momentum
Volume ratio

The indicators are combined into a directional scoring system.

The result is classified as:
LONG
SHORT
HOLD
The dashboard also displays a confidence score and explanation of the current market intelligence.

3. Risk Management

AegisTrade places risk validation between the AI decision and execution.

Risk controls include:

Position sizing
Balance validation
Stop-loss
Take-profit
Maximum order notional
Duplicate position protection
Fresh market-price validation
Live trading safety controls
4. Paper Trading

AegisTrade provides a simulated trading environment for safe testing and demonstration.

The paper trading engine tracks:

Simulated balance
Open positions
Entry price
Exit price
Profit and loss
Trade history

The default simulated starting balance is:

10,000 USDT

Paper trading allows the complete trading workflow to be demonstrated without sending real orders to the exchange.
5. Protected WEEX Execution

AegisTrade contains a backend WEEX execution layer with authentication and safety controls.

Live trading is controlled by a backend environment variable:

WEEX_LIVE_TRADING=false

When live trading is disabled, the system can validate an order without sending it as a real exchange order.

This provides an additional protection layer during development and competition demonstration.

🔄 How AegisTrade AI Works

The complete system follows this workflow:
             ┌───────────────────────┐
             │      WEEX Market      │
             │        Data           │
             └───────────┬───────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │  Market Intelligence  │
             └───────────┬───────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │   Technical Analysis  │
             │                       │
             │ EMA / RSI / MACD      │
             │ Momentum / Volume     │
             └───────────┬───────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │    AI Signal Engine   │
             │                       │
             │ LONG / SHORT / HOLD   │
             └───────────┬───────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │     Risk Manager      │
             └───────────┬───────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │   Execution Safety    │
             └───────────┬───────────┘
                         │
                  ┌──────┴──────┐
                  │             │
                  ▼             ▼
          ┌──────────────┐ ┌──────────────┐
          │ Paper Trading│ │ WEEX Futures │
          │    Engine    │ │  Execution   │
          └──────────────┘ └──────────────┘
          🏗️ System Architecture

AegisTrade AI uses a frontend-backend architecture.
                         ┌──────────────────────────┐
                         │     AegisTrade AI        │
                         │      React Frontend      │
                         │          Netlify         │
                         └────────────┬─────────────┘
                                      │
                                      │ HTTP API
                                      ▼
                         ┌──────────────────────────┐
                         │      FastAPI Backend     │
                         │          Render          │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
      ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
      │  WEEX Market   │      │  AI Signal     │      │ Risk Management│
      │     Data       │      │     Engine     │      │     Layer       │
      │                │      │                │      │                │
      │ • Ticker       │      │ • EMA          │      │ • Position     │
      │ • Candles      │      │ • RSI          │      │   sizing        │
      │ • Bid / Ask    │      │ • MACD         │      │ • SL / TP       │
      │ • Volume       │      │ • Momentum     │      │ • Limits        │
      └───────┬────────┘      │ • Volume       │      │ • Validation    │
              │               └───────┬────────┘      └───────┬────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │   Execution Safety Layer │
                         │                          │
                         │ • Fresh price check     │
                         │ • Notional limit        │
                         │ • Duplicate protection  │
                         │ • Live trading switch   │
                         └────────────┬─────────────┘
                                      │
                           ┌──────────┴──────────┐
                           │                     │
                           ▼                     ▼
                  ┌────────────────┐    ┌────────────────┐
                  │ Paper Trading  │    │ WEEX Futures   │
                  │     Engine     │    │   Execution    │
                  └────────────────┘    └────────────────┘
                🧩 Architecture Components
Frontend

The frontend is built using React.

It provides the user interface for:

Market monitoring
Technical analysis
AI signals
Risk information
Paper trading
WEEX execution status
Trade history

The production frontend is hosted on Netlify.

Backend

The backend is built with FastAPI and Python.

It handles:

Market-data requests
Trading APIs
Risk calculations
Paper trading
WEEX authentication
WEEX execution
Backend configuration
Security-sensitive operations

The production backend is hosted on Render.

WEEX Market Service

The market service communicates with WEEX futures market endpoints.

It retrieves and validates:

Ticker information
Bid / ask information
24-hour market statistics
Candlestick data

The service validates symbols and returned market values before passing them into the application.

AI Signal Engine

The frontend signal engine combines multiple technical indicators to create a structured market decision.

The engine evaluates:

EMA 9
EMA 21
RSI 14
MACD
Momentum
Volume Ratio

ThRisk Manager

The risk layer determines whether a proposed trade satisfies the configured risk requirements.

It considers:

Entry price
Balance
Position size
Risk parameters
Stop-loss
Take-profit
Maximum exposure
Execution Safety Layer

The execution safety layer is designed to prevent unsafe trade execution.

It provides:

Fresh price validation
Maximum notional protection
Duplicate-position protection
Live trading switch
Order validation
Paper Trading Engine

The paper trading service provides a simulated trading environment.

It tracks positions and P&L without requiring real exchange execution.

🤖 AI Signal Strategy

AegisTrade does not rely on a single indicator.

Instead, several technical indicators contribute to the overall market decision.

EMA 9

EMA 9 represents a shorter-term trend measurement.

It helps identify recent price direction.

EMA 21

EMA 21 provides a longer comparison period.

Comparing EMA 9 with EMA 21 helps identify directional trend conditions.

RSI 14

RSI is used to evaluate momentum and relative bullish or bearish market strength.

MACD

MACD contributes information about momentum and trend direction.

Momentum

Recent price movement is used as an additional directional input.

Volume Ratio

Volume behavior provides additional confirmation of market activity.

📊 Signal Decision Logic

The current signal engine uses a combined scoring approach.

The main decision thresholds are:

Score >= 6
    ↓
LONG
Score <= -6
    ↓
SHORT
Otherwise
    ↓
HOLD

The system also calculates a confidence value based on the strength of the combined signal.

The confidence value should be interpreted as the model's confidence in its current classification, not as a guaranteed probability of profit.

⏸️ Why HOLD Matters

AegisTrade does not force a trade when market evidence is mixed.

If the technical signals do not provide enough directional confirmation, the system returns:

HOLD

This is intentional.

For example, a market may show:

Neutral RSI
Nearly equal short- and long-term EMAs
Weak MACD momentum
Conflicting directional signals

Instead of artificially choosing LONG or SHORT, AegisTrade can wait for stronger confirmation.

This creates a more risk-aware trading workflow.

🛡️ Risk Management

Risk management is one of the core architectural principles of AegisTrade AI.

The system does not treat the AI signal as an automatic order instruction.

Instead:

AI Signal
    ↓
Risk Validation
    ↓
Execution Safety
    ↓
Trading Action
Fresh Price Validation

Before important trading actions, the system requests fresh ticker information.

This helps reduce the risk of making a decision using an outdated displayed price.

Position Sizing

The system calculates a position size based on the configured risk parameters and available balance.

This helps prevent uncontrolled position exposure result is converted into a directional score and signal.

Stop-Loss and Take-Profit

The risk layer validates protective trading levels before a position is opened.

Balance Validation

The paper trading system checks the available simulated balance before opening a position.

Duplicate Position Protection

The paper trading engine prevents multiple open positions for the same symbol.

Maximum Order Notional

The WEEX execution layer supports a maximum order-notional setting.

Example:

WEEX_MAX_LIVE_ORDER_NOTIONAL_USDT=100

This provides an additional exposure limit.

🔐 Execution Safety

AegisTrade separates signal generation from execution.

The safety sequence is:
Signal
   ↓
Fresh Market Price
   ↓
Risk Calculation
   ↓
Risk Validation
   ↓
Execution Safety
   ↓
Paper Trade / Protected WEEX Execution
This prevents the AI signal from bypassing the risk layer.

🔗 WEEX Integration

AegisTrade integrates with the WEEX futures API for market information and protected trading operations.

Market Data

The backend retrieves market information such as:

24-hour ticker
Current price
Best bid
Best ask
Volume
Candlestick data
Authentication

Authenticated WEEX operations use backend-side credentials.

The backend uses the required WEEX authentication/signing mechanism for protected requests.

Credentials are never intended to be placed in the React frontend.

Live Trading Protection

Live trading is controlled through:

WEEX_LIVE_TRADING=false

When disabled:

Order validated
       ↓
Not sent to exchange

This is the configuration used for safe competition demonstration.

🧪 Paper Trading

Paper trading allows the entire workflow to be tested without real financial exposure.

The system can:

Open simulated positions
Close simulated positions
Calculate simulated P&L
Track simulated balance
Record trade history

Default starting balance:

10,000 USDT

Paper trading is intended for development, testing, and demonstration.

🔒 Security

Security is particularly important because the application interacts with exchange APIs.

Credentials

Real WEEX credentials must remain in backend environment variables.

Never expose:

WEEX_API_KEY
WEEX_SECRET_KEY
WEEX_PASSPHRASE

in:

Frontend source code
React components
GitHub
README
Screenshots
Demo videos
Environment Files

The project uses:

.env
.env.example

The real .env file should remain private and should never be committed.

.env.example contains configuration placeholders only.

🧰 Technology Stack
Frontend
React
Vite
Axios
Lucide React
Recharts
Backend
Python
FastAPI
Uvicorn
Requests
Exchange
WEEX Futures API
Deployment
Netlify — Frontend
Render — Backend
GitHub — Source control
📁 Project Structure
aegistrade-ai/
│
├── frontend/
│   ├── src/
│   │   └── App.jsx
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── market.py
│   │   │   └── trading.py
│   │   │
│   │   └── services/
│   │       ├── weex_market.py
│   │       ├── weex_auth.py
│   │       ├── weex_execution.py
│   │       └── paper_trading.py
│   │
│   └── requirements.txt
│
├── .env.example
├── .gitignore
└── README.md
⚙️ Local Setup
Requirements

Install the following:

Python 3.10+
Node.js
npm
Git
1. Clone the Repository
git clone https://github.com/Hajrajadoon/aegistrade-ai.git
cd aegistrade-ai
2. Backend Setup

Create a virtual environment:

python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r backend/requirements.txt
3. Configure Environment Variables

Create a local .env file.

Example:

WEEX_API_KEY=YOUR_WEEX_API_KEY
WEEX_SECRET_KEY=YOUR_WEEX_SECRET_KEY
WEEX_PASSPHRASE=YOUR_WEEX_PASSPHRASE

WEEX_BASE_URL=https://api-contract.weex.com

WEEX_LIVE_TRADING=false
WEEX_MAX_LIVE_ORDER_NOTIONAL_USDT=100

Do not use real credentials in public documentation.

4. Start the Backend
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

Backend:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs
5. Start the Frontend

Open a second terminal:

cd frontend
npm install
npm run dev

Then open:

http://localhost:5173
🌐 Deployment

AegisTrade AI uses a separated production deployment:
GitHub
   │
   ├──────────────► Netlify
   │                 │
   │                 ▼
   │          React Frontend
   │
   └──────────────► Render
                     │
                     ▼
               FastAPI Backend
                     │
                     ▼
                  WEEX API
                  Frontend

Production frontend:

https://aegistrade-ai.netlify.app

The frontend uses the backend URL configured through:

VITE_API_URL
Backend

Production backend:

https://aegistrade-ai.onrender.com

Backend health endpoint:

https://aegistrade-ai.onrender.com/
🎬 Demo Flow

The recommended competition demonstration is:
1. Open AegisTrade AI
        ↓
2. Show live WEEX market data
        ↓
3. Select a supported futures symbol
        ↓
4. Show price and market information
        ↓
5. Show technical indicators
        ↓
6. Show AI signal
        ↓
7. Explain LONG / SHORT / HOLD
        ↓
8. Explain confidence
        ↓
9. Show risk controls
        ↓
10. Open a paper trade
        ↓
11. Show position / balance / P&L
        ↓
12. Show WEEX execution protection
        ↓
13. Explain the architecture
📈 Supported Markets

The current application supports the following futures symbols:

BTCUSDT
ETHUSDT
SOLUSDT
DOGEUSDT
XRPUSDT
ADAUSDT
BNBUSDT
LTCUSDT

Supported chart intervals include:

5m
15m
1h
4h
🧪 Testing Philosophy

AegisTrade was developed with safety-oriented testing in mind.

Testing includes:

Backend API testing
Market ticker validation
Candlestick validation
Paper trade testing
Risk validation
Protected WEEX order testing
Frontend-backend connectivity
Local development testing
Deployed production testing

The production demonstration is kept separate from real-money trading by maintaining live trading protection.

🚧 Future Improvements

Potential future improvements include:

More advanced machine-learning models
Persistent trading database
Portfolio-level risk management
Historical backtesting
Strategy optimization
More sophisticated signal models
Expanded exchange integrations
Advanced execution monitoring
Production-grade logging and observability
Improved market-data retry and recovery handling
Persistent user accounts and trading history

These improvements can be developed after the competition prototype.

🏆 Competition

AegisTrade AI was developed for:

WEEX AI Wars II: Human vs AI

The project focuses on combining AI-driven market intelligence with controlled futures trading workflows.

Project Tagline

Trade smarter. Trade with Aegis.

⚠️ Disclaimer

AegisTrade AI is a software project and competition prototype.

It does not guarantee trading profits.

AI-generated signals and confidence scores should not be interpreted as guaranteed probabilities of successful trades.

Futures trading involves significant financial risk.

Users should understand the risks of leveraged trading before using any live trading functionality.


