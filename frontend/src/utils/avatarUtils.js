/**
 * Utilities for user profile picture resolution.
 * If a user has an uploaded profile picture, it is returned and displayed.
 * If no profile picture is available, it gracefully falls back to initials
 * avatars (e.g. "RN" for Revanasidda Nimbal).
 */

export function getInitialsAvatar(name = 'User', bg = '7c3aed') {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${bg}&color=fff`;
}

/**
 * Resolves a user's avatar image URL with priority:
 * 1. user.profilePictureUrl (direct property if present)
 * 2. customMap[user.id] (from asynchronous user detail fetch)
 * 3. currentUser.profilePictureUrl (if user matches logged-in user in AuthContext)
 * 4. Initials avatar fallback (e.g. "RN" initials) if profile picture is not available
 */
export function getUserAvatar(user, customMap = {}, currentUser = null) {
  if (!user) return getInitialsAvatar('User');

  // 1. Direct profilePictureUrl on user object
  if (user.profilePictureUrl && typeof user.profilePictureUrl === 'string' && user.profilePictureUrl.trim()) {
    return user.profilePictureUrl;
  }

  // 2. Custom mapped photo (fetched asynchronously via getUserById)
  if (user.id && customMap && customMap[user.id]) {
    return customMap[user.id];
  }

  // 3. Current logged-in user profile picture
  if (currentUser && currentUser.profilePictureUrl) {
    const isCurrentUser =
      (user.id && currentUser.id && String(user.id) === String(currentUser.id)) ||
      (user.email && currentUser.email && user.email.toLowerCase() === currentUser.email.toLowerCase());
    if (isCurrentUser) {
      return currentUser.profilePictureUrl;
    }
  }

  // 4. Fallback if no profile picture is available: initials avatar (e.g. "RN")
  return getInitialsAvatar(user.fullName || user.email || 'User');
}
