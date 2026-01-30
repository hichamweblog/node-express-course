# Lesson 2: Job Seeker Dashboard

## 🎯 Hook: Build the Experience for Job Seekers

A job seeker opens your platform with one goal: **find their next opportunity**. Their experience determines whether they'll keep using DevJobs Pro or switch to a competitor.

In this lesson, you'll build a complete job seeker dashboard with job browsing, search filters, application tracking, and profile management. This is where your backend API comes to life with a real user interface.

> 💡 **Senior Insight**: The job seeker is your primary user. If their experience is frustrating, no amount of employer features will save your platform. Obsess over their journey.

---

## 🧠 Theory: Dashboard Architecture

### Component Tree Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Job Seeker Dashboard Architecture                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  <App>                                                                       │
│   └── <AuthProvider>                                                         │
│        └── <QueryClientProvider>                                             │
│             └── <RouterProvider>                                             │
│                  │                                                           │
│                  ├── /login ───────────── <LoginPage>                       │
│                  ├── /register ────────── <RegisterPage>                    │
│                  │                                                           │
│                  └── <ProtectedRoute role="job_seeker">                     │
│                       └── <DashboardLayout>                                 │
│                            │                                                 │
│                            ├── <Sidebar>                                    │
│                            │    ├── Browse Jobs                             │
│                            │    ├── My Applications                         │
│                            │    ├── Saved Jobs                              │
│                            │    └── Profile                                 │
│                            │                                                 │
│                            └── <Outlet> (Page Content)                      │
│                                 │                                            │
│                                 ├── /dashboard ─── <BrowseJobsPage>         │
│                                 │    ├── <SearchBar>                        │
│                                 │    ├── <FilterPanel>                      │
│                                 │    ├── <JobList>                          │
│                                 │    │    └── <JobCard> (many)              │
│                                 │    └── <Pagination>                       │
│                                 │                                            │
│                                 ├── /jobs/:id ──── <JobDetailPage>          │
│                                 │    ├── <JobHeader>                        │
│                                 │    ├── <JobDescription>                   │
│                                 │    ├── <ApplyButton>                      │
│                                 │    └── <SaveButton>                       │
│                                 │                                            │
│                                 ├── /applications ── <ApplicationsPage>     │
│                                 │    ├── <ApplicationFilters>               │
│                                 │    └── <ApplicationList>                  │
│                                 │         └── <ApplicationCard>             │
│                                 │                                            │
│                                 ├── /saved ──────── <SavedJobsPage>         │
│                                 │    └── <JobList>                          │
│                                 │                                            │
│                                 └── /profile ────── <ProfilePage>           │
│                                      ├── <ProfileForm>                      │
│                                      ├── <ResumeUpload>                     │
│                                      └── <PasswordChange>                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### State Management Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         State Management Layers                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     SERVER STATE (TanStack Query)                    │   │
│  │                                                                      │   │
│  │  • Jobs list with filters      • Application list                   │   │
│  │  • Single job details          • User profile                       │   │
│  │  • Saved jobs                  • Cached for performance             │   │
│  │                                                                      │   │
│  │  Features: Caching, Background Refetch, Optimistic Updates          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     CLIENT STATE (React State)                       │   │
│  │                                                                      │   │
│  │  • Filter selections           • Modal open/closed                  │   │
│  │  • Form inputs                 • UI preferences                     │   │
│  │  • Pagination page             • Temporary selections               │   │
│  │                                                                      │   │
│  │  Features: useState, useReducer, Context (sparingly)               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       URL STATE (React Router)                       │   │
│  │                                                                      │   │
│  │  • Search query (shareable)    • Sort order                         │   │
│  │  • Filter values               • Pagination                         │   │
│  │                                                                      │   │
│  │  Benefits: Bookmarkable, Back button works, Shareable links         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Protected Routes Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Protected Route Flow                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User visits /dashboard                                                      │
│        │                                                                     │
│        ▼                                                                     │
│  ┌──────────────────┐                                                       │
│  │ ProtectedRoute   │                                                       │
│  │    Component     │                                                       │
│  └────────┬─────────┘                                                       │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────┐     No      ┌─────────────────┐                      │
│  │ Is user loading? │────────────▶│ Show Loading    │                      │
│  └────────┬─────────┘             │ Spinner         │                      │
│           │ Done                  └─────────────────┘                      │
│           ▼                                                                  │
│  ┌──────────────────┐     No      ┌─────────────────┐                      │
│  │ Is authenticated?│────────────▶│ Redirect to     │                      │
│  └────────┬─────────┘             │ /login          │                      │
│           │ Yes                   └─────────────────┘                      │
│           ▼                                                                  │
│  ┌──────────────────┐     No      ┌─────────────────┐                      │
│  │ Has required     │────────────▶│ Redirect to     │                      │
│  │ role?            │             │ /unauthorized   │                      │
│  └────────┬─────────┘             └─────────────────┘                      │
│           │ Yes                                                             │
│           ▼                                                                  │
│  ┌──────────────────┐                                                       │
│  │ Render protected │                                                       │
│  │ content          │                                                       │
│  └──────────────────┘                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### 1. Protected Route Component

