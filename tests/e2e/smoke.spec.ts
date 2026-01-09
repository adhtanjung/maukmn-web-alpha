import { test, expect } from "@playwright/test";

test.describe("Discovery Page - Smoke Tests", () => {
	test("should load the discovery page successfully", async ({ page }) => {
		await page.goto("/");

		// Wait for the page to be fully loaded
		await page.waitForLoadState("networkidle");

		// Check that the page title or main heading is present
		await expect(page).toHaveTitle(/Maukemana/i);
	});

	test("should display the top header with filter button", async ({ page }) => {
		await page.goto("/");

		// Check for filter button or icon
		const filterButton = page.getByRole("button", { name: /filter/i });
		await expect(filterButton).toBeVisible();
	});

	test("should display the bottom navigation", async ({ page }) => {
		await page.goto("/");

		// Check for bottom navigation items
		const nav = page.locator("nav").last(); // Assuming bottom nav is the last nav element
		await expect(nav).toBeVisible();
	});

	test("should navigate to map view", async ({ page }) => {
		await page.goto("/");

		// Click on map navigation item
		const mapLink = page.getByRole("link", { name: /map/i });
		if (await mapLink.isVisible()) {
			await mapLink.click();

			// Wait for navigation
			await page.waitForURL(/.*map.*/);

			// Verify we're on the map page
			expect(page.url()).toContain("map");
		}
	});

	test("should open filter drawer when filter button is clicked", async ({
		page,
	}) => {
		await page.goto("/");

		// Click filter button
		const filterButton = page.getByRole("button", { name: /filter/i });
		if (await filterButton.isVisible()) {
			await filterButton.click();

			// Wait for drawer to appear
			await page.waitForTimeout(500);

			// Check for filter options (adjust selector based on actual implementation)
			const drawer = page
				.locator('[role="dialog"]')
				.or(page.locator(".drawer"))
				.or(page.locator("[data-vaul-drawer]"));
			await expect(drawer.first()).toBeVisible();
		}
	});
});

test.describe("Authentication Flow - Smoke Tests", () => {
	test("should allow browsing without login", async ({ page }) => {
		await page.goto("/");

		// Verify page loads without requiring authentication
		await page.waitForLoadState("networkidle");
		await expect(page).not.toHaveURL(/.*sign-in.*/);
	});
});

test.describe("Responsive Design - Smoke Tests", () => {
	test("should render mobile layout correctly", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");

		// Check that the page is responsive
		await page.waitForLoadState("networkidle");

		// Verify mobile-specific elements are visible
		const bottomNav = page.locator("nav").last();
		await expect(bottomNav).toBeVisible();
	});

	test("should render desktop layout correctly", async ({ page }) => {
		// Set desktop viewport
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto("/");

		// Check that the page is responsive
		await page.waitForLoadState("networkidle");

		// Verify page renders without horizontal scroll
		const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
		const viewportWidth = await page.evaluate(() => window.innerWidth);
		expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
	});
});
