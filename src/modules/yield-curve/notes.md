# Yield Curve Builder

The yield curve maps interest rates across maturities.

## Key-Rate Representation

Define rates at major tenors (e.g. 1y, 2y, 5y, 10y, 30y), then interpolate between them:

$$r(T) = r_i + \frac{T-T_i}{T_{i+1}-T_i}\left(r_{i+1} - r_i\right)$$

## Discounting

For annual compounding:

$$DF(T) = \frac{1}{(1+r(T))^T}, \quad P_{zero}(T) = F \cdot DF(T)$$

Use this view to understand how curve shape affects long-end discounting and price sensitivity.