```typescript
// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/user';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

// Usage in router
// <Route element={<ProtectedRoute allowedRoles={['job_seeker']} />}>
//   <Route path="dashboard" element={<DashboardPage />} />
// </Route>
```

### 2. Dashboard Layout with Sidebar

```typescript
// src/components/layout/DashboardLayout.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Briefcase,
  FileText,
  Bookmark,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const jobSeekerNavItems: NavItem[] = [
  { label: 'Browse Jobs', to: '/dashboard', icon: <Briefcase size={20} /> },
  { label: 'My Applications', to: '/applications', icon: <FileText size={20} /> },
  { label: 'Saved Jobs', to: '/saved', icon: <Bookmark size={20} /> },
  { label: 'Profile', to: '/profile', icon: <User size={20} /> },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
        <span className="font-semibold">DevJobs Pro</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button (mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-xl font-bold text-primary">DevJobs Pro</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {jobSeekerNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
```

### 3. Job Listing with Pagination

```typescript
// src/pages/seeker/BrowseJobsPage.tsx
import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useJobs } from '@/hooks/useJobs';
import { JobCard } from '@/components/job/JobCard';
import { SearchBar } from '@/components/common/SearchBar';
import { FilterPanel } from '@/components/job/FilterPanel';
import { Pagination } from '@/components/common/Pagination';
import { JobCardSkeleton } from '@/components/job/JobCardSkeleton';
import type { JobFilters, JobType } from '@/types/job';

export const BrowseJobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Parse filters from URL
  const filters: JobFilters = useMemo(
    () => ({
      search: searchParams.get('search') || undefined,
      location: searchParams.get('location') || undefined,
      type: (searchParams.get('type') as JobType) || undefined,
      salaryMin: searchParams.get('salaryMin')
        ? Number(searchParams.get('salaryMin'))
        : undefined,
      salaryMax: searchParams.get('salaryMax')
        ? Number(searchParams.get('salaryMax'))
        : undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: 10,
      sortBy: (searchParams.get('sortBy') as JobFilters['sortBy']) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as JobFilters['sortOrder']) || 'desc',
    }),
    [searchParams]
  );

  // Fetch jobs with filters
  const { data, isLoading, isError, error } = useJobs(filters);

  // Update filters in URL
  const updateFilters = (newFilters: Partial<JobFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change (except for page itself)
    if (!('page' in newFilters)) {
      params.set('page', '1');
    }

    setSearchParams(params);
  };

  const handleSearch = (search: string) => {
    updateFilters({ search });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 mt-1">
          Find your next opportunity from {data?.pagination.total || 0} available
          positions
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={filters.search || ''}
            onChange={handleSearch}
            placeholder="Search jobs by title, company, or skills..."
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <FilterIcon />
          Filters
          {Object.keys(filters).filter(
            (k) => !['page', 'limit', 'sortBy', 'sortOrder'].includes(k) && filters[k as keyof JobFilters]
          ).length > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
              {Object.keys(filters).filter(
                (k) => !['page', 'limit', 'sortBy', 'sortOrder'].includes(k) && filters[k as keyof JobFilters]
              ).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={updateFilters}
          onClear={clearFilters}
        />
      )}

      {/* Results */}
      <div className="space-y-4">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Failed to load jobs</p>
            <p className="text-sm mt-1">
              {error instanceof Error ? error.message : 'Please try again later'}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && data?.data.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Job list */}
        {!isLoading && !isError && data && data.data.length > 0 && (
          <>
            <div className="space-y-4">
              {data.data.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <JobCard job={job} />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

// Filter icon component
const FilterIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);
```

