# Options Payoff

An **option** gives the buyer the right (but not the obligation) to buy or sell an asset at a specified price (the **strike price**) before or at expiry.

## Call Option

A **call option** profits when the underlying asset price rises above the strike price.

**Payoff at expiry:**

$$\text{Payoff} = \max(S - K, 0) - \text{Premium}$$

Where $S$ is the spot price at expiry and $K$ is the strike price.

- If $S > K$: in-the-money — you exercise and profit $(S - K) - \text{Premium}$
- If $S \leq K$: out-of-the-money — you let the option expire; loss = Premium paid

## Put Option

A **put option** profits when the underlying asset price falls below the strike price.

**Payoff at expiry:**

$$\text{Payoff} = \max(K - S, 0) - \text{Premium}$$

- If $S < K$: in-the-money — you exercise and profit $(K - S) - \text{Premium}$
- If $S \geq K$: out-of-the-money — loss = Premium paid

## Key Concepts

| Term | Definition |
|------|-----------|
| Strike price ($K$) | The price at which you can buy/sell the asset |
| Premium | The upfront cost of buying the option |
| Break-even | The price where payoff = 0 |
| At-the-money | $S = K$ |

## Interactive Controls

Adjust the **strike price** and **premium** below to see how the payoff curve shifts. Toggle between **Call** and **Put** to compare.
