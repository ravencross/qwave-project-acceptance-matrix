# QWave Project Acceptance Matrix

A lightweight, static scorecard app for evaluating whether a project is a strong fit for QWave.

Live app: https://qwave-scorecard-vercel.vercel.app

## What It Does

- Scores projects across hard gates, weighted fit criteria, confidence, evidence, and dealbreakers.
- Produces a recommendation: Accept, Accept with Conditions, Reframe, or Decline.
- Saves evaluations in each user's browser local storage.
- Exports the current evaluation as JSON.
- Includes a post-project review section so the rubric can improve over time.

## Run Locally

No install is required.

```bash
python3 -m http.server 4174
```

Then open:

```text
http://localhost:4174
```

## Deploy

```bash
npx vercel deploy --prod
```

No backend, database, or environment variables are required.
