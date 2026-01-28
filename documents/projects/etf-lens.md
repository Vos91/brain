# ETF Lens 🔍

> "Begrijp je portfolio. Eindelijk."

## Status

🟡 **Planning fase** — Documenten uitgewerkt, wacht op beslissingen

## Het Probleem

Nederlandse ETF beleggers hebben geen goede tool om:
- Overlap tussen ETFs te detecteren
- Werkelijke kosten te berekenen (TER is niet alles)
- Hun allocatie te laten reviewen

Bestaande tools zijn US-focused of te basic.

## Oplossing

Een web-app die:
1. ETFs opzoekt via ISIN
2. Portfolio overlap analyseert
3. Kosten berekent (TER + tracking difference + spread)
4. AI-powered feedback geeft

## Tech Stack

- Next.js 16
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- Claude API voor AI reviews

## Documentatie

- [Project Plan](/projects/etf-lens/PROJECT_PLAN.md)
- [API Kosten Analyse](/projects/etf-lens/API_KOSTEN.md)
- [Marketing Plan](/projects/etf-lens/MARKETING_PLAN.md)

## Open Beslissingen

- [ ] Domeinnaam (etflens.nl / .app / .eu)
- [ ] GitHub repo (public of private)
- [ ] Start datum

## Geschatte Kosten

| Fase | Kosten |
|------|--------|
| MVP | ~€15 (domein) |
| Maandelijks | ~€5 (Claude API) |
| Break-even | 1 Pro user (€4.99) |

## Notities

Dit project past perfect bij Jasper's profiel:
- Hij is zelf ETF belegger (FIRE interesse)
- Full-stack developer skills
- AI integratie ervaring
- First customer = zichzelf
