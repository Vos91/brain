# Cookiewall - Research & Architectuur

*Gegenereerd: 30 januari 2026*

---

## 1. Competitor Analysis

### Cookiebot (by Usercentrics)
**Pricing (EUR):**
| Plan | Prijs/maand | Subpages | Opmerking |
|------|-------------|----------|-----------|
| Free | €0 | 50 | Beperkte features |
| Lite | ~€8 | 50 | 1 domein, alle features |
| Small | €15-30 | 350 | Min 4 domeinen voor €15 |
| Medium | ~€33 | 3.500 | |
| Large | ~€55 | 7.000 | |
| Extra Large | ~€105 | 7.000+ | |

**Features:**
- ✅ Automatische cookie scanning
- ✅ Geotargeting (banner per regio)
- ✅ 47+ talen
- ✅ Custom CSS
- ✅ Cross-domain consent sharing
- ✅ Google Consent Mode v2
- ✅ IAB TCF v2.2
- ✅ A/B Testing (Advanced)
- ✅ SSO/MFA (Enterprise)
- ✅ Consent analytics

**Zwaktes:**
- 🔴 Pricing gebaseerd op subpages → onvoorspelbare kosten
- 🔴 Automatische upgrade zonder waarschuwing
- 🔴 Subdomeinen tellen als apart domein (duur!)
- 🔴 Complex pricing model
- 🔴 Script kan traag zijn (Core Web Vitals impact)

---

### CookieYes
**Pricing (USD → ~EUR):**
| Plan | Prijs/maand | Pageviews | Pages/scan |
|------|-------------|-----------|------------|
| Free | $0 | 5.000 | 100 |
| Basic | $10 (~€9) | 100.000 | 600 |
| Pro | $25 (~€23) | 300.000 | 4.000 |
| Ultimate | $55 (~€50) | Unlimited | 8.000 |

**Features:**
- ✅ Google Consent Mode v2
- ✅ IAB TCF v2.2
- ✅ Auto cookie blocking
- ✅ Geo-targeting (Pro+)
- ✅ Scheduled scans
- ✅ Privacy/Cookie Policy generators
- ✅ Multi-user access
- ✅ Custom CSS (Pro+)
- ✅ WCAG Accessibility certified

**Zwaktes:**
- 🔴 Pageview-based pricing → kan duur worden bij traffic spikes
- 🔴 Branding alleen verwijderbaar op Ultimate (€50/maand!)
- 🔴 Scan limitations op lagere tiers

---

## 2. Cookiewall Positionering

### USPs (Unique Selling Points)

1. **Flat-fee pricing** — Geen pageview/subpage limieten. €X/maand = €X/maand.
2. **NL-focus** — Nederlandse juridische teksten, AVG-compliant defaults, NL support
3. **Performance first** — Lichtgewicht script, minimale Core Web Vitals impact
4. **Simpele setup** — 1 script tag, klaar in 5 minuten
5. **Transparant** — Geen verborgen upgrades of overage fees

### Voorgestelde Pricing

| Plan | Prijs/maand | Features |
|------|-------------|----------|
| Starter | €7 | 1 domein, basis banner, NL teksten |
| Professional | €15 | 3 domeinen, custom CSS, analytics |
| Agency | €49 | 10 domeinen, white-label, API access |
| Enterprise | Custom | Unlimited, SLA, dedicated support |

*Vergelijk: Cookiebot Medium = €33/maand voor 1 domein*

---

## 3. MVP Features (v1.0)

### Must Have ✅
- [ ] Cookie scanner (detecteer cookies op website)
- [ ] Consent banner (popup/bar)
- [ ] Nederlandse standaard teksten
- [ ] Cookie categorisatie (necessary, analytics, marketing, etc.)
- [ ] Consent opslag (localStorage + server-side log)
- [ ] Script snippet voor installatie
- [ ] Dashboard (beheer banner, bekijk consents)
- [ ] AVG-compliant consent logging

