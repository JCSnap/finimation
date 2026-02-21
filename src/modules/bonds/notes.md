# Bond Pricing

A **bond** is a fixed-income instrument where the issuer promises to pay periodic **coupon payments** and return the **face value** at maturity.

## Pricing Formula

The price of a bond is the present value of all future cash flows discounted at the **yield to maturity (YTM)**:

$$P = \sum_{t=1}^{N} \frac{C}{(1+y)^t} + \frac{F}{(1+y)^N}$$

Where:
- $P$ = bond price
- $C$ = coupon payment $= F \times r$
- $F$ = face value
- $y$ = yield to maturity (per period)
- $N$ = number of periods

## Key Relationships

| Condition | Bond Type | Price vs Face Value |
|-----------|-----------|---------------------|
| YTM = Coupon Rate | Par bond | $P = F$ |
| YTM < Coupon Rate | Premium bond | $P > F$ |
| YTM > Coupon Rate | Discount bond | $P < F$ |

## Duration

**Duration** measures the sensitivity of a bond's price to interest rate changes. Higher duration = more price volatility for the same YTM change.

## Interactive Controls

Adjust the **coupon rate**, **YTM**, **face value**, and **maturity** to see how the price vs. YTM curve shifts.
