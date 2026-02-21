# VC Portfolio Returns Simulator

VC outcomes are often modeled as a portfolio of buckets.

## Bucket Model

Allocate capital into:

- **Home runs** (high multiple)
- **Living dead** (flat or modest multiple)
- **Total losses** (0x)

Weighted gross MOIC:

$$MOIC = w_h m_h + w_l m_l + w_x \cdot 0$$

Annualized gross IRR over horizon $T$:

$$IRR = MOIC^{1/T} - 1$$

## Required Home-Run Return

Given target fund IRR, solve required home-run multiple:

$$m_h = \frac{(1+IRR_{target})^T - w_l m_l}{w_h}$$

This helps answer: what performance must the best deals achieve for the fund to hit target returns?
