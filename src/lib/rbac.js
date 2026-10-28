// Role-based access control utilities for Creative Books SA
// Use these helpers to enforce permissions in frontend components

export const ROLES = {
  ADMIN: 'admin',
  SUPER_USER: 'super_user',
  STANDARD_USER: 'standard_user',
};

export const PERMISSIONS = {
  // Super user has access to everything
  SUPER_USER: {
    dashboard: 'full',
    crm: 'full',
    finance: 'full',
    documents: 'full',
    messages: 'full',
    appointments: 'full',
    reports: 'full',
    settings: 'full',
    userManagement: 'full',
  },
  // Standard user has restricted access
  STANDARD_USER: {
    dashboard: 'limited', // no financial KPIs
    crm: 'own', // only assigned records
    finance: 'quotes_invoices_only', // no accounting/revenue totals
    documents: 'full',
    messages: 'full',
    appointments: 'own',
    reports: 'none',
    settings: 'none',
    userManagement: 'none',
  },
};

/**
 * Check if user has permission
 * @param {Object} user - Current user object
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  
  // Admin and super users have all permissions
  if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_USER) {
    return true;
  }
  
  // Standard users have limited permissions
  if (user.role === ROLES.STANDARD_USER) {
    const perms = PERMISSIONS.STANDARD_USER;
    return perms[permission] !== 'none' && perms[permission] !== undefined;
  }
  
  return false;
}

/**
 * Check if user can see financial data
 * @param {Object} user
 * @returns {boolean}
 */
export function canSeeFinancials(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_USER;
}

/**
 * Check if user can manage other users
 * @param {Object} user
 * @returns {boolean}
 */
export function canManageUsers(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_USER;
}

/**
 * Check if user can access settings
 * @param {Object} user
 * @returns {boolean}
 */
export function canAccessSettings(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_USER;
}

/**
 * Check if user can see reports & SEO
 * @param {Object} user
 * @returns {boolean}
 */
export function canSeeReports(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_USER;
}

/**
 * Get dashboard view mode for user
 * @param {Object} user
 * @returns {'full' | 'limited'}
 */
export function getDashboardMode(user) {
  if (user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_USER) {
    return 'full';
  }
  return 'limited';
}

/**
 * Get finance access level
 * @param {Object} user
 * @returns {'full' | 'quotes_invoices_only'}
 */
export function getFinanceAccessLevel(user) {
  if (user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_USER) {
    return 'full';
  }
  return 'quotes_invoices_only';
}

/**
 * Check if user can see all records or only their own
 * @param {Object} user
 * @returns {'all' | 'own'}
 */
export function getDataScope(user) {
  if (user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_USER) {
    return 'all';
  }
  return 'own';
}

/**
 * Format user role for display
 * @param {string} role
 * @returns {string}
 */
export function formatRole(role) {
  const labels = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.SUPER_USER]: 'Super user',
    [ROLES.STANDARD_USER]: 'Standard user',
  };
  return labels[role] || 'User';
}