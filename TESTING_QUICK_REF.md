# Testing Quick Reference

## 🚀 Quick Start

```bash
# Run all tests
pnpm test

# Watch mode (auto-rerun on changes)
pnpm test:watch

# Interactive UI
pnpm test:ui

# E2E tests
pnpm test:e2e
```

## 📝 Writing Tests

### Unit Test Template

```typescript
import { describe, it, expect } from "vitest";

describe("MyFunction", () => {
	it("should do something", () => {
		expect(myFunction()).toBe(expected);
	});
});
```

### Hook Test Template

```typescript
import { renderHook, act } from "@testing-library/react";

describe("useMyHook", () => {
	it("should work", () => {
		const { result } = renderHook(() => useMyHook());

		act(() => {
			result.current.doSomething();
		});

		expect(result.current.value).toBe(expected);
	});
});
```

### Component Test Template

```typescript
import { render, screen } from "@testing-library/react";

describe("MyComponent", () => {
	it("should render", () => {
		render(<MyComponent />);
		expect(screen.getByText("Hello")).toBeInTheDocument();
	});
});
```

### E2E Test Template

```typescript
import { test, expect } from "@playwright/test";

test("should do something", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/Expected/);
});
```

## 🎯 Common Matchers

```typescript
// Vitest / Jest-DOM
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).toContain(item);
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveClass("className");

// Playwright
await expect(page).toHaveTitle(/Title/);
await expect(element).toBeVisible();
await expect(element).toHaveText("text");
```

## 🐛 Debugging

```bash
# Run single test file
pnpm test path/to/test.test.ts

# Run tests matching pattern
pnpm test --grep "pattern"

# Debug E2E with UI
npx playwright test --ui

# Debug E2E with browser visible
npx playwright test --headed --debug
```

## 📊 Current Coverage

- ✅ Utils: `lib/utils.test.ts` (5 tests)
- ✅ Hooks: `app/hooks/useFilters.test.ts` (20 tests)
- ✅ Components: `components/ui/button.test.tsx` (8 tests)
- ✅ E2E: `tests/e2e/smoke.spec.ts` (7 scenarios)

**Total: 33 tests passing**

## 📚 Resources

- Full guide: `TESTING.md`
- Implementation summary: `TEST_IMPLEMENTATION_SUMMARY.md`
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
