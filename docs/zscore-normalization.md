# Z-Score Normalization — Manual Test Guide

Z-score normalization removes per-judge leniency/strictness bias from the leaderboard.
For each judge, scores are converted to z-scores relative to that judge's own mean and
standard deviation. This ensures a lenient judge (who scores everyone high) does not
unfairly benefit the participants they happened to score.

## Algorithm

1. Normalize each score to 0–1 range: `normalizedScore = score / criterion.max_score`
2. Per judge, compute `mean` and `std` across all their normalized scores
3. Per score: `z = (normalizedScore − mean) / std`  (if std = 0, z = 0)
4. Per participant: `weighted_score = Σ(z × criterion.weight) / Σ(criterion.weight)`

---

## Test Case 1 — Leniency cancels out (2 participants, 1 criterion)

**Setup:** 1 criterion, max 10, weight 1, normalization ON

| Judge  | Alice | Bob |
|--------|-------|-----|
| Judge1 | 10    | 9   |
| Judge2 | 3     | 9   |

**Without normalization:** Alice = 13, Bob = 18 → Bob wins by a large margin

**With z-score — expected: both = 0.000 (tied)**

```
Judge1: normalized = [10/10=1.0, 9/10=0.9]   mean=0.95   std=0.05
  Alice z = (1.0 − 0.95) / 0.05 = +1.000
  Bob   z = (0.9 − 0.95) / 0.05 = −1.000

Judge2: normalized = [3/10=0.3, 9/10=0.9]    mean=0.60   std=0.30
  Alice z = (0.3 − 0.60) / 0.30 = −1.000
  Bob   z = (0.9 − 0.60) / 0.30 = +1.000

Alice final = ( 1.000 + (−1.000)) / 2 =  0.000
Bob   final = (−1.000 +   1.000)  / 2 =  0.000
```

**Why they tie:** Judge1 preferred Alice (relative), Judge2 preferred Bob (relative).
After removing each judge's bias, neither is favoured. Without normalization, Bob appears
to win only because Judge2 happened to score higher in absolute terms.

---

## Test Case 2 — Ranking flip (3 participants, 1 criterion)

**Setup:** 1 criterion, max 10, weight 1, normalization ON

| Judge  | P1 | P2 | P3 |
|--------|----|----|-----|
| Judge1 | 10 | 5  | 8  |
| Judge2 | 4  | 8  | 6  |

**Without normalization:** P1 = 14, P3 = 14, P2 = 13 (P1/P3 tied)

**With z-score — expected ranking: P3 (0.081) → P2 (−0.037) → P1 (−0.046)**

```
Judge1: normalized = [1.0, 0.5, 0.8]   mean=0.767   std=0.206
  P1 z = ( 1.0 − 0.767) / 0.206 = +1.133
  P2 z = ( 0.5 − 0.767) / 0.206 = −1.298
  P3 z = ( 0.8 − 0.767) / 0.206 = +0.161

Judge2: normalized = [0.4, 0.8, 0.6]   mean=0.600   std=0.163
  P1 z = (0.4 − 0.60) / 0.163 = −1.225
  P2 z = (0.8 − 0.60) / 0.163 = +1.225
  P3 z = (0.6 − 0.60) / 0.163 =  0.000

P1 final = ( 1.133 + (−1.225)) / 2 = −0.046
P2 final = (−1.298 +   1.225)  / 2 = −0.037
P3 final = ( 0.161 +   0.000)  / 2 = +0.081  ← wins
```

**Why P3 wins:** Both judges rated P3 consistently well relative to their own tendencies.
P1 looked strong only because Judge1 (who scored everyone generously) gave it a 10 —
after normalising away that leniency, P1's advantage disappears.

---

## How to run the test in the app

1. Create an event, enable **Score Normalization** on the Criteria tab
2. Add a single criterion (e.g. "Score", max 10, weight 1)
3. Add participants matching the table above (Alice / Bob or P1 / P2 / P3)
4. Assign both judges to the event
5. Sign in as each judge and submit the scores from the table
6. Set the event status to **Completed**
7. Open the **Results** tab — verify the z-scores match the expected values above
