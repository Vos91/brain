# Skills Library

Custom AI agent skills voor Claude Code, Cursor, Windsurf en andere coding assistants.

## Beschikbare Skills

| Skill | Beschrijving | Status |
|-------|--------------|--------|
| [ecommerce-copywriting](./ecommerce-copywriting/) | High-converting copy voor webshops | ✅ Lokaal |

## Installatie

### Lokaal (Clawdbot/Claude Code)

Skills in `/home/ubuntu/clawd/skills/` worden automatisch geladen.

### Via npx (publiek)

Om skills publiek beschikbaar te maken via skills.sh:

```bash
npx skills add Vos91/agent-skills/ecommerce-copywriting
```

⚠️ **Vereist publicatie op GitHub** — zie hieronder.

---

## Skills Publiceren op GitHub

### Stap 1: Repo structuur

Maak een GitHub repo met deze structuur:

```
agent-skills/
├── README.md
└── skills/
    └── ecommerce-copywriting/
        ├── SKILL.md
        └── references/
            ├── product-descriptions.md
            ├── checkout-copy.md
            ├── email-templates.md
            └── seo-ecommerce.md
```

### Stap 2: Push naar GitHub

```bash
cd ~/clawd/brain/documents/skills

# Init repo
git init agent-skills-publish
cd agent-skills-publish

# Kopieer skills
mkdir -p skills
cp -r ../ecommerce-copywriting skills/

# Commit & push
git add .
git commit -m "Add ecommerce-copywriting skill"
git remote add origin git@github.com:Vos91/agent-skills.git
git push -u origin main
```

### Stap 3: Installeer commando

Na publicatie kan iedereen installeren met:

```bash
# Hele repo (alle skills)
npx skills add Vos91/agent-skills

# Specifieke skill
npx skills add Vos91/agent-skills/ecommerce-copywriting
```

---

## Skills Ontwikkelen

### Anatomie van een Skill

```
skill-name/
├── SKILL.md (verplicht)
│   ├── YAML frontmatter (name + description)
│   └── Markdown instructies
└── references/ (optioneel)
    └── detail-docs.md
```

### Frontmatter Vereisten

```yaml
---
name: skill-name
description: Duidelijke beschrijving wanneer de skill gebruikt moet worden. 
             Dit bepaalt of de AI de skill activeert.
---
```

### Best Practices

1. **Kort & krachtig** — SKILL.md < 500 regels
2. **Progressive disclosure** — Details in references/
3. **Specifieke triggers** — Beschrijf wanneer te gebruiken
4. **Geen duplicate content** — Kies SKILL.md OF references, niet beide

---

## Links

- [skills.sh](https://skills.sh) — Skills directory
- [Skill Creator Guide](https://github.com/anthropics/skills/tree/main/skills/skill-creator)
- [Marketing Skills (voorbeeld)](https://github.com/coreyhaines31/marketingskills)
