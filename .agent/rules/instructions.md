---
trigger: always_on
---

# Maukemana Web Project Rules

## UI Components & Design System

- **Always use shadcn/ui components** from `@/components/ui/` when available (Button, Input, Label, Switch, Textarea, Badge, Tabs, etc.)
- Install missing shadcn components with: `npx shadcn@latest add <component-name>`
- **Reference design tokens** from `app/globals.css`
- Use CSS variables: `--color-primary`, `--color-foreground`, `--color-muted-foreground`, `--color-border`, etc.
- Use `--radius` variable for consistent border radius (shadcn components use `rounded-lg`)
- Custom radius values: `--radius-default`, `--radius-lg`, `--radius-xl`
- Use Tailwind CSS utility classes
- Follow dark theme conventions (app uses dark mode by default)
- Surface colors: `bg-surface-dark`, `bg-surface-card`, `border-surfÏace-border`

## 1) Data-heavy UI rules (lists, tables, search)

- **Never render unbounded lists.** Use **pagination** or **virtualization** (or both).
  - Pagination for “business lists” (auditable, shareable results).
  - Virtualization for long scroll/feeds.
- **Filters + sorting + pagination must be URL-driven.** Persist in **query params** so state survives refresh/share/back/forward.
- **Server-side filtering/sorting for large datasets.** Client-side is only for small, already-loaded data.
- **Debounce search inputs** (e.g., 250–400ms), and **cancel in-flight requests** on changes.
- **Always handle empty/loading/error states** (skeleton, empty state CTA, retry).

## 2) State management discipline

- **URL = state for navigable views** (filters, tabs, selected time range, search keywords).
- **Global store is last resort.** Prefer:
  - Local component state for local UI
  - React Hooks for reusable logic
  - Store (e.g., Context/Zustand) only for cross-page, cross-component, long-lived state
- **Single source of truth.** Don’t duplicate the same data in 3 places (store + component + cache).
- **Reset state predictably** on route change (avoid “ghost filters” from previous pages).

## 3) API integration rules

- **All API calls go through one client layer** (typed, centralized error handling, auth, retries, base URL).
- **Never call APIs directly inside UI components** without a hook/service wrapper.
- **Normalize error handling**: map backend errors → user-friendly messages + a debug id/log.
- **Cache and revalidate** where appropriate (don’t refetch the same list 10x on minor UI changes).
- **Protect against race conditions** (latest request wins; cancel previous).

## 4) Performance as a default

- **Performance budgets**: keep initial bundle small; lazy-load routes and heavy components.
- **Use code-splitting and dynamic import** for modals, editors, charts, rich tables.
- **Optimize images**: responsive sizes, lazy loading, modern formats (Next.js Image component); never ship huge raw images.
- **Avoid expensive re-renders**: memoize computed values (useMemo, useCallback), don’t do heavy work in render loops.
- **Measure** (LCP, CLS, INP) and treat regressions like bugs.

## 5) Accessibility (must pass basic checks)

- **Keyboard navigable** for all interactive UI (tab order, focus visible).
- **Correct semantics**: buttons are buttons, links are links.
- **ARIA only when needed**, but do it right (labels, roles).
- **Color contrast** and “not only color” for status.
- **Forms**: label every input, show inline errors, announce errors for screen readers.

## 6) UX consistency rules

- **One design system** (tokens, spacing, typography, components). No custom one-offs without review.
- **Consistent loading patterns**: skeleton for pages/lists, spinner for small actions.
- **Optimistic UI** only when it won’t mislead; always provide rollback on failure.
- **Toasts are for confirmation**, not for form validation (validation stays near fields).

## 7) Reliability & resilience

- **Error boundaries / global error handling** (capture + user fallback + retry).
- **Never leave the user stuck**: if something fails, show what happened and what to do next.
- **Offline/poor network considerations**: disable double-submit, show “saving…” states, retry logic.

## 8) Security rules

- **Never trust user input**: sanitize/escape anything rendered.
- **No secrets in the frontend** (keys/tokens); use server-side proxies for sensitive operations.
- **Auth tokens**: prefer httpOnly cookies; avoid localStorage for high-risk tokens if possible.
- **Prevent XSS in dynamic content** and be careful with `dangerouslySetInnerHTML`.
- **Dependency hygiene**: keep libraries updated; block known critical CVEs.

## 9) Code quality & maintainability

- **TypeScript strict** (or as strict as realistically possible). No `any` without justification.
- **Lint + format are mandatory** in CI; no “works on my machine” styling.
- **Naming & structure conventions**: predictable folders, consistent component naming, no mystery imports.
- **Components must be small and focused**; split when it becomes “god component”.
- **No duplicate logic**: extract hooks/utilities when repeated twice.

## 10) Testing rules (minimum bar)

- **Unit tests** for critical logic (formatting, validation, state transforms).
- **Integration tests** for key flows (auth, CRUD, table filtering, checkout-like flows).
- **E2E smoke tests** for the top 3–5 user journeys.
- **PRs must not reduce coverage on critical modules** (even if overall coverage stays same).

## 11) PR / teamwork rules (the hidden superpower)

- **Small PRs**: ideally < ~400 lines diff, 1 purpose.
- **Screenshots/video for UI changes** (and responsive states).
- **Feature flags** for risky or partial work.
- **No breaking changes without a migration plan** (routes, API contracts, shared components).
- **Definition of Done** includes: loading/empty/error states + a11y pass + query param persistence (where relevant).