### 4. Job Card Component

```typescript
// src/components/job/JobCard.tsx
import { formatDistanceToNow } from 'date-fns';
import type { Job } from '@/types/job';
import { MapPin, Clock, DollarSign, Building2 } from 'lucide-react';
import clsx from 'clsx';

interface JobCardProps {
  job: Job;
  showActions?: boolean;
  onSave?: () => void;
  isSaved?: boolean;
}

const jobTypeStyles: Record<Job['type'], string> = {
  'full-time': 'bg-green-100 text-green-800',
  'part-time': 'bg-blue-100 text-blue-800',
  contract: 'bg-orange-100 text-orange-800',
  remote: 'bg-purple-100 text-purple-800',
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  showActions = false,
  onSave,
  isSaved,
}) => {
  const formatSalary = (salary: Job['salary']) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg border hover:border-primary hover:shadow-md transition-all">
      <div className="flex gap-4">
        {/* Company logo */}
        <div className="flex-shrink-0">
          {job.company.logo ? (
            <img
              src={job.company.logo}
              alt={job.company.name}
              className="w-14 h-14 rounded-lg object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-gray-600">{job.company.name}</p>
            </div>

            {/* Job type badge */}
            <span
              className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium flex-shrink-0',
                jobTypeStyles[job.type]
              )}
            >
              {job.type.replace('-', ' ')}
            </span>
          </div>

          {/* Meta info */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={16} />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={16} />
              {formatSalary(job.salary)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Skills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onSave?.();
            }}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isSaved
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
};
```

### 5. Application Tracking Component

```typescript
// src/pages/seeker/ApplicationsPage.tsx
import { useState } from 'react';
import { useApplications, useWithdrawApplication } from '@/hooks/useApplications';
import { ApplicationCard } from '@/components/application/ApplicationCard';
import { ApplicationSkeleton } from '@/components/application/ApplicationSkeleton';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import type { ApplicationStatus } from '@/types/application';
import clsx from 'clsx';

const statusFilters: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Interview', value: 'interview' },
  { label: 'Offered', value: 'offered' },
  { label: 'Rejected', value: 'rejected' },
];

export const ApplicationsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [withdrawId, setWithdrawId] = useState<string | null>(null);

  const { data: applications, isLoading, isError } = useApplications();
  const withdrawMutation = useWithdrawApplication();

  // Filter applications
  const filteredApplications = applications?.filter((app) =>
    statusFilter === 'all' ? true : app.status === statusFilter
  );

  const handleWithdraw = () => {
    if (withdrawId) {
      withdrawMutation.mutate(withdrawId, {
        onSuccess: () => setWithdrawId(null),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">
          Track the status of your job applications
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              statusFilter === filter.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {filter.label}
            {filter.value !== 'all' &&
              applications && (
                <span className="ml-1">
                  ({applications.filter((a) => a.status === filter.value).length})
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="space-y-4">
        {isLoading && (
          <>
            {[...Array(3)].map((_, i) => (
              <ApplicationSkeleton key={i} />
            ))}
          </>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Failed to load applications</p>
          </div>
        )}

        {!isLoading && !isError && filteredApplications?.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              {statusFilter === 'all'
                ? 'No applications yet'
                : `No ${statusFilter} applications`}
            </h3>
            <p className="text-gray-500 mt-2">
              {statusFilter === 'all'
                ? 'Start applying to jobs to see them here'
                : 'Try selecting a different status filter'}
            </p>
          </div>
        )}

        {filteredApplications?.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onWithdraw={() => setWithdrawId(application.id)}
          />
        ))}
      </div>

      {/* Withdraw confirmation modal */}
      <ConfirmModal
        isOpen={!!withdrawId}
        onClose={() => setWithdrawId(null)}
        onConfirm={handleWithdraw}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmLabel="Withdraw"
        confirmVariant="danger"
        isLoading={withdrawMutation.isPending}
      />
    </div>
  );
};
```

