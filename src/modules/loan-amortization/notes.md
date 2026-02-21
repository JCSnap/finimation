# Loan Amortization Studio

Amortization schedules decompose each payment into interest and principal.

## Periodic Payment

With periodic rate $r$ and $N$ total periods:

$$PMT = P \cdot \frac{r}{1 - (1+r)^{-N}}$$

## Balance Dynamics

At each period:

- Interest = previous balance $\times r$
- Principal paid = payment - interest (+ extra payment)
- New balance = old balance - principal paid

Early extra principal accelerates payoff and reduces total interest cost.
