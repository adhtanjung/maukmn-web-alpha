"use client";

import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type CommentUser = {
	user_id: string;
	name: string;
	picture_url: string;
};

export type Comment = {
	comment_id: string;
	poi_id: string;
	user_id: string;
	content: string;
	parent_id: string | null;
	created_at: string;
	updated_at: string;
	user: CommentUser;
	replies?: Comment[]; // For nested replies if we handle them
};

// Use SWR's arguments to handle conditional fetching
export function useComments(poiId: string | null) {
	const { getToken } = useAuth();

	const fetcher = useCallback(async (url: string) => {
		// Comments read is public, so token is optional but good to have if we want to personalize?
		// Backend doesn't use token for GET.
		const res = await fetch(url);
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.message || "Failed to fetch comments");
		}
		return res.json();
	}, []);

	const key = poiId ? `${API_URL}/api/v1/pois/${poiId}/comments` : null;

	const { data, error, isLoading, mutate } = useSWR<Comment[]>(key, fetcher);

	const createComment = useCallback(
		async (content: string, parentId: string | null = null) => {
			if (!poiId) return;
			const token = await getToken();
			if (!token) throw new Error("Authentication required");

			const payload = { content, parent_id: parentId };

			try {
				const res = await fetch(`${API_URL}/api/v1/pois/${poiId}/comments`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				});

				if (!res.ok) throw new Error("Failed to post comment");

				const newComment = await res.json();

				// Optimistic update or just revalidate
				mutate();
				return newComment;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		[poiId, getToken, mutate],
	);

	const deleteComment = useCallback(
		async (commentId: string) => {
			const token = await getToken();
			if (!token) throw new Error("Authentication required");

			try {
				const res = await fetch(`${API_URL}/api/v1/comments/${commentId}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) throw new Error("Failed to delete comment");

				mutate(); // Revalidate
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		[getToken, mutate],
	);

	return {
		comments: data || [],
		isLoading,
		error,
		createComment,
		deleteComment,
		mutate,
	};
}
