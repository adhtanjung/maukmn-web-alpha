import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
	it("should merge class names correctly", () => {
		expect(cn("px-2", "py-1")).toBe("px-2 py-1");
	});

	it("should handle conditional classes", () => {
		expect(cn("px-2", false && "py-1")).toBe("px-2");
		expect(cn("px-2", true && "py-1")).toBe("px-2 py-1");
	});

	it("should merge conflicting Tailwind classes", () => {
		// twMerge should keep the last conflicting class
		expect(cn("px-2", "px-4")).toBe("px-4");
	});

	it("should handle arrays and objects", () => {
		expect(cn(["px-2", "py-1"])).toBe("px-2 py-1");
		expect(cn({ "px-2": true, "py-1": false })).toBe("px-2");
	});

	it("should handle undefined and null values", () => {
		expect(cn("px-2", undefined, null, "py-1")).toBe("px-2 py-1");
	});
});
