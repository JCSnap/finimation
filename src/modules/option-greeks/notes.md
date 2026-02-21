# Option Greeks Explorer

The **Greeks** measure how option value responds to changes in market inputs.

## Core Quantities

For Black-Scholes (no dividends):

- **Delta**: sensitivity to spot price
- **Gamma**: sensitivity of delta to spot
- **Theta**: sensitivity to passage of time
- **Vega**: sensitivity to implied volatility

## Black-Scholes Setup

$$d_1 = \frac{\ln(S/K) + (r + \tfrac{1}{2}\sigma^2)T}{\sigma\sqrt{T}}, \quad d_2 = d_1 - \sigma\sqrt{T}$$

Call price:

$$C = S N(d_1) - K e^{-rT} N(d_2)$$

Put price:

$$P = K e^{-rT} N(-d_2) - S N(-d_1)$$

## How To Read The Charts

- The **price chart** shows the option value at each spot.
- The **Greeks chart** overlays multiple sensitivities to reveal where risk changes most quickly.
- Use the spot marker to inspect the local risk profile at your current assumptions.
