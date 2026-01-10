import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "./test-utils";
import FoodDrinkTab from "../FoodDrinkTab";

describe("FoodDrinkTab", () => {
	describe("Cuisine Section", () => {
		it("should render all cuisine options", () => {
			render(<FoodDrinkTab />);

			expect(screen.getByText("Italian")).toBeInTheDocument();
			expect(screen.getByText("Japanese")).toBeInTheDocument();
			expect(screen.getByText("Fusion")).toBeInTheDocument();
			expect(screen.getByText("Street Food")).toBeInTheDocument();
			expect(screen.getByText("Cafe")).toBeInTheDocument();
			expect(screen.getByText("Dessert")).toBeInTheDocument();
		});

		it("should select cuisine when clicked", async () => {
			const user = userEvent.setup();
			render(<FoodDrinkTab />);

			const italianButton = screen.getByRole("button", { name: /italian/i });
			await user.click(italianButton);

			await waitFor(() => {
				expect(italianButton).toHaveClass("bg-primary");
			});
		});

		it("should display Required badge", () => {
			render(<FoodDrinkTab />);
			expect(screen.getByText("Required")).toBeInTheDocument();
		});
	});

	describe("Pricing Section", () => {
		it("should render all price level options", () => {
			render(<FoodDrinkTab />);

			expect(screen.getByRole("button", { name: "$" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "$$" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "$$$" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "$$$$" })).toBeInTheDocument();
		});

		it("should select price level when clicked", async () => {
			const user = userEvent.setup();
			render(<FoodDrinkTab />);

			const priceLevelButton = screen.getByRole("button", { name: "$$" });
			await user.click(priceLevelButton);

			await waitFor(() => {
				expect(priceLevelButton).toHaveClass("bg-secondary");
			});
		});
	});

	describe("Dietary Options Section", () => {
		it("should render all dietary options", () => {
			render(<FoodDrinkTab />);

			expect(screen.getByText("Vegan")).toBeInTheDocument();
			expect(screen.getByText("Vegetarian")).toBeInTheDocument();
			expect(screen.getByText("Halal")).toBeInTheDocument();
			expect(screen.getByText("Gluten-Free")).toBeInTheDocument();
			expect(screen.getByText("Nut-Free")).toBeInTheDocument();
		});

		it("should toggle dietary option when clicked", async () => {
			const user = userEvent.setup();
			render(<FoodDrinkTab />);

			const veganButton = screen.getByRole("button", { name: /vegan/i });

			// Click to select
			await user.click(veganButton);
			await waitFor(() => {
				expect(veganButton).toHaveClass("bg-primary");
			});

			// Click again to deselect
			await user.click(veganButton);
			await waitFor(() => {
				expect(veganButton).not.toHaveClass("bg-primary");
			});
		});

		it("should allow multiple dietary options to be selected", async () => {
			const user = userEvent.setup();
			render(<FoodDrinkTab />);

			const veganButton = screen.getByRole("button", { name: /vegan/i });
			const halalButton = screen.getByRole("button", { name: /halal/i });

			await user.click(veganButton);
			await user.click(halalButton);

			await waitFor(() => {
				expect(veganButton).toHaveClass("bg-primary");
				expect(halalButton).toHaveClass("bg-primary");
			});
		});
	});

	describe("Menu Details Section", () => {
		it("should render featured items textarea", () => {
			render(<FoodDrinkTab />);

			const featuredItemsTextarea = screen.getByPlaceholderText(
				/enter signature dishes separated by commas/i
			);
			expect(featuredItemsTextarea).toBeInTheDocument();
		});

		it("should render daily specials textarea", () => {
			render(<FoodDrinkTab />);

			const specialsTextarea = screen.getByPlaceholderText(
				/enter daily specials separated by commas/i
			);
			expect(specialsTextarea).toBeInTheDocument();
		});

		it("should allow typing in featured items textarea", async () => {
			const user = userEvent.setup();
			render(<FoodDrinkTab />);

			const featuredItemsTextarea = screen.getByPlaceholderText(
				/enter signature dishes separated by commas/i
			);

			// Simple text without spaces that work with userEvent.type
			await user.type(featuredItemsTextarea, "TruffleFries");

			await waitFor(() => {
				expect(featuredItemsTextarea).toHaveValue("TruffleFries");
			});
		});

		it("should allow typing in daily specials textarea", async () => {
			const user = userEvent.setup();
			render(<FoodDrinkTab />);

			const specialsTextarea = screen.getByPlaceholderText(
				/enter daily specials separated by commas/i
			);

			await user.type(specialsTextarea, "MondaySpecial");

			await waitFor(() => {
				expect(specialsTextarea).toHaveValue("MondaySpecial");
			});
		});
	});

	describe("Section Labels", () => {
		it("should display all section headers", () => {
			render(<FoodDrinkTab />);

			expect(screen.getByText("Cuisine")).toBeInTheDocument();
			expect(screen.getByText("Pricing")).toBeInTheDocument();
			expect(screen.getByText("Dietary Options")).toBeInTheDocument();
			expect(screen.getByText("Menu Details")).toBeInTheDocument();
		});
	});
});
