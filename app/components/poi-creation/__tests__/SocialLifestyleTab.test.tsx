import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "./test-utils";
import SocialLifestyleTab from "../SocialLifestyleTab";

describe("SocialLifestyleTab", () => {
	describe("Policies Section", () => {
		it("should render Kid Friendly switch", () => {
			render(<SocialLifestyleTab />);

			expect(screen.getByText("Kid Friendly")).toBeInTheDocument();
			expect(
				screen.getByText("Suitable for families with children")
			).toBeInTheDocument();
		});

		it("should render Smoker Friendly switch", () => {
			render(<SocialLifestyleTab />);

			expect(screen.getByText("Smoker Friendly")).toBeInTheDocument();
			expect(
				screen.getByText("Designated smoking areas available")
			).toBeInTheDocument();
		});

		it("should toggle Kid Friendly switch", async () => {
			const user = userEvent.setup();
			render(<SocialLifestyleTab />);

			const switches = screen.getAllByRole("switch");
			const kidFriendlySwitch = switches[0]; // First switch is Kid Friendly

			expect(kidFriendlySwitch).not.toBeChecked();

			await user.click(kidFriendlySwitch);

			await waitFor(() => {
				expect(kidFriendlySwitch).toBeChecked();
			});
		});

		it("should toggle Smoker Friendly switch", async () => {
			const user = userEvent.setup();
			render(<SocialLifestyleTab />);

			const switches = screen.getAllByRole("switch");
			const smokerFriendlySwitch = switches[1]; // Second switch is Smoker Friendly

			expect(smokerFriendlySwitch).not.toBeChecked();

			await user.click(smokerFriendlySwitch);

			await waitFor(() => {
				expect(smokerFriendlySwitch).toBeChecked();
			});
		});

		it("should render Pet Policy input", () => {
			render(<SocialLifestyleTab />);

			const petPolicyInput = screen.getByPlaceholderText(
				"e.g. Dogs allowed on patio only"
			);
			expect(petPolicyInput).toBeInTheDocument();
		});

		it("should allow typing in Pet Policy input", async () => {
			const user = userEvent.setup();
			render(<SocialLifestyleTab />);

			const petPolicyInput = screen.getByPlaceholderText(
				"e.g. Dogs allowed on patio only"
			);

			await user.type(petPolicyInput, "Dogs allowed on outdoor seating");

			await waitFor(() => {
				expect(petPolicyInput).toHaveValue("Dogs allowed on outdoor seating");
			});
		});
	});

	describe("Additional Info Section", () => {
		it("should render Happy Hour Info input", () => {
			render(<SocialLifestyleTab />);

			const happyHourInput = screen.getByPlaceholderText(
				"e.g. 5-7pm daily, 50% off drinks"
			);
			expect(happyHourInput).toBeInTheDocument();
		});

		it("should render Loyalty Program textarea", () => {
			render(<SocialLifestyleTab />);

			const loyaltyProgramTextarea = screen.getByPlaceholderText(
				/earn 1 point per \$10 spent/i
			);
			expect(loyaltyProgramTextarea).toBeInTheDocument();
		});

		it("should allow typing in Happy Hour Info input", async () => {
			const user = userEvent.setup();
			render(<SocialLifestyleTab />);

			const happyHourInput = screen.getByPlaceholderText(
				"e.g. 5-7pm daily, 50% off drinks"
			);

			await user.type(happyHourInput, "4-6pm weekdays, buy 1 get 1 free");

			await waitFor(() => {
				expect(happyHourInput).toHaveValue("4-6pm weekdays, buy 1 get 1 free");
			});
		});

		it("should allow typing in Loyalty Program textarea", async () => {
			const user = userEvent.setup();
			render(<SocialLifestyleTab />);

			const loyaltyProgramTextarea = screen.getByPlaceholderText(
				/earn 1 point per \$10 spent/i
			);

			await user.type(
				loyaltyProgramTextarea,
				"Earn points with every purchase"
			);

			await waitFor(() => {
				expect(loyaltyProgramTextarea).toHaveValue(
					"Earn points with every purchase"
				);
			});
		});
	});

	describe("Section Labels", () => {
		it("should display section headers", () => {
			render(<SocialLifestyleTab />);

			expect(screen.getByText("Policies")).toBeInTheDocument();
			expect(screen.getByText("Additional Info")).toBeInTheDocument();
		});

		it("should display field labels", () => {
			render(<SocialLifestyleTab />);

			expect(screen.getByText("Pet Policy")).toBeInTheDocument();
			expect(screen.getByText("Happy Hour Info")).toBeInTheDocument();
			expect(screen.getByText("Loyalty Program")).toBeInTheDocument();
		});
	});

	describe("Helper Text", () => {
		it("should display Pet Policy helper text", () => {
			render(<SocialLifestyleTab />);

			expect(
				screen.getByText("Specify restrictions or allowed areas for animals.")
			).toBeInTheDocument();
		});
	});
});