### 6. Profile Form with Resume Upload

```typescript
// src/pages/seeker/ProfilePage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useProfile';
import { FileUpload } from '@/components/common/FileUpload';
import { useToast } from '@/hooks/useToast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  location: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  linkedIn: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      location: (user as any)?.location || '',
      skills: (user as any)?.skills?.join(', ') || '',
      experience: (user as any)?.experience || '',
      linkedIn: (user as any)?.linkedIn || '',
      portfolio: (user as any)?.portfolio || '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(
      {
        ...data,
        skills: data.skills?.split(',').map((s) => s.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          toast({ title: 'Profile updated successfully', type: 'success' });
        },
        onError: () => {
          toast({ title: 'Failed to update profile', type: 'error' });
        },
      }
    );
  };

  const handleResumeUpload = async (file: File) => {
    // Upload to your backend/Cloudinary
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      });
      const { url } = await response.json();

      updateProfile.mutate(
        { resume: url },
        {
          onSuccess: () => {
            toast({ title: 'Resume uploaded successfully', type: 'success' });
          },
        }
      );
    } catch {
      toast({ title: 'Failed to upload resume', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">
          Keep your profile up to date to attract employers
        </p>
      </div>

      {/* Resume Section */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Resume</h2>
        <FileUpload
          accept=".pdf,.doc,.docx"
          maxSize={5 * 1024 * 1024} // 5MB
          onUpload={handleResumeUpload}
          currentFile={(user as any)?.resume}
          label="Upload your resume (PDF, DOC, DOCX - Max 5MB)"
        />
      </section>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
              disabled
            />
            <p className="text-gray-500 text-xs mt-1">
              Contact support to change your email
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              {...register('location')}
              type="text"
              placeholder="e.g., San Francisco, CA"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <input
              {...register('skills')}
              type="text"
              placeholder="e.g., React, TypeScript, Node.js"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-gray-500 text-xs mt-1">
              Separate skills with commas
            </p>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience Summary
            </label>
            <textarea
              {...register('experience')}
              rows={4}
              placeholder="Brief summary of your experience..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile
              </label>
              <input
                {...register('linkedIn')}
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio Website
              </label>
              <input
                {...register('portfolio')}
                type="url"
                placeholder="https://..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || updateProfile.isPending}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Password Change Section */}
      <PasswordChangeForm />
    </div>
  );
};
```

---

## 🎓 Mini-Tutorial: Build Job Search with Filters and Pagination

Let's build a complete job search feature step by step.

### Step 1: Create the Filter Panel Component

