# ECC Guide voor Jasper — Lokaal op Windows met Claude Code

## Wat is ECC?

Een verzameling rules, commands en skills die Claude Code slimmer maken. Denk aan het als een "upgrade pack" — je installeert het één keer en Claude Code volgt automatisch betere patterns.

---

## Installatie (Windows, 5 minuten)

### Stap 1: Clone de repo

```cmd
cd C:\Users\Jasper
git clone https://github.com/affaan-m/everything-claude-code.git
```

### Stap 2: Kopieer de rules die je nodig hebt

**CMD:**
```cmd
mkdir %USERPROFILE%\.claude\rules\common
mkdir %USERPROFILE%\.claude\rules\typescript
xcopy /E /I everything-claude-code\rules\common %USERPROFILE%\.claude\rules\common
xcopy /E /I everything-claude-code\rules\typescript %USERPROFILE%\.claude\rules\typescript
```

**Of PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\rules"
Copy-Item -Recurse everything-claude-code\rules\common "$env:USERPROFILE\.claude\rules\common"
Copy-Item -Recurse everything-claude-code\rules\typescript "$env:USERPROFILE\.claude\rules\typescript"
```

### Stap 3: Klaar

De rules werken nu automatisch in élke Claude Code sessie. Je hoeft niets te configureren.

---

## De 4 wins voor jou

### Win 1: TypeScript Rules (automatisch actief na installatie)

Claude Code volgt nu automatisch:
- Betere file structuur en naming
- Immutability patterns (geen onnodige `let`, meer `const`)
- Consistente git commits (`feat:`, `fix:`, `refactor:`)
- Testing best practices

**Je merkt het verschil direct** — de code die Claude Code schrijft wordt consistenter.

### Win 2: CLAUDE.md per project

Maak in elk project root een `CLAUDE.md`. Dit is de belangrijkste file die Claude Code leest.

**Voorbeeld voor een Next.js project (tuinwoning.nl):**

```markdown
# Tuinwoning.nl

## Stack
- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Next.js 16: gebruik proxy.ts i.p.v. middleware.ts

## Design Tokens
- Crème: #F9F2E7 (achtergrond)
- Groen: #A0BB8B (accent, secondary buttons)
- Oranje: #CA6032 (CTA, primary buttons)
- Donkerbruin: #4A3728 (tekst)
- Font headings: Merriweather (serif)
- Font body: Nunito (sans-serif)
- Border radius: 8px
- Max content width: 900px
- Min body font-size: 18px

## Regels
- Mobile-first altijd
- Nederlandse content
- Toegankelijk (WCAG AA)
- Geen console.logs in commits
- Geen `any` types
- Elke pagina heeft meta title + description

## Don'ts
- Geen purple/blue gradients
- Geen generic hero met centered text over gradient
- Geen "Most Popular" badges op pricing cards
- Geen stock-foto uitstraling
```

**Gebruik:** Open Claude Code in je project folder → hij leest CLAUDE.md automatisch.

### Win 3: Plan-first aanpak

Voordat je Claude Code laat bouwen, laat hem eerst plannen.

**Prompt:**
```
Maak een implementatieplan voor de contactpagina van tuinwoning.nl.
Lijst alle componenten, de volgorde waarin ze gebouwd moeten worden,
en welke dependencies er zijn. Schrijf nog geen code.
```

Claude Code maakt dan een gestructureerd plan. Daarna:
```
Voer stap 1 van het plan uit.
```

**Waarom dit werkt:** Claude Code gaat niet meer halverwege van aanpak wisselen. Hij heeft een roadmap.

### Win 4: Search-first workflow

Laat Claude Code eerst onderzoeken voordat hij bouwt.

**Voorbeelden:**
```
Zoek in de Next.js 16 docs hoe de nieuwe proxy.ts werkt.
Geef me een samenvatting, schrijf nog geen code.
```

```
Bekijk hoe react-hook-form werkt met Zod validation in Next.js.
Zoek een voorbeeld, pas het dan toe op ons contactformulier.
```

```
Lees eerst alle bestaande componenten in src/components/ en
beschrijf de patterns die we gebruiken. Volg dezelfde patterns
voor de nieuwe ProductCard component.
```

**Waarom dit werkt:** Voorkomt dat Claude Code dingen verzint of verouderde patterns gebruikt.

---

## Dagelijks gebruik — voorbeeldprompts

### Nieuwe feature bouwen
```
1. Lees CLAUDE.md en de bestaande code in src/
2. Maak een plan voor [feature]
3. Bouw het stap voor stap, commit na elke stap
```

### Bug fixen
```
De contactpagina geeft een hydration error op mobiel.
1. Zoek eerst de oorzaak in de relevante bestanden
2. Leg uit wat er mis is
3. Fix het
```

### Code review
```
Review alle files in src/components/ op:
- TypeScript strictness (geen any)
- Unused imports
- Accessibility issues
- Mobile-first responsive design
Geef een lijst van issues gesorteerd op prioriteit.
```

### Design naar code
```
Bouw deze sectie exact na zoals het ontwerp. [screenshot]
Gebruik de design tokens uit CLAUDE.md.
Maak het responsive, mobile-first.
```

---

## Tips

1. **Nieuwe sessie per taak** — Na 15-20 berichten wordt Claude Code slordig. Start een nieuwe sessie.

2. **Kleine stukken** — "Bouw de hele homepage" → slecht. "Bouw de hero sectie" → goed.

3. **CLAUDE.md updaten** — Als je een pattern vindt die werkt, voeg het toe aan CLAUDE.md zodat Claude Code het onthoudt.

4. **Screenshots > beschrijvingen** — Als je een ontwerp hebt, stuur een screenshot mee. Claude Code begrijpt visueel beter dan tekstueel.

---

## Optioneel: Security scan (eenmalig)

```cmd
cd C:\Users\Jasper\tuinwoning
npx ecc-agentshield scan
```

Scant je CLAUDE.md en project config op security issues. Eenmalig draaien is genoeg.

---

## Wat je NIET nodig hebt van ECC

- De 36 agents (overkill voor solo dev)
- Multi-agent orchestration (voor teams)
- Continuous learning / instincts (veel overhead)
- Plugin install (cherry-pick is beter)
- Rules voor Go, Python, Java, Kotlin, Rust, PHP, Swift, C++ (gebruik je niet)
- PM2 commands (niet relevant)
- Hooks (OpenClaw doet dit al voor je)
