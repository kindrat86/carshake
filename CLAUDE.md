# carshake — граблі та правила

## Деплой
- Статичний сайт; git author = `sales@sipiteno.com`; деплой раніше був SSO-gated — перевір перед пушем
- Vercel віддає :slug.html, а НЕ dir index — враховуй при створенні URL-ів
- УВАГА: 07-23 зафіксовано split-brain (дві версії сайту з різних джерел) — перед правками зʼясуй, яке джерело реально live

## Критичні граблі
- Глобальна Permissions-Policy БЛОКУЄ camera/geolocation — Instant Proof tool мусить використовувати file-capture (input capture), НЕ getUserMedia
- Email capture = `/api/email-capture` → Resend audience "CarShake" (durable store) + checklist send + PostHog (analytics only). Supabase видалено 2026-07-23 — компанія більше не використовує Supabase. Локальна копія: `~/.carshake/funnel.db`, синк щогодини через launchd `com.carshake.funnel-db-sync` (`scripts/sync-local-db.py`, той самий патерн що й unlocksaas). Стара `/api/subscribe` видалена — її контент (реальний "Valet Damage Playbook" checklist) перенесено в `/api/email-capture`.
- faq.html містить фабриковані статистики — не тиражувати
- carshake = Lovable, publish вручну — PostHog правки не задеплояться самі
