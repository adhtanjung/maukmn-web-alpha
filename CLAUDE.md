# Maukemana Web Project Rules

## UI Components

- **Always use shadcn/ui components** from `@/components/ui/` when available (Button, Input, Label, Switch, Textarea, Badge, Tabs, etc.)
- Install missing shadcn components with: `npx shadcn@latest add <component-name>`

## Design System

- **Reference design tokens** from `app/globals.css`
- Use CSS variables: `--color-primary`, `--color-foreground`, `--color-muted-foreground`, `--color-border`, etc.
- Use `--radius` variable for consistent border radius (shadcn components use `rounded-lg`)
- Custom radius values: `--radius-default`, `--radius-lg`, `--radius-xl`

## Styling

- Use Tailwind CSS utility classes
- Follow dark theme conventions (app uses dark mode by default)
- Surface colors: `bg-surface-dark`, `bg-surface-card`, `border-surface-border`
