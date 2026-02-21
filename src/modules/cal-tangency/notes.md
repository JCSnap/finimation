# CAL & Tangency Portfolio

With a risk-free asset, mean-variance optimization identifies the **tangency portfolio** on the risky frontier.

## Tangency Objective

Maximize Sharpe ratio:

$$\text{Sharpe} = \frac{E[R_p]-R_f}{\sigma_p}$$

## Capital Allocation Line

Once tangency portfolio $(R_T, \sigma_T)$ is chosen, any allocation $y$ to it gives:

$$E[R_C] = R_f + y(R_T - R_f), \quad \sigma_C = |y|\sigma_T$$

- $y<1$: lend at risk-free rate
- $y>1$: levered exposure to tangency portfolio
- $y<0$: net short risky portfolio
