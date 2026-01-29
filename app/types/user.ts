export interface AppUser {
	id: string;
	clerk_id: string;
	email: string;
	role: "user" | "admin";
	created_at: string;
	updated_at: string;
}
