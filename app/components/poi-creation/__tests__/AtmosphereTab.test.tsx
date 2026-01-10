import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "./test-utils";
import AtmosphereTab from "../AtmosphereTab";

describe("AtmosphereTab", () => {
	describe("Vibes Section", () => {
		it("should render all vibe options", () => {
			render(<AtmosphereTab />);

			// Actual vibes in component: Industrial, Cozy, Tropical, Minimalist, Luxury, Retro, Nature
			expect(screen.getByText("Industrial")).toBeInTheDocument();
			expect(screen.getByText("Cozy")).toBeInTheDocument();
			expect(screen.getByText("Tropical")).toBeInTheDocument();
			expect(screen.getByText("Minimalist")).toBeInTheDocument();
			expect(screen.getByText("Luxury")).toBeInTheDocument();
			expect(screen.getByText("Retro")).toBeInTheDocument();
			expect(screen.getByText("Nature")).toBeInTheDocument();
		});

		it("should toggle vibe when clicked", async () => {
			const user = userEvent.setup();
			render(<AtmosphereTab />);

			const cozyButton = screen.getByRole("button", { name: /cozy/i });

			// Click to select
			await user.click(cozyButton);
			await waitFor(() => {
				expect(cozyButton).toHaveClass("bg-primary");
			});

			// Click again to deselect
			await user.click(cozyButton);
			await waitFor(() => {
				expect(cozyButton).not.toHaveClass("bg-primary");
			});
		});

		it("should allow multiple vibes to be selected", async () => {
			const user = userEvent.setup();
			render(<AtmosphereTab />);

			const cozyButton = screen.getByRole("button", { name: /cozy/i });
			const tropicalButton = screen.getByRole("button", { name: /tropical/i });

			await user.click(cozyButton);
			await user.click(tropicalButton);

			await waitFor(() => {
				expect(cozyButton).toHaveClass("bg-primary");
				expect(tropicalButton).toHaveClass("bg-primary");
			});
		});
	});

	describe("Lighting Section", () => {
		it("should render all lighting options", () => {
			render(<AtmosphereTab />);

			expect(screen.getByText("Bright")).toBeInTheDocument();
			expect(screen.getByText("Moderate")).toBeInTheDocument();
			expect(screen.getByText("Dim")).toBeInTheDocument();
			expect(screen.getByText("Natural")).toBeInTheDocument();
		});

		it("should select lighting option when clicked", async () => {
			const user = userEvent.setup();
			render(<AtmosphereTab />);

			// Lighting buttons are radio buttons, accessible name includes icon text
			const dimButton = screen.getByRole("radio", { name: /dim/i });
			await user.click(dimButton);

			await waitFor(() => {
				expect(dimButton).toHaveAttribute("aria-checked", "true");
			});
		});

		it("should display lighting options container", () => {
			render(<AtmosphereTab />);

			// Check that the lighting radiogroup exists
			const lightingGroup = screen.getByRole("radiogroup", {
				name: /lighting/i,
			});
			expect(lightingGroup).toBeInTheDocument();
		});
	});

	describe("Crowd Type Section", () => {
		it("should render all crowd type options", () => {
			render(<AtmosphereTab />);

			expect(screen.getByText("Students")).toBeInTheDocument();
			expect(screen.getByText("Professionals")).toBeInTheDocument();
			expect(screen.getByText("Families")).toBeInTheDocument();
			expect(screen.getByText("Tourists")).toBeInTheDocument();
			expect(screen.getByText("Locals")).toBeInTheDocument();
		});

		it("should toggle crowd type when clicked", async () => {
			const user = userEvent.setup();
			render(<AtmosphereTab />);

			const studentsButton = screen.getByRole("button", { name: /students/i });

			// Click to select
			await user.click(studentsButton);
			await waitFor(() => {
				expect(studentsButton).toHaveClass("bg-primary");
			});

			// Click again to deselect
			await user.click(studentsButton);
			await waitFor(() => {
				expect(studentsButton).not.toHaveClass("bg-primary");
			});
		});

		it("should allow multiple crowd types to be selected", async () => {
			const user = userEvent.setup();
			render(<AtmosphereTab />);

			const studentsButton = screen.getByRole("button", { name: /students/i });
			const professionalsButton = screen.getByRole("button", {
				name: /professionals/i,
			});

			await user.click(studentsButton);
			await user.click(professionalsButton);

			await waitFor(() => {
				expect(studentsButton).toHaveClass("bg-primary");
				expect(professionalsButton).toHaveClass("bg-primary");
			});
		});
	});

	// Note: Music section has been removed from the component

	describe("Cleanliness Section", () => {
		it("should render all cleanliness options", () => {
			render(<AtmosphereTab />);

			expect(screen.getByText("Poor")).toBeInTheDocument();
			expect(screen.getByText("Average")).toBeInTheDocument();
			expect(screen.getByText("Clean")).toBeInTheDocument();
			expect(screen.getByText("Spotless")).toBeInTheDocument();
		});

		it("should select cleanliness level when clicked", async () => {
			const user = userEvent.setup();
			render(<AtmosphereTab />);

			// Button text includes icon, so use /clean/i to match
			const cleanButton = screen.getByRole("button", { name: /clean/i });
			await user.click(cleanButton);

			await waitFor(() => {
				expect(cleanButton).toHaveClass("bg-primary");
			});
		});
	});

	describe("Section Labels", () => {
		it("should display all section headers", () => {
			render(<AtmosphereTab />);

			// Actual section names in component
			expect(screen.getByText("The Vibe")).toBeInTheDocument();
			expect(screen.getByText("Lighting")).toBeInTheDocument();
			expect(screen.getByText("Crowd Type")).toBeInTheDocument();
			expect(screen.getByText("Cleanliness")).toBeInTheDocument();
		});
	});
});
