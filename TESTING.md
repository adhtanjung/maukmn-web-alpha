# Testing Guide

This document provides an overview of the testing infrastructure for the Maukemana web application.

## Testing Stack

- **Unit & Integration Tests**: [Vitest](https://vitest.dev/) with React Testing Library
- **E2E Tests**: [Playwright](https://playwright.dev/)

## Available Test Commands

```bash
# Run all unit and integration tests (once)
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Open Vitest UI for interactive testing
pnpm test:ui

# Run E2E tests with Playwright
pnpm test:e2e
```

## Test Structure

### Unit Tests

Unit tests are located next to the files they test with a `.test.ts` or `.test.tsx` extension.

**Example**: `lib/utils.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
	it("should merge class names correctly", () => {
		expect(cn("px-2", "py-1")).toBe("px-2 py-1");
	});
});
```

### Integration Tests

Integration tests focus on testing hooks and component interactions. They are also co-located with the code they test.

**Example**: `app/hooks/useFilters.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilters } from "./useFilters";

describe("useFilters hook", () => {
	it("should initialize with default filters", () => {
		const { result } = renderHook(() => useFilters());
		expect(result.current.activeFilterCount).toBe(0);
	});
});
```

### E2E Tests

E2E tests are located in the `tests/e2e/` directory and use Playwright.

**Example**: `tests/e2e/smoke.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test("should load the discovery page successfully", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/Maukemana/i);
});
```

## Writing Tests

### Testing Rules (from project guidelines)

1. **Unit tests** for critical logic (formatting, validation, state transforms)
2. **Integration tests** for key flows (auth, CRUD, table filtering, checkout-like flows)
3. **E2E smoke tests** for the top 3–5 user journeys
4. **PRs must not reduce coverage on critical modules**

### Best Practices

#### Unit Tests

- Test pure functions and utilities
- Focus on edge cases and error handling
- Keep tests simple and focused on one thing
- Use descriptive test names

#### Integration Tests

- Test hooks with `renderHook` from `@testing-library/react`
- Test component interactions with `render` from `@testing-library/react`
- Use `act()` for state updates
- Mock external dependencies (API calls, etc.)

#### E2E Tests

- Test critical user journeys
- Keep tests stable and reliable
- Use data-testid attributes for stable selectors
- Test responsive behavior on different viewports

## Configuration

### Vitest Configuration

Located in `vitest.config.mts`:

```typescript
export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		exclude: ["**/node_modules/**", "**/tests/e2e/**"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
});
```

### Playwright Configuration

Located in `playwright.config.ts`:

```typescript
export default defineConfig({
	testDir: "./tests/e2e",
	use: {
		baseURL: "http://localhost:3000",
	},
	webServer: {
		command: "npm run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
	},
});
```

## Current Test Coverage

### Unit Tests

- ✅ `lib/utils.ts` - cn utility function

### Integration Tests

- ✅ `app/hooks/useFilters.ts` - Filter state management and query building

### E2E Tests

- ✅ Discovery page load
- ✅ Navigation (map view, bottom nav)
- ✅ Filter drawer interaction
- ✅ Responsive design (mobile/desktop)
- ✅ Authentication (browsing without login)

## Adding New Tests

### Adding a Unit Test

1. Create a `.test.ts` file next to the file you're testing
2. Import the necessary testing utilities from `vitest`
3. Write your test cases using `describe` and `it` blocks
4. Run `pnpm test` to verify

### Adding an Integration Test

1. Create a `.test.tsx` file for component tests or `.test.ts` for hook tests
2. Use `@testing-library/react` utilities (`render`, `renderHook`, `screen`, etc.)
3. Test user interactions and state changes
4. Run `pnpm test` to verify

### Adding an E2E Test

1. Create a `.spec.ts` file in `tests/e2e/`
2. Use Playwright's `test` and `expect` APIs
3. Test complete user flows
4. Run `pnpm test:e2e` to verify

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run unit tests
  run: pnpm test

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e
```

## Debugging Tests

### Vitest

- Use `pnpm test:ui` to open the interactive UI
- Add `console.log()` statements in your tests
- Use `it.only()` to run a single test

### Playwright

- Use `await page.pause()` to pause execution and inspect
- Run with `--debug` flag: `npx playwright test --debug`
- Use `--headed` to see the browser: `npx playwright test --headed`
- Check screenshots and videos in `test-results/` after failures

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
