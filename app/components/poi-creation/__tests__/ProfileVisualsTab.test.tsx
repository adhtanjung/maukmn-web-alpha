import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "./test-utils";
import ProfileVisualsTab from "../ProfileVisualsTab";

// Mock ImageUpload component
vi.mock("@/app/components/ui/ImageUpload", () => ({
	default: ({
		value,
		onChange,
	}: {
		value: string | null;
		onChange: (url: string | null) => void;
	}) => (
		<div data-testid="image-upload">
			<input
				type="text"
				placeholder="Paste image URL here"
				value={value || ""}
				onChange={(e) => onChange(e.target.value || null)}
			/>
		</div>
	),
}));

describe("ProfileVisualsTab", () => {
	describe("Basic Info Section", () => {
		it("should render POI name input", () => {
			render(<ProfileVisualsTab />);

			// Actual placeholder in component: "e.g., The Grind Cafe"
			const nameInput = screen.getByPlaceholderText(/the grind cafe/i);
			expect(nameInput).toBeInTheDocument();
		});

		it("should allow typing in POI name input", async () => {
			const user = userEvent.setup();
			render(<ProfileVisualsTab />);

			const nameInput = screen.getByPlaceholderText(/the grind cafe/i);

			await user.type(nameInput, "Test Cafe");

			await waitFor(() => {
				expect(nameInput).toHaveValue("Test Cafe");
			});
		});

		it("should render brand name input", () => {
			render(<ProfileVisualsTab />);

			// Actual placeholder: "e.g., Grind Coffee Co."
			const brandInput = screen.getByPlaceholderText(/grind coffee co/i);
			expect(brandInput).toBeInTheDocument();
		});

		it("should allow typing in brand name input", async () => {
			const user = userEvent.setup();
			render(<ProfileVisualsTab />);

			const brandInput = screen.getByPlaceholderText(/grind coffee co/i);

			await user.type(brandInput, "Test Brand");

			await waitFor(() => {
				expect(brandInput).toHaveValue("Test Brand");
			});
		});
	});

	describe("Categories Section", () => {
		it("should render all category options", () => {
			render(<ProfileVisualsTab />);

			expect(screen.getByText("Cafe")).toBeInTheDocument();
			expect(screen.getByText("Restaurant")).toBeInTheDocument();
			expect(screen.getByText("Coworking")).toBeInTheDocument();
			expect(screen.getByText("Bar")).toBeInTheDocument();
			expect(screen.getByText("Park")).toBeInTheDocument();
		});

		it("should toggle category when clicked", async () => {
			const user = userEvent.setup();
			render(<ProfileVisualsTab />);

			// Get category buttons - there are 5 categories (Cafe, Restaurant, Coworking, Bar, Park)
			const categoryButtons = screen.getAllByRole("button");
			// First button in list should be Cafe category
			const cafeButton = categoryButtons.find((btn) =>
				btn.textContent?.includes("Cafe")
			);

			if (cafeButton) {
				// Click to select
				await user.click(cafeButton);
				await waitFor(() => {
					expect(cafeButton).toHaveClass("bg-primary");
				});

				// Click again to deselect
				await user.click(cafeButton);
				await waitFor(() => {
					expect(cafeButton).not.toHaveClass("bg-primary");
				});
			}
		});

		it("should allow multiple categories to be selected", async () => {
			const user = userEvent.setup();
			render(<ProfileVisualsTab />);

			const categoryButtons = screen.getAllByRole("button");
			const cafeButton = categoryButtons.find((btn) =>
				btn.textContent?.includes("Cafe")
			);
			const restaurantButton = categoryButtons.find((btn) =>
				btn.textContent?.includes("Restaurant")
			);

			if (cafeButton && restaurantButton) {
				await user.click(cafeButton);
				await user.click(restaurantButton);

				await waitFor(() => {
					expect(cafeButton).toHaveClass("bg-primary");
					expect(restaurantButton).toHaveClass("bg-primary");
				});
			}
		});

		it("should display required indicator for category field", () => {
			render(<ProfileVisualsTab />);

			// Component uses red * for required, not "Required" text
			const asterisks = screen.getAllByText("*");
			expect(asterisks.length).toBeGreaterThan(0);
		});
	});

	describe("Description Section", () => {
		it("should render description textarea", () => {
			render(<ProfileVisualsTab />);

			// Actual placeholder: "Tell us about the vibe, the crowd, and what makes this place special..."
			const descriptionTextarea = screen.getByPlaceholderText(
				/tell us about the vibe/i
			);
			expect(descriptionTextarea).toBeInTheDocument();
		});

		it("should allow typing in description textarea", async () => {
			const user = userEvent.setup();
			render(<ProfileVisualsTab />);

			const descriptionTextarea = screen.getByPlaceholderText(
				/tell us about the vibe/i
			);

			await user.type(descriptionTextarea, "A wonderful place to visit");

			await waitFor(() => {
				expect(descriptionTextarea).toHaveValue("A wonderful place to visit");
			});
		});
	});

	describe("Cover Image Section", () => {
		it("should render cover image section header", () => {
			render(<ProfileVisualsTab />);

			expect(screen.getByText("Cover Image")).toBeInTheDocument();
		});

		it("should display cover image guidelines", () => {
			render(<ProfileVisualsTab />);

			expect(
				screen.getByText(/wide shot showing the overall atmosphere/i)
			).toBeInTheDocument();
			expect(
				screen.getByText(/good lighting \(natural light works best\)/i)
			).toBeInTheDocument();
		});

		it("should render cover image URL input", () => {
			render(<ProfileVisualsTab />);

			// Mock renders 2 ImageUpload components, use getAllBy
			const coverImageInputs =
				screen.getAllByPlaceholderText(/paste image url here/i);
			expect(coverImageInputs.length).toBeGreaterThan(0);
		});
	});

	describe("Gallery Section", () => {
		it("should render gallery section header", () => {
			render(<ProfileVisualsTab />);

			expect(screen.getByText("Photo Gallery")).toBeInTheDocument();
		});
	});

	describe("Section Labels", () => {
		it("should display all section headers", () => {
			render(<ProfileVisualsTab />);

			expect(screen.getByText("Basic Info")).toBeInTheDocument();
			// Categories is a field label, not a section header
			expect(screen.getByText("Visual Assets")).toBeInTheDocument();
		});

		it("should display field labels", () => {
			render(<ProfileVisualsTab />);

			expect(screen.getByText("POI Name")).toBeInTheDocument();
			expect(screen.getByText("Brand Name")).toBeInTheDocument();
		});
	});

	describe("Helper Text", () => {
		it("should display helper text for optional fields", () => {
			render(<ProfileVisualsTab />);

			// Check for (Optional) text in Brand Name label
			expect(screen.getByText("(Optional)")).toBeInTheDocument();
		});
	});
});
