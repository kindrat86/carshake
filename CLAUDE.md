# carshake — граблі та правила

## Деплой
- Статичний сайт (buildCommand: null, outputDirectory: ".") → деплой напряму через Vercel CLI з кореня репо: `vercel --prod --yes`. НЕ Lovable — акаунта на Lovable більше немає, той шлях мертвий
- git author = `sales@sipiteno.com`; раніше деплой був SSO-gated — перевір перед пушем, якщо давно не пушив
- Vercel віддає :slug.html, а НЕ dir index — враховуй при створенні URL-ів
- УВАГА: 07-23 зафіксовано split-brain (дві версії сайту з різних джерел) — перед правками зʼясуй, яке джерело реально live
- OWNER_ACTIONS.md (07-23) згадує окремий "Lovable SPA bundle" (`/assets/index-*.js`) що нібито публікується окремо через Lovable — ЗАСТАРІЛО й спростовано 07-24: `assets/index-fzxhT5D0.js` — звичайний закомічений файл у цьому ж репо, редагується і деплоїться разом з усім іншим через `vercel --prod`, жодного окремого Lovable-шляху не існує

## Критичні граблі
- Глобальна Permissions-Policy БЛОКУЄ camera/geolocation — Instant Proof tool мусить використовувати file-capture (input capture), НЕ getUserMedia
- Email capture = `/api/email-capture` → Resend audience "CarShake" (durable store) + checklist send + PostHog (analytics only). Supabase видалено 2026-07-23 — компанія більше не використовує Supabase. Локальна копія: `~/.carshake/funnel.db`, синк щогодини через launchd `com.carshake.funnel-db-sync` (`scripts/sync-local-db.py`, той самий патерн що й unlocksaas). Стара `/api/subscribe` видалена — її контент (реальний "Valet Damage Playbook" checklist) перенесено в `/api/email-capture`.
- faq.html містить фабриковані статистики — не тиражувати
- carshake = Lovable, publish вручну — PostHog правки не задеплояться самі
