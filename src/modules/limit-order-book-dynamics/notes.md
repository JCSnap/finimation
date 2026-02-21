# Limit Order Book Dynamics

The order book evolves as limit orders, cancels, and market orders interact.

## Core ideas

- Market buys consume best ask depth first; market sells consume best bid depth first
- Top-of-book spread is the gap between best ask and best bid
- Depth imbalance gives directional pressure signal

Microprice approximation:

$$Microprice = \frac{Ask \cdot BidSize + Bid \cdot AskSize}{BidSize + AskSize}$$
