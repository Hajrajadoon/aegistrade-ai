from datetime import datetime, timezone
from math import isfinite
from uuid import uuid4

INITIAL_BALANCE = 10_000.0


class PaperTradingEngine:
    def __init__(self):
        self.balance = INITIAL_BALANCE
        self.positions = {}
        self.trade_history = []

    def open_position(
        self,
        symbol: str,
        side: str,
        entry_price: float,
        quantity: float,
        stop_loss: float,
        take_profit: float,
        confidence: float = 50.0,
        signal_reason: str = "",
    ) -> dict:
        symbol = symbol.upper().strip()
        side = side.upper().strip()

        numeric_values = {
            "entry price": entry_price,
            "quantity": quantity,
            "stop loss": stop_loss,
            "take profit": take_profit,
            "confidence": confidence,
        }
        for name, value in numeric_values.items():
            if not isfinite(float(value)):
                raise ValueError(f"{name.title()} must be a finite number.")

        if side not in {"LONG", "SHORT"}:
            raise ValueError("Side must be LONG or SHORT.")
        if entry_price <= 0:
            raise ValueError("Entry price must be greater than zero.")
        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero.")
        if stop_loss <= 0 or take_profit <= 0:
            raise ValueError("Stop loss and take profit must be greater than zero.")
        if not 0 <= confidence <= 100:
            raise ValueError("Confidence must be between 0 and 100.")
        if symbol in self.positions:
            raise ValueError(f"A paper position for {symbol} is already open.")

        if side == "LONG":
            if stop_loss >= entry_price:
                raise ValueError("For LONG trades, stop loss must be below entry price.")
            if take_profit <= entry_price:
                raise ValueError("For LONG trades, take profit must be above entry price.")
        else:
            if stop_loss <= entry_price:
                raise ValueError("For SHORT trades, stop loss must be above entry price.")
            if take_profit >= entry_price:
                raise ValueError("For SHORT trades, take profit must be below entry price.")

        position = {
            "id": str(uuid4())[:8],
            "symbol": symbol,
            "side": side,
            "entry_price": round(entry_price, 4),
            "quantity": round(quantity, 6),
            "stop_loss": round(stop_loss, 4),
            "take_profit": round(take_profit, 4),
            "confidence": round(confidence, 2),
            "signal_reason": signal_reason,
            "opened_at": datetime.now(timezone.utc).isoformat(),
        }
        self.positions[symbol] = position
        return position

    def close_position(self, symbol: str, exit_price: float, reason: str = "MANUAL") -> dict:
        symbol = symbol.upper().strip()
        if symbol not in self.positions:
            raise ValueError(f"No open paper position for {symbol}.")
        if not isfinite(float(exit_price)) or exit_price <= 0:
            raise ValueError("Exit price must be greater than zero.")

        position = self.positions[symbol]
        entry_price = position["entry_price"]
        quantity = position["quantity"]
        side = position["side"]

        if side == "LONG":
            pnl = (exit_price - entry_price) * quantity
        else:
            pnl = (entry_price - exit_price) * quantity

        self.balance += pnl

        trade = {
            **position,
            "exit_price": round(exit_price, 4),
            "pnl": round(pnl, 2),
            "pnl_percent": round((pnl / (entry_price * quantity)) * 100, 4),
            "exit_reason": reason,
            "closed_at": datetime.now(timezone.utc).isoformat(),
            "balance_after": round(self.balance, 2),
            "status": "CLOSED",
        }

        self.trade_history.insert(0, trade)
        del self.positions[symbol]
        return trade

    def get_status(self) -> dict:
        return {
            "mode": "SIMULATION",
            "balance": round(self.balance, 2),
            "initial_balance": INITIAL_BALANCE,
            "open_positions": list(self.positions.values()),
            "open_position_count": len(self.positions),
            "total_trades": len(self.trade_history),
            "trade_history": self.trade_history,
        }

    def reset(self) -> dict:
        self.balance = INITIAL_BALANCE
        self.positions = {}
        self.trade_history = []
        return self.get_status()


paper_engine = PaperTradingEngine()
