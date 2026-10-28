# Role-Based Access Control (RBAC) Implementation

## Overview
Added two staff user roles to the Creative Books Business Portal to control access and data visibility.

## Roles

### Super user
- **Full access** to all features and data
- Can see all financial KPIs, reports, and company-wide totals
- Can access Settings and manage user roles
- Sees all records regardless of owner

### Standard user (default for new users)
- **Restricted access** to operational features only
- Dashboard shows only their own records (no financial KPIs)
- Can access: CRM (own records), Finance (quotes & invoices only), Documents, Messages, Appointments
- **Cannot access**: Reports & SEO, Settings, user management, accounting/financial totals
- Sees only records they created or were assigned to them

## Implementation Details

### 1. User Entity (`entities/User.json`)
- Added roles: `admin`, `super_user`, `standard_user`
- Default role: `standard_user`
- Added fields: `assigned_leads`, `assigned_clients`

### 2. RBAC Utilities (`lib/rbac.js`)
Helper functions for permission checking:
- `hasPermission(user, permission)`
- `canSeeFinancials(user)`
- `canManageUsers(user)`
- `canAccessSettings(user)`
- `canSeeReports(user)`
- `getDashboardMode(user)`
- `getFinanceAccessLevel(user)`
- `getDataScope(user)`
- `formatRole(role)`

### 3. Sidebar Filtering (`components/admin/AdminSidebar`)
- Automatically hides menu items based on user role
- Standard users see: Dashboard, CRM, Finance (Quotes/Invoices/Payments only), Document Centre, Message Centre, Appointments
- Hidden from Standard users: Reports & SEO, Settings, User Management

### 4. User Management (`components/admin/settings/UserManagement.jsx`)
- Located at `/admin/settings/users`
- Only Super users can change user roles
- Shows all users with role badges
- Dropdown to change roles (Super user ↔ Standard user)

### 5. Dashboard Metrics (`functions/getAdminDashboardMetrics`)
- Filters data based on user role
- Standard users see only:
  - Leads they created or were assigned to
  - Quotes they created
  - Contacts they created
- Financial KPIs hidden for Standard users

### 6. Dashboard UI (`pages/admin/AdminDashboard`)
- `isSuperUser` flag controls KPI visibility
- Revenue card replaced with "Active Projects" for Standard users
- All data scoped to user's own records

### 7. Finance Summary (`components/admin/dashboard/FinanceSummary`)
- Hides company-wide financial totals for Standard users
- Shows "My Invoices", "My Payments" instead
- Still allows access to create/view quotes and invoices

## Backend Enforcement

### Data Scoping
Backend functions filter data based on user role:
```javascript
const isSuperUser = user.role === 'admin' || user.role === 'super_user';

if (!isSuperUser) {
  filteredLeads = leads.filter(l => l.assigned_user_id === user.id || l.created_by_id === user.id);
  filteredQuotes = quotes.filter(q => q.created_by_id === user.id);
  filteredContacts = contacts.filter(c => c.created_by_id === user.id);
}
```

### Security Notes
- Menu hiding is **secondary** to backend permission checks
- Standard users cannot access hidden screens via direct URL navigation
- All data fetching respects user role
- Backend functions return filtered data, not just UI hiding

## User Management

### Assigning Roles
1. Go to **Settings** → **User Management** (Super user only)
2. Find the user in the list
3. Use dropdown to change role:
   - **Super user** - Full access
   - **Standard user** - Restricted access

### Default Behavior
- New users default to **Standard user**
- Only Super users can promote/demote other users
- Users cannot change their own role

## Testing

### As Super user:
- ✅ See all dashboard KPIs including revenue
- ✅ Access all menu items including Reports & SEO, Settings
- ✅ See all company-wide data
- ✅ Change user roles in Settings

### As Standard user:
- ✅ See operational dashboard (no revenue KPIs)
- ✅ Access: CRM, Finance (Quotes/Invoices), Documents, Messages, Appointments
- ✅ See only your own leads, quotes, contacts
- ❌ Cannot access Reports & SEO
- ❌ Cannot access Settings
- ❌ Cannot see company financial totals
- ❌ Cannot change user roles

## Files Modified/Created

### Created:
- `lib/rbac.js` - RBAC utility functions
- `components/admin/settings/UserManagement.jsx` - User management UI
- `RBAC_IMPLEMENTATION.md` - This documentation

### Modified:
- `entities/User.json` - Added roles and default
- `components/admin/AdminSidebar` - Role-based menu filtering
- `pages/admin/AdminSettings` - Added User Management link
- `pages/admin/AdminDashboard` - Role-based KPI rendering
- `functions/getAdminDashboardMetrics` - Data scoping by role
- `components/admin/dashboard/FinanceSummary` - Hide financial totals
- `App.jsx` - Added User Management route

## Migration Notes

### Existing Users
- Current users with `role: 'admin'` remain as admins
- New users will default to `standard_user`
- To promote existing users: Settings → User Management

### Entity Updates
- Lead entity already has `owner_id` field for assignment
- Consider adding `assigned_user_id` to Contact, Quote, Invoice for finer-grained scoping

## Future Enhancements

1. **Record Assignment UI**: Add ability to assign leads/clients to specific users
2. **Team-based access**: Group users into teams with shared visibility
3. **Custom permissions**: Granular permission system beyond role-based
4. **Audit logs**: Track role changes and permission usage