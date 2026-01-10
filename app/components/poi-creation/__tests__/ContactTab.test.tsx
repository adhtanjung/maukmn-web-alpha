import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "./test-utils";
import ContactTab from "../ContactTab";

describe("ContactTab", () => {
	describe("Digital Presence Section", () => {
		it("should render website input field", () => {
			render(<ContactTab />);
			const websiteInput = screen.getByPlaceholderText(
				"https://www.example.com"
			);
			expect(websiteInput).toBeInTheDocument();
		});

		it("should render phone input field", () => {
			render(<ContactTab />);
			const phoneInput = screen.getByPlaceholderText("+1 (555) 000-0000");
			expect(phoneInput).toBeInTheDocument();
		});

		it("should render email input field", () => {
			render(<ContactTab />);
			const emailInput = screen.getByPlaceholderText("contact@example.com");
			expect(emailInput).toBeInTheDocument();
		});
	});

	describe("Social Media Section", () => {
		it("should render all 6 social media platform inputs", () => {
			render(<ContactTab />);

			expect(
				screen.getByPlaceholderText("https://instagram.com/yourhandle")
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText("https://facebook.com/yourpage")
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText("https://x.com/yourhandle")
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText("https://tiktok.com/@yourhandle")
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText("https://youtube.com/@yourchannel")
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText("https://linkedin.com/company/yourcompany")
			).toBeInTheDocument();
		});

		it("should update social link when user types", async () => {
			const user = userEvent.setup();
			render(<ContactTab />);

			const instagramInput = screen.getByPlaceholderText(
				"https://instagram.com/yourhandle"
			);

			await user.type(instagramInput, "https://instagram.com/testuser");

			await waitFor(() => {
				expect(instagramInput).toHaveValue("https://instagram.com/testuser");
			});
		});

		it("should clear social link when input is emptied", async () => {
			const user = userEvent.setup();
			render(<ContactTab />);

			const instagramInput = screen.getByPlaceholderText(
				"https://instagram.com/yourhandle"
			);

			await user.type(instagramInput, "https://instagram.com/testuser");
			await user.clear(instagramInput);

			await waitFor(() => {
				expect(instagramInput).toHaveValue("");
			});
		});
	});

	describe("Form Labels", () => {
		it("should display section headers", () => {
			render(<ContactTab />);

			expect(screen.getByText("Digital Presence")).toBeInTheDocument();
			expect(screen.getByText("Social Media")).toBeInTheDocument();
		});

		it("should display all social platform labels", () => {
			render(<ContactTab />);

			expect(screen.getByText("Instagram")).toBeInTheDocument();
			expect(screen.getByText("Facebook")).toBeInTheDocument();
			expect(screen.getByText("X (Twitter)")).toBeInTheDocument();
			expect(screen.getByText("TikTok")).toBeInTheDocument();
			expect(screen.getByText("YouTube")).toBeInTheDocument();
			expect(screen.getByText("LinkedIn")).toBeInTheDocument();
		});
	});
});
