# Bid-Ask Spread Formation

Quoted spreads compensate liquidity providers for costs and risks.

## Decomposition

$$Spread_{bps} = Processing + Inventory + AdverseSelection$$

- **Processing**: baseline market-making cost
- **Inventory**: compensation for warehousing risk
- **Adverse selection**: protection against informed flow

Competition compresses total spread, but a minimum one-tick quote remains.