### Should Have 🟡
- [ ] Google Consent Mode v2 integratie
- [ ] Custom kleuren/styling
- [ ] Meerdere domeinen per account
- [ ] Cookie auto-blocking (scripts pas laden na consent)

### Nice to Have 🟢
- [ ] Geo-targeting
- [ ] IAB TCF v2.2
- [ ] API voor headless integratie
- [ ] A/B testing banners
- [ ] Cookie policy generator

---

## 4. Technische Architectuur

### Cookie Scanning

#### Methode 1: Server-side crawling (Recommended)
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User adds     │────▶│   Job Queue      │────▶│   Puppeteer/    │
│   domain        │     │   (Bull/Redis)   │     │   Playwright    │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────────┐
                                               │  Headless Browser   │
                                               │  - Visit pages      │
                                               │  - Intercept cookies│
                                               │  - Log network      │
                                               └────────┬────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────────┐
                                               │  Cookie Database    │
                                               │  - Name, domain     │
                                               │  - Category (AI?)   │
                                               │  - Expiry, secure   │
                                               └─────────────────────┘
```

**Implementatie:**
```typescript
// Puppeteer cookie scanner
import puppeteer from 'puppeteer';

async function scanWebsite(url: string, maxPages: number = 50) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const cookies: CookieInfo[] = [];
  
  // Intercept cookies
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');
  
  client.on('Network.responseReceivedExtraInfo', (params) => {
    const setCookie = params.headers['set-cookie'];
    if (setCookie) {
      // Parse and store cookies
      cookies.push(...parseCookies(setCookie, url));
    }
  });
  
  // Visit page
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Get cookies from browser
  const browserCookies = await page.cookies();
  cookies.push(...browserCookies.map(c => ({
    name: c.name,
    domain: c.domain,
    path: c.path,
    expires: c.expires,
    httpOnly: c.httpOnly,
    secure: c.secure,
    sameSite: c.sameSite,
  })));
  
  await browser.close();
  return deduplicateCookies(cookies);
}
```

#### Cookie Categorization
Gebruik een combinatie van:
1. **Known cookie database** — Grote lijst van bekende cookies (Google Analytics, Facebook Pixel, etc.)
2. **Pattern matching** — Regex voor common naming patterns
3. **AI classification** — Voor onbekende cookies, gebruik LLM om te categoriseren

```typescript
const KNOWN_COOKIES: Record<string, CookieCategory> = {
  // Necessary
  'PHPSESSID': 'necessary',
  'csrf_token': 'necessary',
  'session_id': 'necessary',
  
  // Analytics
  '_ga': 'analytics',
  '_gid': 'analytics',
  '_gat': 'analytics',
  'amplitude_id': 'analytics',
  '_hjid': 'analytics',
  
  // Marketing
  '_fbp': 'marketing',
  '_gcl_au': 'marketing',
  'IDE': 'marketing',
  '_uetsid': 'marketing',
  
  // Preferences
  'locale': 'preferences',
  'language': 'preferences',
  'theme': 'preferences',
};

