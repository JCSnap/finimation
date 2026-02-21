# Efficient Frontier

The **efficient frontier** shows the set of portfolios that maximise expected return for a given level of risk (standard deviation).

## Two-Asset Portfolio

For a portfolio of two assets with weights $w_1$ and $w_2 = 1 - w_1$:

**Expected Return:**
$$E[R_p] = w_1 E[R_1] + w_2 E[R_2]$$

**Portfolio Variance:**
$$\sigma_p^2 = w_1^2 \sigma_1^2 + w_2^2 \sigma_2^2 + 2 w_1 w_2 \rho_{12} \sigma_1 \sigma_2$$

Where $\rho_{12}$ is the **correlation** between the two assets.

## Effect of Correlation

| Correlation | Diversification Benefit |
|-------------|------------------------|
| $\rho = +1$ | No benefit — linear combination |
| $0 < \rho < 1$ | Some benefit |
| $\rho = 0$ | Full independence |
| $\rho = -1$ | Maximum diversification — can achieve zero risk |

## Minimum Variance Portfolio

The leftmost point on the frontier is the **minimum variance portfolio (MVP)** — the combination with the lowest possible risk.

## Interactive Controls

Adjust the returns, risks, and correlation of the two assets. The curve shows all possible portfolio combinations as you vary $w_1$ from 0% to 100%.
