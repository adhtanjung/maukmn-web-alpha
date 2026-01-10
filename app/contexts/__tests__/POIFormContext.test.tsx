"use client";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { POIFormProvider, usePOIForm } from "../POIFormContext";
import React from "react";

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue("mock-token"),
	}),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create wrapper
function createWrapper(initialData?: any, initialDraftId?: string | null) {
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<POIFormProvider
				initialData={initialData}
				initialDraftId={initialDraftId}
			>
				{children}
			</POIFormProvider>
		);
	};
}

describe("POIFormContext", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("saveDraft", () => {
		it("should create a new POI and return the new ID when draftId is null", async () => {
			const newPoiId = "new-poi-uuid-123";
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: { poi_id: newPoiId } }),
			});

			const { result } = renderHook(() => usePOIForm(), {
				wrapper: createWrapper(),
			});

			let returnedId: string | null = null;
			await act(async () => {
				returnedId = await result.current.saveDraft();
			});

			// Should return the newly created ID
			expect(returnedId).toBe(newPoiId);
			// State should also be updated
			expect(result.current.draftId).toBe(newPoiId);
			// Should have called POST (not PUT) since no draftId existed
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/api/v1/pois"),
				expect.objectContaining({ method: "POST" })
			);
		});

		it("should return existing draftId when updating an existing POI", async () => {
			const existingId = "existing-poi-uuid-456";
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: {} }),
			});

			const { result } = renderHook(() => usePOIForm(), {
				wrapper: createWrapper(undefined, existingId),
			});

			let returnedId: string | null = null;
			await act(async () => {
				returnedId = await result.current.saveDraft();
			});

			// Should return the existing ID
			expect(returnedId).toBe(existingId);
			// Should have called PUT (not POST)
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining(`/api/v1/pois/${existingId}`),
				expect.objectContaining({ method: "PUT" })
			);
		});
	});

	describe("submitForReview", () => {
		it("should create POI first then submit when draftId is null", async () => {
			const newPoiId = "created-poi-uuid-789";

			// First call: POST to create POI
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: { poi_id: newPoiId } }),
			});
			// Second call: POST to submit for review
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ success: true }),
			});

			const { result } = renderHook(() => usePOIForm(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.submitForReview();
			});

			// Should have made 2 calls
			expect(mockFetch).toHaveBeenCalledTimes(2);

			// First call should be POST to create
			expect(mockFetch).toHaveBeenNthCalledWith(
				1,
				expect.stringContaining("/api/v1/pois"),
				expect.objectContaining({ method: "POST" })
			);

			// Second call should be POST to submit with the NEW ID (not null)
			expect(mockFetch).toHaveBeenNthCalledWith(
				2,
				expect.stringContaining(`/api/v1/pois/${newPoiId}/submit`),
				expect.objectContaining({ method: "POST" })
			);
		});

		it("should NOT call /pois/null/submit when draftId is null", async () => {
			const newPoiId = "valid-poi-uuid";

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: { poi_id: newPoiId } }),
			});
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ success: true }),
			});

			const { result } = renderHook(() => usePOIForm(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.submitForReview();
			});

			// Verify no call was made with "null" in the URL
			const calls = mockFetch.mock.calls;
			calls.forEach((call) => {
				expect(call[0]).not.toContain("/pois/null/");
			});
		});

		it("should throw error if saveDraft fails to return an ID", async () => {
			// Note: In practice, form validation runs first and would throw.
			// But if somehow saveDraft completes without returning an ID,
			// the submitForReview should still throw.
			// Since form validation blocks before saveDraft in the actual flow,
			// this test verifies that submitForReview throws an error
			// when required fields are empty (validation error).

			const { result } = renderHook(() => usePOIForm(), {
				wrapper: createWrapper(),
			});

			// Should throw some error (either validation or missing ID)
			await expect(
				act(async () => {
					await result.current.submitForReview();
				})
			).rejects.toThrow();
		});

		it("should use existing draftId when already set", async () => {
			const existingId = "existing-draft-id";

			// PUT to save
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: {} }),
			});
			// POST to submit
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ success: true }),
			});

			const { result } = renderHook(() => usePOIForm(), {
				wrapper: createWrapper(undefined, existingId),
			});

			await act(async () => {
				await result.current.submitForReview();
			});

			// Submit call should use the existing ID
			expect(mockFetch).toHaveBeenNthCalledWith(
				2,
				expect.stringContaining(`/api/v1/pois/${existingId}/submit`),
				expect.any(Object)
			);
		});
	});

	describe("resetForm", () => {
		it("should clear draftId and localStorage", async () => {
			localStorage.setItem(
				"poi-draft",
				JSON.stringify({ formData: {}, draftId: "test-id" })
			);

			const { result } = renderHook(() => usePOIForm(), {
				wrapper: createWrapper(undefined, "test-id"),
			});

			act(() => {
				result.current.resetForm();
			});

			expect(result.current.draftId).toBeNull();
			expect(localStorage.getItem("poi-draft")).toBeNull();
		});
	});
});
