# Module 15: React Frontend

## Lesson 4: Admin Panel

# The Control Center for Platform Management

The admin panel is where platform operators maintain order, review content, manage users, and monitor system health. It's the most powerful dashboard—and with great power comes great responsibility. Let's build it right.

---

## 📖 Theory

### Admin Panel Architecture

Unlike user-facing dashboards, admin panels prioritize **data density**, **quick actions**, and **comprehensive oversight**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       ADMIN PANEL ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        TOP NAVIGATION                              │  │
│  │  [🏠 Dashboard] [👥 Users] [💼 Jobs] [📊 Analytics] [⚙️ Settings]  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                        CONTENT AREA                                  ││
│  │                                                                      ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐││
│  │  │   STAT CARD  │ │   STAT CARD  │ │   STAT CARD  │ │   STAT CARD  │││
│  │  │  Total Users │ │  Active Jobs │ │ Applications │ │   Revenue    │││
│  │  │    12,458    │ │     847      │ │    3,291     │ │   $24,500    │││
│  │  │   +12% ↑     │ │   +5% ↑      │ │   +18% ↑     │ │   +8% ↑      │││
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘││
│  │                                                                      ││
│  │  ┌────────────────────────────┐ ┌────────────────────────────────┐  ││
│  │  │      RECENT ACTIVITY       │ │      PENDING MODERATION        │  ││
│  │  │                            │ │                                │  ││
│  │  │  • User john@... signed up │ │  ⚠️ 5 jobs pending review      │  ││
│  │  │  • Job "Senior Dev" posted │ │  ⚠️ 2 reported users           │  ││
│  │  │  • 12 new applications     │ │  ⚠️ 1 flagged content          │  ││
│  │  └────────────────────────────┘ └────────────────────────────────┘  ││
│  │                                                                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Permission Check Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                    ADMIN PERMISSION VERIFICATION                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   ┌──────────────┐                                                 │
│   │    USER      │                                                 │
│   │  NAVIGATES   │                                                 │
│   │  TO /admin   │                                                 │
│   └──────┬───────┘                                                 │
│          │                                                         │
│          ▼                                                         │
│   ┌──────────────┐     NO      ┌──────────────────────┐           │
│   │ Authenticated?│────────────>│  Redirect to /login  │           │
│   └──────┬───────┘             │  with returnUrl      │           │
│          │ YES                  └──────────────────────┘           │
│          ▼                                                         │
│   ┌──────────────┐     NO      ┌──────────────────────┐           │
│   │ Role = admin? │────────────>│  Show "Access Denied"│           │
│   └──────┬───────┘             │  or redirect to home │           │
│          │ YES                  └──────────────────────┘           │
│          ▼                                                         │
│   ┌──────────────────────────────────────────────────┐            │
│   │            RENDER ADMIN DASHBOARD                 │            │
│   │                                                   │            │
│   │   Additional checks per-action:                   │            │
│   │   • Can delete users? (superadmin only)          │            │
│   │   • Can modify settings? (admin level 2+)        │            │
│   │   • Can view analytics? (all admins)             │            │
│   └──────────────────────────────────────────────────┘            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Data Tables Best Practices

```
┌────────────────────────────────────────────────────────────────────────┐
│                    ADMIN DATA TABLE ANATOMY                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  🔍 Search...          [Status ▼] [Role ▼] [Date Range] [Export] │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ☐ │ Name          │ Email           │ Role   │ Status │ Actions │  │
│  ├───┼───────────────┼─────────────────┼────────┼────────┼─────────┤  │
│  │ ☐ │ John Smith    │ john@email.com  │ Seeker │ Active │ •••     │  │
│  │ ☑ │ Jane Doe      │ jane@email.com  │ Employer│ Active │ •••     │  │
│  │ ☐ │ Bob Wilson    │ bob@email.com   │ Seeker │ Banned │ •••     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ☑ 1 selected  [Change Role] [Disable] [Delete]                  │  │
│  │                                                                  │  │
│  │  Showing 1-10 of 12,458    [<] [1] [2] [3] ... [1246] [>]       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Key Features:                                                         │
│  • Bulk selection with "select all"                                    │
│  • Server-side pagination for large datasets                          │
│  • Persistent filters in URL for sharing                              │
│  • Export visible or all records                                       │
│  • Row-level actions via dropdown menu                                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Example 1: User Management Table

<details>
<summary>📄 TypeScript Implementation</summary>

```typescript
// src/features/admin/components/UserManagementTable.tsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminApi, User, UserRole, UserStatus } from '@/api/admin';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Pagination } from '@/components/Pagination';
import { formatDate } from '@/utils/date';

