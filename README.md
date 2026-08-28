# Capital Connect

Build a web app called "AC Intelligence" — an investor intake and venture-screening tool for a venture structuring and capital advisory firm in Africa.

CORE FEATURE (build this first):

An investor-facing intake form that captures:

1. Investor/fund name and contact email

2. Sectors and stages they typically invest in (multi-select: Clean Energy, Tech, AgTech, Fintech, Healthcare, Infrastructure, Other — plus a free-text field; stage checkboxes: Pre-seed, Seed, Series A, Growth)

3. Typical check size (dropdown or range slider, in USD)

4. What matters most in a deal — let them rank or select from: Team, Traction, Financials, Legal/Structural readiness, Ask Coherence

5. Geographies they focus on or avoid (free text or multi-select of African regions/countries)

6. Their usual process once interested — free text field for timeline/next steps

DATA + SCORING:

- Store all submissions in a database (use Supabase).

- After submission, show the investor a simple real-time summary/profile card confirming what was captured, styled cleanly — this is their "Investor Profile."

- Build a simple admin dashboard (separate route, e.g. /admin) where I can view all investor submissions in a table, sortable by sector, stage, and check size.

DESIGN:

- Clean, modern, professional fintech aesthetic — think Stripe or Carta, not generic SaaS templates.

- Primary color: deep navy or forest green with a gold/amber accent (African capital markets feel — sophisticated, not flashy).

- Mobile-responsive — many investors will fill this out on a phone.

- Include a simple landing page above the form explaining: "AC Intelligence matches vetted, structured African ventures with the right capital partners — tell us what you're looking for."

TECHNICAL:

- Use React + Supabase (auth optional for now — skip login, just capture submissions).

- Structure the code cleanly since this will be extended later with a second, founder-facing intake form and a matching engine between the two datasets.

- Add a "submitted_at" timestamp field to every entry.

Do not build the founder-facing form yet — investor intake only for this first version.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://venture-connect-africa.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ff0115c9-1e07-45ae-9d66-3efe7dd0c859).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
