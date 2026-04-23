/**
 * SAMPLE ONLY
 * This service file is intentionally comment-only.
 * Uncomment and adapt if you want to enable auth business logic again.
 *
 * Example external connection flow inside service:
 *
 * // MongoDB connection usage:
 * // - Read admin account from AdminModel (mongoose).
 * // - Compare password hash.
 * // - Save refresh token hash for rotation.
 *
 * // Redis connection usage (optional):
 * // - Store session metadata or rate-limit keys.
 * // - Use key TTL for temporary auth cache.
 *
 * // Socket connection usage (optional):
 * // - On logout, emit event via socket server:
 * //   getSocketServer()?.to(`admin:${adminId}`).emit('session:revoked');
 *
 * // JWT flow:
 * // - createAccessToken(payload)
 * // - createRefreshToken(payload)
 * // - verifyRefreshToken(token)
 *
 * // Export examples:
 * // export async function loginAdmin(dto: LoginAdminDto) { ... }
 * // export async function refreshAdminSession(refreshToken: string) { ... }
 * // export async function logoutAdmin(adminId: string) { ... }
 * // export async function seedAdminFromEnv() { ... }
 */

