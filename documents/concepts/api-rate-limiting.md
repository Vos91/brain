# API Rate Limiting

Rate limiting is essentieel voor elke publieke API om misbruik te voorkomen en kosten te beheersen.

## Implementatie Patronen

### In-Memory (Simpel)
```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, max: number, windowMs: number) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }
  
  if (entry.count < max) {
    entry.count++;
    return { success: true };
  }
  
  return { success: false, retryAfter: entry.resetTime - now };
}
```

**Pro:** Geen externe dependencies
**Con:** Werkt niet met meerdere instances

### Redis (Productie)
Gebruik `@upstash/ratelimit` of vergelijkbaar voor gedistribueerde rate limiting.

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
```

## HTTP Response

Bij rate limit overschrijding:
- Status: `429 Too Many Requests`
- Headers: `Retry-After`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Geleerde Les

Bij de Wat Eten We app: 10 requests per minuut per IP bleek een goede balans tussen bescherming en gebruiksvriendelijkheid.