```typescript
// src/components/job/FilterPanel.tsx
import type { JobFilters, JobType } from '@/types/job';

interface FilterPanelProps {
  filters: JobFilters;
  onChange: (filters: Partial<JobFilters>) => void;
  onClear: () => void;
}

const jobTypes: { label: string; value: JobType }[] = [
  { label: 'Full Time', value: 'full-time' },
  { label: 'Part Time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Remote', value: 'remote' },
];

const locations = [
  'Remote',
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA',
  'Los Angeles, CA',
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onClear,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        <button
          onClick={onClear}
          className="text-sm text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            value={filters.location || ''}
            onChange={(e) => onChange({ location: e.target.value || undefined })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Job type filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Type
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) =>
              onChange({ type: (e.target.value as JobType) || undefined })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All types</option>
            {jobTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min salary filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Salary
          </label>
          <input
            type="number"
            value={filters.salaryMin || ''}
            onChange={(e) =>
              onChange({
                salaryMin: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="e.g., 50000"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Sort by */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              onChange({
                sortBy: sortBy as JobFilters['sortBy'],
                sortOrder: sortOrder as JobFilters['sortOrder'],
              });
            }}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="createdAt-asc">Oldest first</option>
            <option value="salary-desc">Highest salary</option>
            <option value="salary-asc">Lowest salary</option>
            <option value="title-asc">Title A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};
```

### Step 2: Create Pagination Component

```typescript
// src/components/common/Pagination.tsx
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              'px-3 py-2 rounded-lg font-medium transition-colors',
              currentPage === page
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100'
            )}
          >
            {page}
          </button>
        )
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
```

### Step 3: Wire It All Together

The `BrowseJobsPage` component shown earlier brings together:

- URL-based filter state management
- TanStack Query for data fetching
- Filter panel component
- Job cards with responsive layout
- Pagination with page number display

---

## 🏗️ Practice: DevJobs Pro Job Seeker Dashboard

### Your Tasks

Build the complete job seeker dashboard with these features:

#### 1. Browse Jobs

- [ ] Search bar with debounced input
- [ ] Filter by location (dropdown)
- [ ] Filter by job type (multi-select or dropdown)
- [ ] Filter by salary range (min/max inputs)
- [ ] Pagination with page numbers
- [ ] Sort by date, salary, or title
- [ ] Loading skeletons during fetch
- [ ] Empty state when no results
- [ ] Filters persist in URL (shareable links)

#### 2. Job Details

- [ ] Full job description display
- [ ] Company info sidebar
- [ ] Skills list/tags
- [ ] Salary information
- [ ] Apply button (opens modal or navigates)
- [ ] Save/unsave job toggle
- [ ] "Similar jobs" section (bonus)

#### 3. My Applications

- [ ] List of all applications
- [ ] Filter by status
- [ ] Status badge with colors
- [ ] Applied date display
- [ ] Withdraw application option
- [ ] Link to original job posting
- [ ] Empty state handling

#### 4. Profile

- [ ] Edit personal information
- [ ] Upload/replace resume
- [ ] Skills tags input
- [ ] Experience summary
- [ ] Social links (LinkedIn, portfolio)
- [ ] Change password section

#### 5. Saved Jobs

- [ ] List of bookmarked jobs
- [ ] Unsave functionality
- [ ] Quick apply option
- [ ] Empty state message

---

## 💡 Pro Tips vs Junior Traps

| Aspect               | ❌ Junior Trap                                | ✅ Pro Tip                                  |
| -------------------- | --------------------------------------------- | ------------------------------------------- |
| **Data Fetching**    | Loading spinner on every action               | Optimistic updates + background refetch     |
| **Filter State**     | Keeping filters in useState (lost on refresh) | Store filters in URL search params          |
| **Loading States**   | Generic "Loading..." text                     | Skeleton components matching content shape  |
| **Error Handling**   | Alert or console.log                          | Toast notifications + inline error messages |
| **Pagination**       | Fetch all data, paginate client-side          | Server-side pagination with total count     |
| **Form Validation**  | Validate only on submit                       | Show errors as user types (debounced)       |
| **Cache Management** | No caching, fetch every time                  | TanStack Query with appropriate staleTime   |
| **Empty States**     | Blank screen                                  | Helpful message + call-to-action            |

---

## 🔧 5-Minute Debugger

### Problem 1: "Unauthorized" on Protected Routes

```
GET /api/auth/me → 401 Unauthorized
```

**Quick Diagnosis:**

