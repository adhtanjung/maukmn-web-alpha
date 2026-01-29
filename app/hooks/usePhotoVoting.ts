"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// API response type for voting
export interface VoteResult {
	photo_id: string;
	new_score: number;
	user_vote: number; // 1 = upvoted, -1 = downvoted, 0 = no vote
}

export function usePhotoVoting() {
	const { getToken } = useAuth();

	const votePhoto = useCallback(
		async (photoId: string, voteType: "up" | "down"): Promise<VoteResult> => {
			try {
				const token = await getToken();
				const response = await fetch(
					`${API_URL}/api/v1/photos/${photoId}/vote`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({ vote_type: voteType }),
					},
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Failed to vote");
				}

				return data.data as VoteResult;
			} catch (err) {
				console.error("Error voting:", err);
				throw err;
			}
		},
		[getToken],
	);

	return { votePhoto };
}