function categorizeCookie(cookie: CookieInfo): CookieCategory {
  // 1. Check known database
  if (KNOWN_COOKIES[cookie.name]) {
    return KNOWN_COOKIES[cookie.name];
  }
  
  // 2. Pattern matching
  if (cookie.name.startsWith('_ga') || cookie.name.includes('analytics')) {
    return 'analytics';
  }
  if (cookie.name.includes('fbp') || cookie.name.includes('ads')) {
    return 'marketing';
  }
  
  // 3. Default to 'unknown' for manual review
  return 'unknown';
}
```

---

### Consent Banner Script

```typescript
// cookiewall.js - Embedded script (< 10KB gzipped)
(function(window, document) {
  const CONFIG_ENDPOINT = 'https://api.cookiewall.nl/v1/config';
  const CONSENT_ENDPOINT = 'https://api.cookiewall.nl/v1/consent';
  
  // Load config for this domain
  const siteId = document.currentScript.dataset.siteId;
  
  async function init() {
    // Check existing consent
    const existingConsent = getConsent();
    if (existingConsent && !isExpired(existingConsent)) {
      applyConsent(existingConsent);
      return;
    }
    
    // Fetch banner config
    const config = await fetch(`${CONFIG_ENDPOINT}/${siteId}`).then(r => r.json());
    
    // Render banner
    renderBanner(config);
  }
  
  function renderBanner(config) {
    const banner = document.createElement('div');
    banner.id = 'cookiewall-banner';
    banner.innerHTML = `
      <div class="cw-container" style="${config.customCss}">
        <div class="cw-content">
          <h3>${config.title || 'Cookie instellingen'}</h3>
          <p>${config.description || 'Wij gebruiken cookies...'}</p>
        </div>
        <div class="cw-actions">
          <button class="cw-btn cw-accept-all">Alles accepteren</button>
          <button class="cw-btn cw-reject-all">Alleen noodzakelijk</button>
          <button class="cw-btn cw-customize">Aanpassen</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    
    // Event listeners
    banner.querySelector('.cw-accept-all').onclick = () => saveConsent('all');
    banner.querySelector('.cw-reject-all').onclick = () => saveConsent('necessary');
    banner.querySelector('.cw-customize').onclick = () => showPreferences(config);
  }
  
  function saveConsent(level) {
    const consent = {
      level,
      timestamp: Date.now(),
      categories: getCategories(level),
    };
    
    // Store locally
    localStorage.setItem('cookiewall_consent', JSON.stringify(consent));
    
    // Log to server (async, non-blocking)
    navigator.sendBeacon(CONSENT_ENDPOINT, JSON.stringify({
      siteId,
      visitorId: getVisitorId(),
      consent,
      userAgent: navigator.userAgent,
    }));
    
    // Apply and hide banner
    applyConsent(consent);
    hideBanner();
  }
  
  function applyConsent(consent) {
    // Google Consent Mode v2
    if (window.gtag) {
      gtag('consent', 'update', {
        'analytics_storage': consent.categories.includes('analytics') ? 'granted' : 'denied',
        'ad_storage': consent.categories.includes('marketing') ? 'granted' : 'denied',
        'ad_personalization': consent.categories.includes('marketing') ? 'granted' : 'denied',
        'ad_user_data': consent.categories.includes('marketing') ? 'granted' : 'denied',
      });
    }
    
    // Dispatch event for custom integrations
    window.dispatchEvent(new CustomEvent('cookiewall:consent', { detail: consent }));
  }
  
  init();
})(window, document);
```

---

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard (Next.js)          │  Embedded Script (Vanilla JS)  │
│  - Site management            │  - Banner rendering             │
│  - Banner customization       │  - Consent collection           │
│  - Analytics                  │  - Cookie blocking              │
│  - Scan results               │  - Google Consent Mode          │
└──────────────┬────────────────┴──────────────┬──────────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API (Next.js API Routes)               │
├─────────────────────────────────────────────────────────────────┤
│  /api/sites          - CRUD sites                               │
│  /api/scans          - Trigger/get scan results                 │
│  /api/consent        - Log consent (high volume!)               │
│  /api/config/:siteId - Get banner config (CDN cached)           │
│  /api/analytics      - Consent statistics                       │
└──────────────┬────────────────┬─────────────┬───────────────────┘
               │                │             │
               ▼                ▼             ▼
┌──────────────────┐  ┌────────────────┐  ┌───────────────────────┐
│    Supabase      │  │  Redis/Bull    │  │   Puppeteer Workers   │
│    (PostgreSQL)  │  │  (Job Queue)   │  │   (Cookie Scanning)   │
│                  │  │                │  │                       │
│  - Users         │  │  - Scan jobs   │  │  - Headless browser   │
│  - Sites         │  │  - Scheduled   │  │  - Cookie intercept   │
│  - Cookies       │  │    rescans     │  │  - Page crawling      │
│  - Consents      │  │                │  │                       │
└──────────────────┘  └────────────────┘  └───────────────────────┘
```

---

## 5. Database Schema (Supabase/PostgreSQL)

```sql
-- Organizations (voor agency/enterprise)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter', -- starter, professional, agency, enterprise
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sites (domains)
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  domain TEXT NOT NULL, -- example.com
  name TEXT, -- "Main Website"
  status TEXT DEFAULT 'pending', -- pending, active, paused
  
  -- Banner configuration
  banner_config JSONB DEFAULT '{
    "position": "bottom",
    "layout": "bar",
    "theme": "light",
    "primaryColor": "#0066cc",
    "title": "Cookie instellingen",
    "description": "Wij gebruiken cookies om uw ervaring te verbeteren.",
    "acceptAllText": "Alles accepteren",
    "rejectAllText": "Alleen noodzakelijk",
    "customizeText": "Aanpassen",
    "privacyPolicyUrl": null,
    "cookiePolicyUrl": null,
    "customCss": null
  }'::jsonb,
  
  -- Settings
  google_consent_mode BOOLEAN DEFAULT true,
  auto_blocking BOOLEAN DEFAULT false,
  geo_targeting BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, domain)
);

