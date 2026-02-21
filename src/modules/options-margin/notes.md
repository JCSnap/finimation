# Options Margin (Daily MTM)

This module simulates **daily mark-to-market settlement** for an option writer.

## Daily Variation Margin

Let $V_t$ be the option mark value for the long holder on day $t$.

Writer daily transfer:

$$\Delta VM_t = V_{t-1} - V_t$$

- $\Delta VM_t > 0$: writer receives funds
- $\Delta VM_t < 0$: writer pays funds

## Margin Account Rule

If margin balance falls below maintenance threshold:

1. A margin call is triggered.
2. Account is topped up back to initial margin.

This shows how path-dependent spot moves can force additional capital even before expiry.

## Spot and Option Marks

Spot evolves daily (drift + volatility). Option mark is repriced each day using Black-Scholes with declining time to expiry (intrinsic value at expiry day).
