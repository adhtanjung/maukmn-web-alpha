export interface PaginationMeta {
	current_page: number;
	per_page: number;
	total: number;
	total_pages: number;
}

export interface ApiResponse<T = void> {
	success: boolean;
	message: string;
	data?: T;
	error?: string | null;
	meta?: PaginationMeta;
}
