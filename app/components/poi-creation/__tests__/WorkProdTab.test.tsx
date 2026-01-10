import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "./test-utils";
import WorkProdTab from "../WorkProdTab";

describe("WorkProdTab", () => {
	describe("Connectivity Section", () => {
		it("should render all WiFi quality options", () => {
			render(<WorkProdTab />);

			// Use getAllByText for duplicate labels
			const noneButtons = screen.getAllByText("None");
			expect(noneButtons.length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText("Slow")).toBeInTheDocument();
			const moderateButtons = screen.getAllByText("Moderate");
			expect(moderateButtons.length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText("Fast")).toBeInTheDocument();
			expect(screen.getByText("Excellent")).toBeInTheDocument();
		});

		it("should select WiFi quality when clicked", async () => {
			const user = userEvent.setup();
			render(<WorkProdTab />);

			const fastButton = screen.getByRole("button", { name: /fast/i });
			await user.click(fastButton);

			await waitFor(() => {
				expect(fastButton).toHaveClass("bg-primary");
			});
		});
	});

	describe("Environment Section", () => {
		it("should render all power outlet options", () => {
			render(<WorkProdTab />);

			// Power outlet options: None, Limited, Moderate, Plenty
			expect(screen.getByText("Limited")).toBeInTheDocument();
			expect(screen.getByText("Plenty")).toBeInTheDocument();
			// None and Moderate appear in multiple sections, so just verify they exist
			const noneButtons = screen.getAllByText("None");
			expect(noneButtons.length).toBeGreaterThanOrEqual(2);
			const moderateButtons = screen.getAllByText("Moderate");
			expect(moderateButtons.length).toBeGreaterThanOrEqual(2);
		});

		it("should render all noise level options", () => {
			render(<WorkProdTab />);

			expect(screen.getByText("Silent")).toBeInTheDocument();
			expect(screen.getByText("Quiet")).toBeInTheDocument();
			// Moderate is already tested in WiFi section
			expect(screen.getByText("Lively")).toBeInTheDocument();
			expect(screen.getByText("Loud")).toBeInTheDocument();
		});

		it("should select power outlet option when clicked", async () => {
			const user = userEvent.setup();
			render(<WorkProdTab />);

			const plentyButton = screen.getByRole("button", { name: /plenty/i });
			await user.click(plentyButton);

			await waitFor(() => {
				expect(plentyButton).toHaveClass("bg-primary");
			});
		});

		it("should select noise level when clicked", async () => {
			const user = userEvent.setup();
			render(<WorkProdTab />);

			const quietButton = screen.getByRole("button", { name: /quiet/i });
			await user.click(quietButton);

			await waitFor(() => {
				expect(quietButton).toHaveClass("bg-primary");
			});
		});
	});

	describe("Comfort & Seating Section", () => {
		it("should render all seating options", () => {
			render(<WorkProdTab />);

			expect(screen.getByText("Ergonomic Chairs")).toBeInTheDocument();
			expect(screen.getByText("Communal Tables")).toBeInTheDocument();
			expect(screen.getByText("High-tops")).toBeInTheDocument();
			expect(screen.getByText("Outdoor")).toBeInTheDocument();
			expect(screen.getByText("Private Booths")).toBeInTheDocument();
		});

		it("should toggle seating option when clicked", async () => {
			const user = userEvent.setup();
			render(<WorkProdTab />);

			const ergonomicButton = screen.getByRole("button", {
				name: /ergonomic chairs/i,
			});

			// Click to select
			await user.click(ergonomicButton);
			await waitFor(() => {
				expect(ergonomicButton).toHaveClass("bg-primary");
			});

			// Click again to deselect
			await user.click(ergonomicButton);
			await waitFor(() => {
				expect(ergonomicButton).not.toHaveClass("bg-primary");
			});
		});

		it("should allow multiple seating options to be selected", async () => {
			const user = userEvent.setup();
			render(<WorkProdTab />);

			const ergonomicButton = screen.getByRole("button", {
				name: /ergonomic chairs/i,
			});
			const communalButton = screen.getByRole("button", {
				name: /communal tables/i,
			});

			await user.click(ergonomicButton);
			await user.click(communalButton);

			await waitFor(() => {
				expect(ergonomicButton).toHaveClass("bg-primary");
				expect(communalButton).toHaveClass("bg-primary");
			});
		});
	});

	describe("Facilities Section", () => {
		it("should render Air Conditioning switch", () => {
			render(<WorkProdTab />);

			expect(screen.getByText("Air Conditioning")).toBeInTheDocument();
			expect(screen.getByText("Climate controlled space")).toBeInTheDocument();
		});

		it("should toggle Air Conditioning switch", async () => {
			const user = userEvent.setup();
			render(<WorkProdTab />);

			const acSwitch = screen.getByRole("switch");

			expect(acSwitch).not.toBeChecked();

			await user.click(acSwitch);

			await waitFor(() => {
				expect(acSwitch).toBeChecked();
			});
		});
	});

	describe("Section Labels", () => {
		it("should display all section headers", () => {
			render(<WorkProdTab />);

			expect(screen.getByText("Connectivity")).toBeInTheDocument();
			expect(screen.getByText("Environment")).toBeInTheDocument();
			expect(screen.getByText("Comfort & Seating")).toBeInTheDocument();
			expect(screen.getByText("Facilities")).toBeInTheDocument();
		});

		it("should display subsection labels", () => {
			render(<WorkProdTab />);

			expect(screen.getByText("WiFi Quality")).toBeInTheDocument();
			expect(screen.getByText("Power Outlets")).toBeInTheDocument();
			expect(screen.getByText("Noise Level")).toBeInTheDocument();
			expect(screen.getByText("Seating Options")).toBeInTheDocument();
		});
	});
});