-- Cookie Scans
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  pages_scanned INTEGER DEFAULT 0,
  cookies_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discovered Cookies
CREATE TABLE cookies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  path TEXT DEFAULT '/',
  
  -- Classification
  category TEXT NOT NULL DEFAULT 'unknown', -- necessary, analytics, marketing, preferences, unknown
  category_auto BOOLEAN DEFAULT true, -- auto-classified or manual override
  
  -- Cookie properties
  expires_seconds INTEGER, -- NULL = session cookie
  http_only BOOLEAN DEFAULT false,
  secure BOOLEAN DEFAULT false,
  same_site TEXT, -- strict, lax, none
  
  -- Metadata
  description TEXT, -- User-editable description
  provider TEXT, -- "Google Analytics", "Facebook", etc.
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(site_id, name, domain)
);

-- Consent Logs (high volume - consider partitioning)
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  visitor_id TEXT NOT NULL, -- Anonymous visitor identifier
  
  -- Consent details
  consent_level TEXT NOT NULL, -- all, necessary, custom
  categories TEXT[] NOT NULL, -- ['necessary', 'analytics']
  
  -- Metadata
  ip_hash TEXT, -- Hashed IP for geo (not stored raw)
  country_code TEXT, -- NL, DE, etc.
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for analytics queries
  INDEX idx_consents_site_created (site_id, created_at)
);

-- Partitioning for consents (monthly)
-- Consider: https://www.postgresql.org/docs/current/ddl-partitioning.html

-- Views for analytics
CREATE VIEW consent_stats AS
SELECT 
  site_id,
  DATE_TRUNC('day', created_at) as date,
  consent_level,
  COUNT(*) as count
FROM consents
GROUP BY site_id, DATE_TRUNC('day', created_at), consent_level;

-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookies ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Users can only see their organization's data
CREATE POLICY "Users can view own org" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own org sites" ON sites
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- etc for other tables...
```

---

## 6. Volgende Stappen

### Week 1
- [ ] Project setup (Next.js + Supabase)
- [ ] Database schema implementeren
- [ ] Basis auth flow
- [ ] Cookie scanner prototype (Puppeteer)

### Week 2
- [ ] Banner script (embedded JS)
- [ ] Dashboard UI (sites beheren)
- [ ] Consent logging endpoint
- [ ] Google Consent Mode v2 integratie

### Week 3
- [ ] Landing page
- [ ] Stripe integratie
- [ ] Beta test met Media Solutions klanten

---

## 7. Resources

- [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent?hl=en)
- [IAB TCF v2.2 Spec](https://iabeurope.eu/tcf-2-0/)
- [Puppeteer Docs](https://pptr.dev/)
- [AVG Cookie Guidelines (AP)](https://www.autoriteitpersoonsgegevens.nl/themas/internet-en-privacy/cookies)
