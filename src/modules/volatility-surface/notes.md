# Volatility Smile & Surface

Implied volatility is not flat across strikes and maturities.

## Smile

A simple smile specification can be modeled with moneyness $m = K/S_0 - 1$:

$$\sigma_{imp}(K,T) = \sigma_{ATM} + a\,m + b\,m^2 + c\,T$$

- $a$ controls skew
- $b$ controls curvature
- $c$ controls term slope

## Surface

By evaluating smile volatility across both **strike** and **maturity**, we get a volatility surface.

Use this panel to see how:

- changing skew rotates the smile,
- changing curvature thickens the wings,
- changing term slope lifts or lowers longer maturities.
