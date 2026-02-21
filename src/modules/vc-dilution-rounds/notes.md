# VC Dilution Across Rounds

This module estimates VC ownership requirements and simulates dilution over multiple rounds.

## Exit-Based Ownership Requirement

Given expected exit value $V_{exit}$, target annual return $r$, and horizon $T$:

$$PV = \frac{V_{exit}}{(1+r)^T}$$

For round investment $I$, implied ownership needed at entry:

$$\text{Ownership}_{VC} = \frac{I}{PV}$$

## Share Issuance Mechanics

At each round:

- Price per share = pre-money valuation / existing shares
- New shares = investment / price per share
- Existing holders are diluted by the new issuance

Optional ESOP top-up can be modeled as additional shares issued to an employee pool.
