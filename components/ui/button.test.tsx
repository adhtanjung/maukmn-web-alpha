import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button component", () => {
	it("should render with default variant", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeInTheDocument();
	});

	it("should render with custom text", () => {
		render(<Button>Custom Text</Button>);
		expect(screen.getByText("Custom Text")).toBeInTheDocument();
	});

	it("should apply variant classes correctly", () => {
		const { rerender } = render(<Button variant="destructive">Delete</Button>);
		let button = screen.getByRole("button");
		expect(button.className).toContain("bg-destructive");

		rerender(<Button variant="outline">Cancel</Button>);
		button = screen.getByRole("button");
		expect(button.className).toContain("border");
	});

	it("should apply size classes correctly", () => {
		const { rerender } = render(<Button size="sm">Small</Button>);
		let button = screen.getByRole("button");
		expect(button.className).toContain("h-8");

		rerender(<Button size="lg">Large</Button>);
		button = screen.getByRole("button");
		expect(button.className).toContain("h-10");
	});

	it("should be disabled when disabled prop is true", () => {
		render(<Button disabled>Disabled</Button>);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
	});

	it("should accept custom className", () => {
		render(<Button className="custom-class">Custom</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("custom-class");
	});

	it("should handle onClick events", () => {
		let clicked = false;
		const handleClick = () => {
			clicked = true;
		};

		render(<Button onClick={handleClick}>Click</Button>);
		const button = screen.getByRole("button");
		button.click();
		expect(clicked).toBe(true);
	});

	it("should support different button types", () => {
		render(<Button type="submit">Submit</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("type", "submit");
	});
});
