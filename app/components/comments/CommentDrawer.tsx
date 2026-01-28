"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useComments } from "@/app/hooks/useComments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CommentDrawer({
	poiId,
	trigger,
}: {
	poiId: string;
	trigger?: React.ReactNode;
}) {
	const { comments, createComment, deleteComment, isLoading } =
		useComments(poiId);
	const { userId } = useAuth();
	const [newComment, setNewComment] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			setIsMounted(true);
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newComment.trim()) return;

		try {
			await createComment(newComment);
			setNewComment("");
		} catch (error) {
			console.error("Failed to submit comment", error);
		}
	};

	const handleDelete = async (commentId: string) => {
		if (confirm("Are you sure you want to delete this comment?")) {
			await deleteComment(commentId);
		}
	};

	const Content = (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-hidden p-4">
				{isLoading ? (
					<div className="text-center text-muted-foreground py-8">
						Loading comments...
					</div>
				) : comments.length === 0 ? (
					<div className="text-center text-muted-foreground py-8">
						No comments yet. Be the first!
					</div>
				) : (
					<ScrollArea className="h-full pr-4">
						<div className="space-y-4">
							{comments.map((comment) => (
								<div
									key={comment.comment_id}
									className="flex gap-3 items-start group"
								>
									<Avatar className="w-8 h-8">
										<AvatarImage
											src={comment.user.picture_url}
											alt={comment.user.name}
										/>
										<AvatarFallback>
											{comment.user.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 space-y-1">
										<div className="flex items-center justify-between">
											<span className="text-sm font-semibold">
												{comment.user.name}
											</span>
											<span className="text-xs text-muted-foreground">
												{formatDistanceToNow(new Date(comment.created_at), {
													addSuffix: true,
												})}
											</span>
										</div>
										<p className="text-sm text-foreground break-words">
											{comment.content}
										</p>

										{userId === comment.user.user_id && (
											<button
												onClick={() => handleDelete(comment.comment_id)}
												className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1"
											>
												<Trash2 className="w-3 h-3" /> Delete
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				)}
			</div>
			<div className="p-4 border-t mt-auto">
				<form onSubmit={handleSubmit} className="flex gap-2 items-end">
					<Textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="Write a comment..."
						className="min-h-[2.5rem] max-h-24 resize-none"
						rows={1}
					/>
					<Button type="submit" size="icon" disabled={!newComment.trim()}>
						<Send className="w-4 h-4" />
					</Button>
				</form>
			</div>
		</div>
	);

	// Using Sheet for now as it's easier to verify on desktop/mobile uniformly without complex responsive switching logic initially
	// Updated: Let's use Drawer for mobile feel if requested, but Sheet is safer for "Review" style.
	// The user didn't specify, but "CommentDrawer" implies Drawer.
	// BUT shadcn Drawer is bottom-only usually.
	// Let's use Sheet with "bottom" side on mobile and "right" on desktop if possible, but standard Sheet is side.
	// I will use Sheet (Side) for now.

	if (!isMounted) {
		return (
			<div className="flex flex-col items-center gap-1">
				{trigger || (
					<Button
						variant="ghost"
						size="icon"
						className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border border-white/10"
					>
						<MessageSquare className="h-4 w-4" />
					</Button>
				)}
			</div>
		);
	}

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				{trigger || (
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<MessageSquare className="h-4 w-4" />
					</Button>
				)}
			</SheetTrigger>
			<SheetContent
				side="right"
				className="w-full sm:w-[400px] flex flex-col p-0 gap-0"
			>
				<SheetHeader className="p-4 border-b">
					<SheetTitle>Comments ({comments?.length || 0})</SheetTitle>
				</SheetHeader>
				{Content}
			</SheetContent>
		</Sheet>
	);
}
