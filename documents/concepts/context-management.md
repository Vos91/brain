# Context Management voor AI Agents

*Geleerd: 2026-02-01*

## Core Inzichten

### 1. CLAUDE.md/AGENTS.md als Forcing Function
> "Keeping your CLAUDE.md as short as possible is a fantastic forcing function for simplifying your codebase and internal tooling."

Niet alles documenteren. Alleen:
- Wat vaak fout gaat (guardrails)
- Commands die je regelmatig nodig hebt
- Afwijkingen van standaard patronen

### 2. Don't Just Say "Never"
Vermijd negatieve constraints zonder alternatief:
- ❌ "Never use the --foo flag"
- ✅ "Never use --foo, prefer --bar instead"

De agent raakt vast als hij denkt dat hij iets moet gebruiken maar het niet mag.

### 3. Context Window Management
Een verse sessie in een grote repo kost ~20k tokens (10% van 200k). De rest vult snel met:
- Conversation history
- File reads
- Command outputs

**Strategieën:**
- `/clear` + catchup voor simple restarts
- "Document & Clear" voor complexe taken
- Vermijd auto-compaction (opaque, error-prone)

### 4. Document & Clear Pattern
Voor taken die meerdere sessies overspannen:
1. Laat Claude plan + voortgang naar een `.md` dumpen
2. Clear de sessie
3. Start nieuwe sessie: "Lees X.md en ga verder"

Dit creëert durable external memory.

### 5. Sub-agents Overwegen
Sub-agents zijn krachtig maar hebben trade-offs:
- **Pro:** Schone context, parallelle uitvoering
- **Con:** Gatekeep context, forceer rigide workflow

Gebruik ze voor echt geïsoleerde taken, niet voor alles.

### 6. @-File Mentioning
Niet hele docs embedden in AGENTS.md via @-mentions. Dat bloat de context.

In plaats daarvan: verwijs naar het pad met context wanneer te lezen:
> "For complex X usage or FooBarError, see path/to/docs.md"

## Bronnen
- [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [Creating the Perfect CLAUDE.md](https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/)
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
