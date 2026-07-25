# AgriSense Market

React marketplace for **produce** and **farm inputs**, with a separate **admin console**.

## Features

### Client (guest-first)
- Browse produce & farm inputs without signing in
- Cart + checkout — **login/register only when paying**
- Orders history after login
- “Download app” page for scan / soil pH / yield / weather (not on web)

### Admin
- Dashboard revenue & KPIs
- Add / edit / delete produce & inputs
- Manage order status
- Refund payments
- Manage users
- Revenue & refund reports

Data persists in `localStorage` (demo store).

## Run

```bash
cd agrisense-market
npm install
npm run dev
```

## Demo accounts

| Role | Login | Password |
|------|-------|----------|
| Admin | `admin@agrisense.ug` | `admin123` |
| Customer | `amina@example.com` | `farmer123` |

Admin: http://localhost:5173/admin/login  
Store: http://localhost:5173/
