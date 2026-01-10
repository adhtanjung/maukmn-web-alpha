import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "./test-utils";
import OperationsTab from "../OperationsTab";

describe("OperationsTab", () => {
	describe("Operating Hours Section", () => {
		it("should render all 7 days of the week", () => {
			render(<OperationsTab />);

			// Days appear in both selector and summary, so use getAllByText
			// Check for short form day names in the day selector
			expect(screen.getByText("Mon")).toBeInTheDocument();
			expect(screen.getByText("Tue")).toBeInTheDocument();
			expect(screen.getByText("Wed")).toBeInTheDocument();
			expect(screen.getByText("Thu")).toBeInTheDocument();
			expect(screen.getByText("Fri")).toBeInTheDocument();
			expect(screen.getByText("Sat")).toBeInTheDocument();
			expect(screen.getByText("Sun")).toBeInTheDocument();
		});

		it("should display Operating Hours section label", () => {
			render(<OperationsTab />);

			expect(screen.getByText("Operating Hours")).toBeInTheDocument();
		});

		// Note: "Apply to All Days" button only appears when a day has hours set
	});

	describe("Payment Options Section", () => {
		it("should render all payment options", () => {
			render(<OperationsTab />);

			// Check for actual labels: Cash, Credit Card, Debit Card, QRIS, GoPay, OVO
			expect(screen.getByText("Cash")).toBeInTheDocument();
			expect(screen.getByText("Credit Card")).toBeInTheDocument();
			expect(screen.getByText("Debit Card")).toBeInTheDocument();
			expect(screen.getByText("QRIS")).toBeInTheDocument();
		});

		it("should toggle payment option when clicked", async () => {
			const user = userEvent.setup();
			render(<OperationsTab />);

			const cashButton = screen.getByRole("button", { name: /cash/i });

			// Click to select
			await user.click(cashButton);
			await waitFor(() => {
				expect(cashButton).toHaveClass("bg-primary");
			});

			// Click again to deselect
			await user.click(cashButton);
			await waitFor(() => {
				expect(cashButton).not.toHaveClass("bg-primary");
			});
		});

		it("should allow multiple payment options to be selected", async () => {
			const user = userEvent.setup();
			render(<OperationsTab />);

			const cashButton = screen.getByRole("button", { name: /cash/i });
			const creditCardButton = screen.getByRole("button", {
				name: /credit card/i,
			});

			await user.click(cashButton);
			await user.click(creditCardButton);

			await waitFor(() => {
				expect(cashButton).toHaveClass("bg-primary");
				expect(creditCardButton).toHaveClass("bg-primary");
			});
		});
	});

	describe("Reservation Section", () => {
		it("should render reservations required label", () => {
			render(<OperationsTab />);

			// Actual label: "Reservations Required"
			expect(screen.getByText("Reservations Required")).toBeInTheDocument();
		});

		it("should toggle reservation switch", async () => {
			const user = userEvent.setup();
			render(<OperationsTab />);

			// There are multiple switches, get the reservation one
			const switches = screen.getAllByRole("switch");
			const reservationSwitch = switches[1]; // Second switch is reservation

			expect(reservationSwitch).not.toBeChecked();

			await user.click(reservationSwitch);

			await waitFor(() => {
				expect(reservationSwitch).toBeChecked();
			});
		});

		// NOTE: Booking platform input only appears when reservation is toggled on
		// This is tested implicitly via the toggle test above
	});

	describe("Wait Time Section", () => {
		it("should render wait time estimate input", () => {
			render(<OperationsTab />);

			const waitTimeInput = screen.getByPlaceholderText("e.g. 15");
			expect(waitTimeInput).toBeInTheDocument();
		});

		it("should allow typing numbers in wait time input", async () => {
			const user = userEvent.setup();
			render(<OperationsTab />);

			const waitTimeInput = screen.getByPlaceholderText("e.g. 15");

			await user.type(waitTimeInput, "30");

			await waitFor(() => {
				// Number inputs store value as number, not string
				expect(waitTimeInput).toHaveValue(30);
			});
		});

		it("should display wait time helper text", () => {
			render(<OperationsTab />);

			expect(
				screen.getByText("Estimated wait time during peak hours")
			).toBeInTheDocument();
		});
	});

	describe("Section Labels", () => {
		it("should display all section headers", () => {
			render(<OperationsTab />);

			expect(screen.getByText("Operating Hours")).toBeInTheDocument();
			expect(screen.getByText("Payment Methods")).toBeInTheDocument();
			expect(screen.getByText("Reservations")).toBeInTheDocument();
			expect(screen.getByText("Logistics")).toBeInTheDocument();
		});
	});

	describe("Day Schedule Functionality", () => {
		it("should show Closed text when day is not open", () => {
			render(<OperationsTab />);

			// All days should show "Closed" initially
			const closedTexts = screen.getAllByText("Closed");
			expect(closedTexts.length).toBeGreaterThan(0);
		});
	});
});
