# Alpha Vantage API — Lessen Geleerd

## Overzicht

Alpha Vantage biedt gratis stock market data, maar heeft belangrijke beperkingen.

## Free Tier Limieten

- **25 API calls per dag** (niet per uur!)
- **5 calls per minuut**
- Reset om middernacht UTC

## Problemen Ondervonden

### 1. US vs EU Noteringen

`ASML` op Alpha Vantage = NASDAQ notering (USD)
`ASML.AS` = Euronext Amsterdam (EUR)

De koerswijzigingen kunnen significant verschillen door:
- Wisselkoersschommelingen
- Verschillende handelstijden
- Arbitrage vertragingen

### 2. "Latest Trading Day" Is Gisteren

De API geeft end-of-day data. Als je om 15:00 CET opvraagt, krijg je data van de vorige beursdag — niet real-time.

### 3. Rate Limit Geeft Geen Error

Bij overschrijding krijg je gewoon een JSON response met een `Information` veld in plaats van een error:

```json
{
  "Information": "Thank you for using Alpha Vantage! Our standard API rate limit is 25 requests per day."
}
```

Dit kan je code laten "hallucineren" als je niet expliciet checkt.

## Best Practices

1. **Eén moment per dag ophalen** — Na US market close (22:30 CET)
2. **Cache agressief** — Bewaar responses in database
3. **Check op `Information` field** — Behandel als error
4. **Tel je calls** — Houd bij hoeveel je hebt gebruikt

## Alternatieven

| Provider | Free Tier | Real-time | EU Data |
|----------|-----------|-----------|---------|
| Alpha Vantage | 25/dag | Nee | Beperkt |
| Yahoo Finance | 500/maand | Nee | Ja |
| Finnhub | 60/min | Ja | Beperkt |
| Financial Modeling Prep | 250/dag | Nee | Ja (betaald) |

## Conclusie

Alpha Vantage is prima voor hobby projecten met lage volumes, maar niet geschikt voor real-time dashboards of high-frequency use cases.
