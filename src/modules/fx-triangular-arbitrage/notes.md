# FX Triangular Arbitrage

Triangular arbitrage checks consistency across three currency pairs.

For a loop \(A \rightarrow B \rightarrow C \rightarrow A\):

1. Convert through executable bid/ask rates
2. Apply per-leg transaction frictions
3. Compare ending amount with starting notional

If net return is positive, quotes are temporarily inconsistent after costs.
