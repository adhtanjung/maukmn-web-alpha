import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "./test-utils";
import LocationTab from "../LocationTab";

// Mock the Map components since WebGL is not available in test environment
vi.mock("@/components/ui/map", () => ({
	Map: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="mock-map">{children}</div>
	),
	MapMarker: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="mock-marker">{children}</div>
	),
	MarkerContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	MapControls: () => <div data-testid="mock-controls" />,
}));

describe("LocationTab", () => {
	describe("Address Section", () => {
		it("should render address input", () => {
			render(<LocationTab />);

			// Actual placeholder: "Enter street address"
			const addressInput = screen.getByPlaceholderText(/enter street address/i);
			expect(addressInput).toBeInTheDocument();
		});

		it("should allow typing in address input", async () => {
			const user = userEvent.setup();
			render(<LocationTab />);

			const addressInput = screen.getByPlaceholderText(/enter street address/i);

			await user.type(addressInput, "123 Main Street");

			await waitFor(() => {
				expect(addressInput).toHaveValue("123 Main Street");
			});
		});

		it("should render floor/unit input", () => {
			render(<LocationTab />);

			// Actual placeholder: "e.g. Floor 3, Unit 12A"
			const floorUnitInput = screen.getByPlaceholderText(/floor 3, unit 12a/i);
			expect(floorUnitInput).toBeInTheDocument();
		});

		it("should allow typing in floor/unit input", async () => {
			const user = userEvent.setup();
			render(<LocationTab />);

			const floorUnitInput = screen.getByPlaceholderText(/floor 3, unit 12a/i);

			await user.type(floorUnitInput, "2nd Floor");

			await waitFor(() => {
				expect(floorUnitInput).toHaveValue("2nd Floor");
			});
		});
	});

	describe("Public Transport Section", () => {
		it("should render public transport input", () => {
			render(<LocationTab />);

			// Actual placeholder: "e.g. 5 min walk from Central Station"
			const transportInput = screen.getByPlaceholderText(
				/5 min walk from central station/i
			);
			expect(transportInput).toBeInTheDocument();
		});

		it("should allow typing in public transport input", async () => {
			const user = userEvent.setup();
			render(<LocationTab />);

			const transportInput = screen.getByPlaceholderText(
				/5 min walk from central station/i
			);

			await user.type(transportInput, "Near subway station");

			await waitFor(() => {
				expect(transportInput).toHaveValue("Near subway station");
			});
		});
	});

	describe("Parking Options Section", () => {
		it("should render all parking options", () => {
			render(<LocationTab />);

			// Actual parking options: Car Parking, Motorcycle, Valet
			expect(screen.getByText("Car Parking")).toBeInTheDocument();
			expect(screen.getByText("Motorcycle")).toBeInTheDocument();
			expect(screen.getByText("Valet")).toBeInTheDocument();
		});

		it("should toggle parking option when clicked", async () => {
			const user = userEvent.setup();
			render(<LocationTab />);

			// Get Car Parking button
			const carParkingButton = screen.getByRole("button", {
				name: /car parking/i,
			});

			// Click to select
			await user.click(carParkingButton);
			await waitFor(() => {
				expect(carParkingButton).toHaveClass("bg-primary");
			});

			// Click again to deselect
			await user.click(carParkingButton);
			await waitFor(() => {
				expect(carParkingButton).not.toHaveClass("bg-primary");
			});
		});

		it("should allow multiple parking options to be selected", async () => {
			const user = userEvent.setup();
			render(<LocationTab />);

			const carParkingButton = screen.getByRole("button", {
				name: /car parking/i,
			});
			const motorcycleButton = screen.getByRole("button", {
				name: /motorcycle/i,
			});

			await user.click(carParkingButton);
			await user.click(motorcycleButton);

			await waitFor(() => {
				expect(carParkingButton).toHaveClass("bg-primary");
				expect(motorcycleButton).toHaveClass("bg-primary");
			});
		});
	});

	describe("Accessibility Section", () => {
		it("should render wheelchair accessible switch", () => {
			render(<LocationTab />);

			expect(
				screen.getByRole("switch", { name: /wheelchair accessible/i })
			).toBeInTheDocument();
		});

		it("should toggle wheelchair accessible switch", async () => {
			const user = userEvent.setup();
			render(<LocationTab />);

			const wheelchairSwitch = screen.getByRole("switch", {
				name: /wheelchair accessible/i,
			});

			expect(wheelchairSwitch).not.toBeChecked();

			await user.click(wheelchairSwitch);

			await waitFor(() => {
				expect(wheelchairSwitch).toBeChecked();
			});
		});
	});

	describe("Map Section", () => {
		it("should render map container", () => {
			render(<LocationTab />);

			// Mock map should be present
			expect(screen.getByTestId("mock-map")).toBeInTheDocument();
		});

		it("should render Use Current Location button", () => {
			render(<LocationTab />);

			// Button has aria-label: "Use my current location"
			expect(
				screen.getByRole("button", { name: /use my current location/i })
			).toBeInTheDocument();
		});
	});

	describe("Section Labels", () => {
		it("should display all section headers", () => {
			render(<LocationTab />);

			// Actual section headers
			expect(screen.getByText("Physical Address")).toBeInTheDocument();
			expect(screen.getByText("Nearest Public Transport")).toBeInTheDocument();
			expect(screen.getByText("Parking Availability")).toBeInTheDocument();
		});

		it("should display wheelchair accessible section", () => {
			render(<LocationTab />);

			expect(screen.getByText("Wheelchair Accessible")).toBeInTheDocument();
		});
	});
	describe("Manual Address Override", () => {
		it("should render override switch", () => {
			render(<LocationTab />);
			expect(screen.getByLabelText("Manual Override")).toBeInTheDocument();
		});

		it("should show lat/long inputs when override is enabled", async () => {
			const user = userEvent.setup();
			render(<LocationTab />);

			const overrideSwitch = screen.getByLabelText("Manual Override");
			await user.click(overrideSwitch);

			await waitFor(() => {
				expect(screen.getByText("Latitude")).toBeInTheDocument();
				expect(screen.getByText("Longitude")).toBeInTheDocument();
			});
		});

		it("should hide lat/long inputs when override is disabled", async () => {
			const user = userEvent.setup();
			render(<LocationTab />);

			const overrideSwitch = screen.getByLabelText("Manual Override");

			// Enable
			await user.click(overrideSwitch);
			await waitFor(() => {
				expect(screen.getByText("Latitude")).toBeInTheDocument();
			});

			// Disable
			await user.click(overrideSwitch);
			await waitFor(() => {
				expect(screen.queryByText("Latitude")).not.toBeInTheDocument();
			});
		});
	});
});