```typescript
// Check 1: Is token in localStorage?
console.log(localStorage.getItem('accessToken'));
// If null → user never logged in or tokens were cleared

// Check 2: Is useAuth query enabled when there's a token?
const { data: user } = useQuery({
  queryKey: ['auth', 'me'],
  queryFn: authApi.getMe,
  enabled: !!getAccessToken(), // Is this true?
});

// Check 3: Is ProtectedRoute waiting for auth check?
if (isLoading) {
  return <LoadingSpinner />; // Don't redirect while checking
}

// Check 4: Is refresh token flow working?
// Add logging to interceptor:
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Auth error, attempting refresh...', error.response?.status);
    // ... rest of refresh logic
  }
);
```

---

### Problem 2: Stale Data After Mutation

```
// I updated my profile, but the UI still shows old data!
```

**Quick Diagnosis:**

```typescript
// Problem: Not invalidating queries after mutation
const updateProfile = useMutation({
  mutationFn: profileApi.update,
  // ❌ Missing onSuccess!
});

// Solution: Invalidate or update cache
const updateProfile = useMutation({
  mutationFn: profileApi.update,
  onSuccess: (updatedUser) => {
    // Option 1: Invalidate (refetch from server)
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

    // Option 2: Update cache directly (faster)
    queryClient.setQueryData(["auth", "me"], updatedUser);
  },
});

// Also check: Is the component subscribed to the right query key?
const { data: user } = useQuery({
  queryKey: ["auth", "me"], // Must match what you're invalidating
  queryFn: authApi.getMe,
});
```

---

### Problem 3: Form Validation Issues

```
// Form submits even with invalid data
// Or errors don't show up
```

**Quick Diagnosis:**

```typescript
// Check 1: Is zodResolver connected correctly?
const {
  handleSubmit,
  formState: { errors }, // Are you destructuring errors?
} = useForm({
  resolver: zodResolver(schema), // Is this here?
});

// Check 2: Are error messages being displayed?
<input {...register('email')} />
{errors.email && <span>{errors.email.message}</span>}
// Not errors.email?.message - errors might be empty object

// Check 3: Is form mode set correctly?
useForm({
  mode: 'onBlur', // Validate on blur
  // or 'onChange' // Validate as user types
  // or 'onSubmit' // Only validate on submit (default)
});

// Check 4: Schema matches form field names?
const schema = z.object({
  email: z.string().email(), // Must match register('email')
});
```

---

## ✅ Definition of Done Checklist

Before moving to Lesson 3, verify:

**Protected Routes:**

- [ ] Unauthenticated users are redirected to login
- [ ] Users with wrong role see unauthorized page
- [ ] Loading state shown while checking auth
- [ ] After login, user returns to originally requested page

**Browse Jobs:**

- [ ] Jobs load with pagination (10 per page)
- [ ] Search filters by title, company, skills
- [ ] Location filter works
- [ ] Job type filter works
- [ ] Salary range filters work
- [ ] Pagination controls work
- [ ] Filters persist in URL
- [ ] Loading skeletons display during fetch
- [ ] Empty state shows when no results

**Job Details:**

- [ ] Job details page loads correctly
- [ ] All job information displays
- [ ] Apply button triggers application flow
- [ ] Save/unsave job works

**My Applications:**

- [ ] All applications display
- [ ] Status filter works
- [ ] Withdraw application works
- [ ] Confirmation modal for withdraw
- [ ] Empty state when no applications

**Profile:**

- [ ] Profile form pre-fills with current data
- [ ] Validation errors show correctly
- [ ] Save changes updates profile
- [ ] Resume upload works
- [ ] Success toast on save

**Saved Jobs:**

- [ ] Saved jobs list displays
- [ ] Unsave functionality works
- [ ] Empty state when none saved

---

## 🔗 Navigation

| Previous                                                                  | Next                                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [← Lesson 1: React Project Setup](./01-react-project-setup-api-client.md) | [Lesson 3: Employer Dashboard →](./03-employer-dashboard.md) |

---

_Your job seekers now have a complete experience. Next up: empowering employers to find their perfect candidates! 🎯_
