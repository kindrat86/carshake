# CarShake

## Overview
CarShake is a free web application that creates GPS-verified, dual-timestamped, AI-checked photo records of your car's condition before and after valet parking, car rental, or any situation where someone else handles your vehicle.

## Core Workflow
1. User opens CarShake in mobile browser before handing over keys
2. 60-second guided photo capture of all 4 vehicle sides, wheels, windshield
3. Each photo auto-tagged with GPS coordinates + dual timestamps (device + server)
4. Photos SHA-256 hashed for tamper-proof integrity
5. After pickup: repeat scan, AI compares before/after, flags new damage

## Architecture
- Frontend: Vite + React SPA, deployed to Vercel (static + SPA fallback)
- Styling: Custom CSS with Playfair Display + DM Sans typography
- Analytics: PostHog (EU), Meta Pixel, Reddit Pixel
- Storage: Supabase (photos, user records)
- Payments: Stripe (Shield+ $2.97/mo, Pro $19.97/mo)

## Key URLs
- Homepage: https://carshake.online/
- Damage Cost Calculator: https://carshake.online/tools/damage-cost-calculator
- City Guides (40+ cities): https://carshake.online/city/
- State Legal Guides (29 states): https://carshake.online/state/
- Pricing: https://carshake.online/pricing
- llms.txt: https://carshake.online/llms.txt
- openapi.json: https://carshake.online/openapi.json
- mcp.json: https://carshake.online/mcp.json