export function UserManagementTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [roleChangeTarget, setRoleChangeTarget] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Extract filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    role: searchParams.get('role') as UserRole | null,
    status: searchParams.get('status') as UserStatus | null,
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
  };

  // Fetch users with filters
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => adminApi.getUsers(filters),
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setRoleChangeTarget(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ userIds, action }: { userIds: string[]; action: string }) =>
      adminApi.bulkUserAction(userIds, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setSelectedUsers(new Set());
    },
  });

  // Handle filter changes (persist to URL)
  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to first page on filter change
    setSearchParams(newParams);
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Select all visible users
  const toggleSelectAll = () => {
    if (selectedUsers.size === data?.users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(data?.users.map((u) => u.id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex gap-4 items-center">
        <input
          type="search"
          placeholder="Search users..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value || null)}
          className="flex-1 border rounded px-4 py-2"
        />
        <select
          value={filters.role || ''}
          onChange={(e) => updateFilter('role', e.target.value || null)}
          className="border rounded px-4 py-2"
        >
          <option value="">All Roles</option>
          <option value="seeker">Job Seeker</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filters.status || ''}
          onChange={(e) => updateFilter('status', e.target.value || null)}
          className="border rounded px-4 py-2"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="banned">Banned</option>
        </select>
        <button
          onClick={() => adminApi.exportUsers(filters)}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      {/* Bulk Actions (shown when users selected) */}
      {selectedUsers.size > 0 && (
        <div className="flex gap-2 items-center bg-blue-50 p-3 rounded">
          <span className="text-sm font-medium">
            {selectedUsers.size} user(s) selected
          </span>
          <button
            onClick={() =>
              bulkActionMutation.mutate({
                userIds: Array.from(selectedUsers),
                action: 'disable',
              })
            }
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
          >
            Disable
          </button>
          <button
            onClick={() =>
              bulkActionMutation.mutate({
                userIds: Array.from(selectedUsers),
                action: 'delete',
              })
            }
            className="px-3 py-1 text-sm bg-red-500 text-white rounded"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedUsers(new Set())}
            className="px-3 py-1 text-sm border rounded"
          >
            Clear
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === data?.users.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Joined
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Active
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(user.lastActiveAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <UserActionsDropdown
                    user={user}
                    onChangeRole={() => setRoleChangeTarget(user)}
                    onToggleStatus={() =>
                      updateStatusMutation.mutate({
                        userId: user.id,
                        status: user.status === 'active' ? 'disabled' : 'active',
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={filters.page}
        totalPages={Math.ceil((data?.total || 0) / filters.limit)}
        onPageChange={(page) => updateFilter('page', String(page))}
      />

      {/* Role Change Modal */}
      {roleChangeTarget && (
        <RoleChangeModal
          user={roleChangeTarget}
          onClose={() => setRoleChangeTarget(null)}
          onConfirm={(newRole) =>
            updateRoleMutation.mutate({
              userId: roleChangeTarget.id,
              role: newRole,
            })
          }
          isLoading={updateRoleMutation.isPending}
        />
      )}
    </div>
  );
}
```

</details>

---

## Example 2: Job Moderation Queue

<details>
<summary>📄 TypeScript Implementation</summary>

```typescript
// src/features/admin/components/ModerationQueue.tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi, PendingJob } from '@/api/admin';

export function ModerationQueue() {
  const [selectedJob, setSelectedJob] = useState<PendingJob | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  // Fetch pending jobs
  const { data: pendingJobs, isLoading } = useQuery({
    queryKey: ['admin', 'moderation', 'jobs'],
    queryFn: () => adminApi.getPendingJobs(),
    refetchInterval: 30000, // Refresh every 30s
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (jobId: string) => adminApi.approveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation'] });
      setSelectedJob(null);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) =>
      adminApi.rejectJob(jobId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation'] });
      setSelectedJob(null);
      setRejectReason('');
    },
  });

  if (isLoading) {
    return <div>Loading moderation queue...</div>;
  }

  if (!pendingJobs?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <span className="text-4xl">✅</span>
        <p className="mt-2">No jobs pending review</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Job List */}
      <div className="w-1/3 space-y-4">
        <h3 className="font-semibold text-lg">
          Pending Review ({pendingJobs.length})
        </h3>
        {pendingJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelectedJob(job)}
            className={`p-4 border rounded cursor-pointer hover:border-blue-500 ${
              selectedJob?.id === job.id ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <h4 className="font-medium">{job.title}</h4>
            <p className="text-sm text-gray-500">{job.company.name}</p>
            <p className="text-xs text-gray-400 mt-1">
              Submitted {formatRelative(job.createdAt)}
            </p>
          </div>
        ))}
      </div>

      {/* Job Preview */}
      <div className="w-2/3">
        {selectedJob ? (
          <div className="border rounded p-6">
            {/* Job Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                <p className="text-gray-600">{selectedJob.company.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedJob.location} • {selectedJob.type}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => approveMutation.mutate(selectedJob.id)}
                  disabled={approveMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  {approveMutation.isPending ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Job Content Preview */}
            <div className="space-y-4">
              <section>
                <h3 className="font-semibold mb-2">Description</h3>
                <div className="prose max-w-none">
                  {selectedJob.description}
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <ul className="list-disc list-inside">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2">Salary Range</h3>
                <p>
                  ${selectedJob.salaryMin.toLocaleString()} - $
                  {selectedJob.salaryMax.toLocaleString()} / year
                </p>
              </section>

              {/* Moderation Flags */}
              {selectedJob.flags?.length > 0 && (
                <section className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <h3 className="font-semibold mb-2 text-yellow-800">
                    ⚠️ Automatic Flags
                  </h3>
                  <ul className="list-disc list-inside text-yellow-700">
                    {selectedJob.flags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Rejection Reason Input */}
            {showRejectModal && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-semibold mb-2">Rejection Reason</h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this job is being rejected..."
                  className="w-full border rounded p-3 h-24"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() =>
                      rejectMutation.mutate({
                        jobId: selectedJob.id,
                        reason: rejectReason,
                      })
                    }
                    disabled={!rejectReason || rejectMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border rounded p-12 text-center text-gray-500">
            Select a job to review
          </div>
        )}
      </div>
    </div>
  );
}
```

</details>

---

## Example 3: Analytics Dashboard with Charts

<details>
<summary>📄 TypeScript Implementation</summary>

```typescript
// src/features/admin/components/AnalyticsDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { adminApi } from '@/api/admin';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function AnalyticsDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => adminApi.getAnalytics(),
  });

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={stats.userGrowth}
          icon="👥"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          change={stats.jobGrowth}
          icon="💼"
        />
        <StatCard
          title="Applications"
          value={stats.totalApplications}
          change={stats.applicationGrowth}
          icon="📄"
        />
        <StatCard
          title="Employers"
          value={stats.totalEmployers}
          change={stats.employerGrowth}
          icon="🏢"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* User Signups Over Time */}
        <div className="bg-white border rounded p-6">
          <h3 className="font-semibold mb-4">User Signups (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.signupsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="seekers"
                stroke="#3B82F6"
                name="Job Seekers"
              />
              <Line
                type="monotone"
                dataKey="employers"
                stroke="#10B981"
                name="Employers"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Applications by Status */}
        <div className="bg-white border rounded p-6">
          <h3 className="font-semibold mb-4">Applications by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.applicationsByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {stats.applicationsByStatus.map((entry, index) => (
                  <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Jobs by Category */}
        <div className="bg-white border rounded p-6">
          <h3 className="font-semibold mb-4">Jobs by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.jobsByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Employers */}
        <div className="bg-white border rounded p-6">
          <h3 className="font-semibold mb-4">Top Employers by Applications</h3>
          <div className="space-y-3">
            {stats.topEmployers.map((employer, index) => (
              <div key={employer.id} className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-300">
                  {index + 1}
                </span>
                <img
                  src={employer.logo || '/default-company.png'}
                  alt=""
                  className="w-10 h-10 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{employer.name}</div>
                  <div className="text-sm text-gray-500">
                    {employer.jobCount} jobs • {employer.applicationCount} applications
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: number;
  change: number;
  icon: string;
}) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white border rounded p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
          <p
            className={`text-sm mt-1 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change)}% from last month
          </p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
```

</details>

---

## 🛠️ Practice: DevJobs Pro Admin Panel

Now let's implement the complete admin panel for DevJobs Pro.

### Component Structure

```
src/features/admin/
├── components/
│   ├── UserManagementTable.tsx
│   ├── ModerationQueue.tsx
│   ├── AnalyticsDashboard.tsx
│   ├── AuditLog.tsx
│   ├── SystemSettings.tsx
│   └── StatCard.tsx
├── pages/
│   ├── AdminDashboard.tsx
│   ├── AdminUsers.tsx
│   ├── AdminModeration.tsx
│   ├── AdminAnalytics.tsx
│   └── AdminSettings.tsx
├── hooks/
│   ├── useAdminStats.ts
│   └── useModerationQueue.ts
└── layouts/
    └── AdminLayout.tsx
```

### Routing Configuration

```typescript
// src/routes/admin.routes.tsx
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/features/admin/layouts/AdminLayout';

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <AdminDashboard /> },
    { path: 'users', element: <AdminUsers /> },
    { path: 'moderation', element: <AdminModeration /> },
    { path: 'analytics', element: <AdminAnalytics /> },
    { path: 'settings', element: <AdminSettings /> },
    { path: 'audit-log', element: <AuditLog /> },
  ],
};
```

### Admin API Endpoints

```typescript
// src/api/admin.ts
import { apiClient } from "./client";

export const adminApi = {
  // Users
  getUsers: (filters: UserFilters) =>
    apiClient.get("/admin/users", { params: filters }),
  updateUserRole: (userId: string, role: UserRole) =>
    apiClient.patch(`/admin/users/${userId}/role`, { role }),
  updateUserStatus: (userId: string, status: UserStatus) =>
    apiClient.patch(`/admin/users/${userId}/status`, { status }),
  bulkUserAction: (userIds: string[], action: string) =>
    apiClient.post("/admin/users/bulk", { userIds, action }),
  exportUsers: (filters: UserFilters) =>
    apiClient.get("/admin/users/export", {
      params: filters,
      responseType: "blob",
    }),

  // Moderation
  getPendingJobs: () => apiClient.get("/admin/moderation/jobs"),
  approveJob: (jobId: string) =>
    apiClient.post(`/admin/moderation/jobs/${jobId}/approve`),
  rejectJob: (jobId: string, reason: string) =>
    apiClient.post(`/admin/moderation/jobs/${jobId}/reject`, { reason }),

  // Analytics
  getAnalytics: () => apiClient.get("/admin/analytics"),

  // Settings
  getSettings: () => apiClient.get("/admin/settings"),
  updateSettings: (settings: Partial<SystemSettings>) =>
    apiClient.patch("/admin/settings", settings),

  // Audit Log
  getAuditLog: (filters: AuditFilters) =>
    apiClient.get("/admin/audit-log", { params: filters }),
};
```

---

## ✅ Definition of Done

Before moving on, ensure:

- [ ] Admin layout restricts access to admin role only
- [ ] User management table with search, filter, pagination works
- [ ] Bulk actions (disable, delete) work with confirmation
- [ ] Role changes require confirmation modal
- [ ] Moderation queue shows pending jobs
- [ ] Approve/reject with reason works
- [ ] Analytics dashboard displays accurate data
- [ ] Charts render correctly with Recharts
- [ ] All admin actions are logged for audit
- [ ] System settings save and apply correctly

---

## 💡 Pro Tips vs Junior Traps

| Category         | Junior Trap 🚫                       | Pro Tip ⭐                                                |
| ---------------- | ------------------------------------ | --------------------------------------------------------- |
| **Audit Trail**  | No record of admin actions           | Log every admin action with timestamp, actor, and details |
| **Confirmation** | Role change without warning          | Require confirmation for any permission escalation        |
| **Pagination**   | Client-side filtering of all records | Server-side pagination for tables with 1000+ records      |
| **Charts**       | Fetching data on every render        | Cache analytics with appropriate stale time               |
| **Permissions**  | Hardcoded role checks                | Use permission-based system for flexibility               |
| **Exports**      | Browser timeout on large exports     | Stream exports or use background job + download link      |

---

## 🐛 5-Minute Debugger

### Issue: Admin not seeing admin routes

```
Symptom: User with admin role redirected to home

Diagnosis:
1. Check role in JWT payload (jwt.io to decode)
2. Is role loaded before route check?
3. Is ProtectedRoute checking correct role string?

Solution:
// Ensure role is available before rendering routes
const { user, isLoading } = useAuth();

if (isLoading) return <LoadingSpinner />;

// Check exact role string (case-sensitive!)
if (user?.role !== 'admin') {
  return <Navigate to="/" />;
}
```

### Issue: Permission denied on admin actions

```
Symptom: 403 when admin tries to update user

Diagnosis:
1. Is token being sent with request?
2. Check backend role verification
3. Is the specific permission granted?

Solution:
// Backend should check both role AND specific permission
if (req.user.role !== 'admin') {
  throw new ForbiddenError('Admin access required');
}

// For sensitive actions, require additional verification
if (action === 'delete' && !req.user.permissions.includes('user:delete')) {
  throw new ForbiddenError('Delete permission required');
}
```

### Issue: Charts not rendering or empty

```
Symptom: Charts show blank area

Diagnosis:
1. Is data in expected format for Recharts?
2. Are ResponsiveContainer dimensions defined?
3. Is data loaded before render?

Solution:
// Ensure parent has defined height
<div style={{ height: 300 }}>
  <ResponsiveContainer width="100%" height="100%">
    {data?.length > 0 ? (
      <LineChart data={data}>...</LineChart>
    ) : (
      <div>No data available</div>
    )}
  </ResponsiveContainer>
</div>
```

---

## 🎉 Course Completion

Congratulations! You've completed the **DevJobs Pro** course!

### What You've Built

A complete, production-ready job board platform with:

- ✅ **Express 5 API** with TypeScript
- ✅ **PostgreSQL + Drizzle** database
- ✅ **JWT Authentication** with role-based access
- ✅ **File Uploads** to Cloudinary
- ✅ **Email Notifications** with Nodemailer
- ✅ **Comprehensive Testing** with Vitest + Supertest
- ✅ **Docker Deployment** ready
- ✅ **React Frontend** with 3 dashboards:
  - Job Seeker Dashboard
  - Employer Dashboard
  - Admin Panel

### What's Next?

→ **Course 2: StoreFlow** - Build an e-commerce platform with PostgreSQL + Prisma, Stripe payments, and Redis caching.

→ **Course 3: TaskForge** - Build a project management tool with MongoDB + Mongoose and real-time updates with Socket.io.

---

## 📚 Additional Resources

- [Recharts Documentation](https://recharts.org/)
- [TanStack Table](https://tanstack.com/table/latest) - For advanced data tables
- [React Admin](https://marmelab.com/react-admin/) - Admin panel framework
- [Tremor](https://www.tremor.so/) - React components for dashboards
- [RBAC Best Practices](https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/)
