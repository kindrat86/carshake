# carshake — граблі та правила

## Деплой
- Статичний сайт; git author = `sales@sipiteno.com`; деплой раніше був SSO-gated — перевір перед пушем
- Vercel віддає :slug.html, а НЕ dir index — враховуй при створенні URL-ів
- УВАГА: 07-23 зафіксовано split-brain (дві версії сайту з різних джерел) — перед правками зʼясуй, яке джерело реально live

## Критичні граблі
- Глобальна Permissions-Policy БЛОКУЄ camera/geolocation — Instant Proof tool мусить використовувати file-capture (input capture), НЕ getUserMedia
- CSP блокує Supabase email capture — ймовірна причина 0 підписників; не додавай нових зовнішніх endpoint-ів без правки CSP
- faq.html містить фабриковані статистики — не тиражувати
- carshake = Lovable, publish вручну — PostHog правки не задеплояться самі
