export type Role = 'USER' | 'REDACTEUR' | 'ADMIN';

export const ROLES = ['USER', 'REDACTEUR', 'ADMIN'] as const;

export type AuthUser = {
	id: string;
	role: Role;
	username?: string | null;
};

export function isAdmin(user: Pick<AuthUser, 'role'> | null | undefined): boolean {
	return !!user && user.role === 'ADMIN';
}

export function isSelf(
	viewerId: string | null | undefined,
	targetId: string | null | undefined
): boolean {
	return Boolean(viewerId && targetId && viewerId === targetId);
}

export function canManageUser(
	viewer: AuthUser | null | undefined,
	targetUserId: string | null | undefined
): boolean {
	return isAdmin(viewer) && !isSelf(viewer?.id ?? null, targetUserId);
}

export function canEditOwn(
	viewer: AuthUser | null | undefined,
	targetUserId: string | null | undefined
): boolean {
	return isSelf(viewer?.id ?? null, targetUserId);
}
