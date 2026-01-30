# Module 15: React Frontend

## Lesson 3: Employer Dashboard

# Empower Employers to Manage Their Hiring Process

As an employer, posting jobs and tracking applicants should feel powerful yet simple. In this lesson, we'll build a complete employer dashboard that lets companies post jobs, manage listings, and review applications—all with a professional, intuitive interface.

---

## 📖 Theory

### Dashboard Architecture for Different User Roles

Employers need a fundamentally different experience than job seekers. While seekers browse and apply, employers create and manage.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EMPLOYER DASHBOARD ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      NAVIGATION BAR                          │   │
│   │  [Dashboard] [Post Job] [My Jobs] [Applications] [Profile]  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   ┌──────────────────────┐  ┌────────────────────────────────────┐  │
│   │    SIDEBAR           │  │           MAIN CONTENT              │  │
│   │                      │  │                                     │  │
│   │  📊 Overview         │  │  ┌─────────────────────────────────┐│  │
│   │  ➕ Post New Job     │  │  │  DYNAMIC CONTENT AREA           ││  │
│   │  📋 Active Jobs (5)  │  │  │                                 ││  │
│   │  📁 Drafts (2)       │  │  │  - Job listings table           ││  │
│   │  ✅ Closed (12)      │  │  │  - Job posting form             ││  │
│   │  👥 All Applicants   │  │  │  - Application review           ││  │
│   │  🏢 Company Profile  │  │  │  - Analytics charts             ││  │
│   │  ⚙️  Settings        │  │  │                                 ││  │
│   │                      │  │  └─────────────────────────────────┘│  │
│   └──────────────────────┘  └────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Role-Based UI Rendering

```
┌─────────────────────────────────────────────────────────────────┐
│                   ROLE-BASED COMPONENT TREE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   <ProtectedRoute allowedRoles={['employer', 'admin']}>         │
│       │                                                         │
│       └── <EmployerLayout>                                      │
│               │                                                 │
│               ├── <Sidebar>                                     │
│               │       ├── <NavItem to="/employer/dashboard" />  │
│               │       ├── <NavItem to="/employer/jobs" />       │
│               │       └── <NavItem to="/employer/profile" />    │
│               │                                                 │
│               └── <Outlet />  ← Nested routes render here       │
│                       │                                         │
│                       ├── <DashboardOverview />                 │
│                       ├── <JobListings />                       │
│                       ├── <JobForm />                           │
│                       ├── <ApplicationReview />                 │
│                       └── <CompanyProfile />                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow for Job Management

```
┌────────────────────────────────────────────────────────────────────┐
│                    JOB MANAGEMENT DATA FLOW                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐  │
│  │   EMPLOYER   │    │   REACT QUERY   │    │    EXPRESS API   │  │
│  │   ACTIONS    │    │     CACHE       │    │                  │  │
│  └──────┬───────┘    └────────┬────────┘    └────────┬─────────┘  │
│         │                     │                       │            │
│         │ Post New Job        │                       │            │
│         │────────────────────>│ useMutation           │            │
│         │                     │──────────────────────>│            │
│         │                     │                       │ POST /jobs │
│         │                     │                       │            │
│         │                     │<──────────────────────│            │
│         │                     │    { newJob }         │            │
│         │                     │                       │            │
│         │                     │ Invalidate ['jobs']   │            │
│         │                     │ Cache updated         │            │
│         │<────────────────────│                       │            │
│         │  UI updates         │                       │            │
│         │  automatically      │                       │            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Example 1: Job Posting Form with Multi-Step Wizard

<details>
<summary>📄 TypeScript Implementation</summary>

```typescript
// src/features/employer/components/JobPostingWizard.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobsApi, CreateJobInput } from '@/api/jobs';

// Validation schema
const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['full-time', 'part-time', 'contract', 'remote']),
  salaryMin: z.number().min(0),
  salaryMax: z.number().min(0),
  requirements: z.array(z.string()).min(1, 'At least one requirement'),
  benefits: z.array(z.string()).optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

const STEPS = ['Basic Info', 'Details', 'Requirements', 'Preview'] as const;

export function JobPostingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      type: 'full-time',
      salaryMin: 0,
      salaryMax: 0,
      requirements: [],
      benefits: [],
    },
  });

  const createJobMutation = useMutation({
    mutationFn: (data: CreateJobInput) => jobsApi.create(data),
    onSuccess: (newJob) => {
      // Invalidate and refetch job listings
      queryClient.invalidateQueries({ queryKey: ['jobs', 'employer'] });
      navigate(`/employer/jobs/${newJob.id}`);
    },
  });

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = (data: JobFormData) => {
    createJobMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Indicator */}
      <div className="flex justify-between mb-8">
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`flex items-center ${
              index <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {index + 1}
            </div>
            <span className="ml-2 hidden sm:inline">{step}</span>
            {index < STEPS.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <BasicInfoStep form={form} />
        )}

        {/* Step 2: Details */}
        {currentStep === 1 && (
          <DetailsStep form={form} />
        )}

        {/* Step 3: Requirements */}
        {currentStep === 2 && (
          <RequirementsStep form={form} />
        )}

        {/* Step 4: Preview */}
        {currentStep === 3 && (
          <PreviewStep data={form.getValues()} />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={createJobMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {createJobMutation.isPending ? 'Publishing...' : 'Publish Job'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
```

</details>

---

## Example 2: Job Listings Table with Actions

<details>
<summary>📄 TypeScript Implementation</summary>

```typescript
// src/features/employer/components/JobListingsTable.tsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobsApi, Job, JobStatus } from '@/api/jobs';
import { ConfirmModal } from '@/components/ConfirmModal';
import { formatDate, formatRelative } from '@/utils/date';

export function JobListingsTable() {
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const queryClient = useQueryClient();

  // Fetch employer's jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', 'employer'],
    queryFn: () => jobsApi.getMyJobs(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.delete(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'employer'] });
      setDeleteTarget(null);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: JobStatus }) =>
      jobsApi.updateStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'employer'] });
    },
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Applications
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Posted
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs?.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    to={`/employer/jobs/${job.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {job.title}
                  </Link>
                  <p className="text-sm text-gray-500">{job.location}</p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/employer/jobs/${job.id}/applications`}
                    className="text-blue-600 hover:underline"
                  >
                    {job.applicationCount} applicants
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatRelative(job.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <ActionDropdown
                    job={job}
                    onStatusChange={(status) =>
                      updateStatusMutation.mutate({ jobId: job.id, status })
                    }
                    onDelete={() => setDeleteTarget(job)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Job Posting"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    closed: 'bg-red-100 text-red-800',
    paused: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

</details>

---

## Example 3: Application Review Interface

<details>
<summary>📄 TypeScript Implementation</summary>

```typescript
// src/features/employer/components/ApplicationReview.tsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { applicationsApi, Application, ApplicationStatus } from '@/api/applications';
import { ResumeViewer } from '@/components/ResumeViewer';

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending Review', color: 'bg-gray-100' },
  { value: 'reviewing', label: 'Under Review', color: 'bg-blue-100' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-green-100' },
  { value: 'interview', label: 'Interview Scheduled', color: 'bg-purple-100' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100' },
  { value: 'hired', label: 'Hired', color: 'bg-emerald-100' },
];

export function ApplicationReview() {
  const { jobId } = useParams<{ jobId: string }>();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const queryClient = useQueryClient();

  // Fetch applications for this job
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', jobId],
    queryFn: () => applicationsApi.getByJob(jobId!),
    enabled: !!jobId,
  });

  // Update application status
  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status, notes }: {
      applicationId: string;
      status: ApplicationStatus;
      notes?: string;
    }) => applicationsApi.updateStatus(applicationId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', jobId] });
    },
  });

  // Filter applications
  const filteredApplications = applications?.filter(
    (app) => statusFilter === 'all' || app.status === statusFilter
  );

  return (
    <div className="flex h-full">
      {/* Application List */}
      <div className="w-1/3 border-r overflow-y-auto">
        {/* Filter Dropdown */}
        <div className="p-4 border-b">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">All Applications ({applications?.length})</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({applications?.filter((a) => a.status === opt.value).length})
              </option>
            ))}
          </select>
        </div>

        {/* Application Cards */}
        <div className="divide-y">
          {filteredApplications?.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              isSelected={selectedApplication?.id === application.id}
              onClick={() => setSelectedApplication(application)}
            />
          ))}
        </div>
      </div>

      {/* Application Detail Panel */}
      <div className="w-2/3 overflow-y-auto">
        {selectedApplication ? (
          <ApplicationDetail
            application={selectedApplication}
            onStatusChange={(status, notes) =>
              updateStatusMutation.mutate({
                applicationId: selectedApplication.id,
                status,
                notes,
              })
            }
            isUpdating={updateStatusMutation.isPending}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select an application to review
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({
  application,
  isSelected,
  onClick,
}: {
  application: Application;
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusOption = STATUS_OPTIONS.find((s) => s.value === application.status);

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{application.applicant.name}</h3>
        <span className={`px-2 py-1 rounded text-xs ${statusOption?.color}`}>
          {statusOption?.label}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{application.applicant.email}</p>
      <p className="text-xs text-gray-400 mt-2">
        Applied {formatRelative(application.createdAt)}
      </p>
    </div>
  );
}

function ApplicationDetail({
  application,
  onStatusChange,
  isUpdating,
}: {
  application: Application;
  onStatusChange: (status: ApplicationStatus, notes?: string) => void;
  isUpdating: boolean;
}) {
  const [notes, setNotes] = useState(application.employerNotes || '');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>(application.status);

  return (
    <div className="p-6">
      {/* Applicant Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{application.applicant.name}</h2>
          <p className="text-gray-600">{application.applicant.email}</p>
          {application.applicant.phone && (
            <p className="text-gray-600">{application.applicant.phone}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
            className="border rounded px-3 py-2"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onStatusChange(newStatus, notes)}
            disabled={isUpdating || newStatus === application.status}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>

      {/* Cover Letter */}
      {application.coverLetter && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Cover Letter</h3>
          <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
            {application.coverLetter}
          </div>
        </div>
      )}

      {/* Resume */}
      {application.resumeUrl && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Resume</h3>
          <ResumeViewer url={application.resumeUrl} />
        </div>
      )}

      {/* Employer Notes */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Internal Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this applicant (not visible to applicant)..."
          className="w-full border rounded p-3 h-32"
        />
      </div>
    </div>
  );
}
```

</details>

---

## 🛠️ Practice: DevJobs Pro Employer Dashboard

Now let's implement the complete employer dashboard for DevJobs Pro.

### Component Structure

```
src/features/employer/
├── components/
│   ├── JobPostingWizard/
│   │   ├── index.tsx
│   │   ├── BasicInfoStep.tsx
│   │   ├── DetailsStep.tsx
│   │   ├── RequirementsStep.tsx
│   │   └── PreviewStep.tsx
│   ├── JobListingsTable.tsx
│   ├── ApplicationReview.tsx
│   ├── CompanyProfileForm.tsx
│   ├── EmployerStats.tsx
│   └── ActionDropdown.tsx
├── pages/
│   ├── EmployerDashboard.tsx
│   ├── EmployerJobs.tsx
│   ├── EmployerJobDetail.tsx
│   ├── EmployerApplications.tsx
│   └── EmployerProfile.tsx
├── hooks/
│   ├── useEmployerJobs.ts
│   ├── useJobApplications.ts
│   └── useCompanyProfile.ts
└── layouts/
    └── EmployerLayout.tsx
```

### Routing Configuration

```typescript
// src/routes/employer.routes.tsx
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { EmployerLayout } from '@/features/employer/layouts/EmployerLayout';

export const employerRoutes: RouteObject = {
  path: '/employer',
  element: (
    <ProtectedRoute allowedRoles={['employer', 'admin']}>
      <EmployerLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <EmployerDashboard /> },
    { path: 'jobs', element: <EmployerJobs /> },
    { path: 'jobs/new', element: <JobPostingWizard /> },
    { path: 'jobs/:jobId', element: <EmployerJobDetail /> },
    { path: 'jobs/:jobId/edit', element: <JobPostingWizard mode="edit" /> },
    { path: 'jobs/:jobId/applications', element: <ApplicationReview /> },
    { path: 'profile', element: <EmployerProfile /> },
  ],
};
```

---

## ✅ Definition of Done

Before moving on, ensure:

- [ ] Employer layout with sidebar navigation works
- [ ] Job posting wizard validates each step
- [ ] Job listings table shows all employer's jobs
- [ ] Status updates work with optimistic UI
- [ ] Delete confirms before executing
- [ ] Application review shows applicant details
- [ ] Resume viewer displays uploaded resumes
- [ ] Status changes trigger email notifications (backend)
- [ ] Company profile updates save correctly
- [ ] All actions are properly authorized

---

## 💡 Pro Tips vs Junior Traps

| Category         | Junior Trap 🚫                     | Pro Tip ⭐                                                               |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| **Form State**   | Losing form data on navigation     | Use form library with persistence (react-hook-form + localStorage draft) |
| **Modals**       | Modal behind other elements        | Use portal with proper z-index management                                |
| **Bulk Actions** | Individual API calls for each item | Batch operations in single request                                       |
| **Feedback**     | No indication action succeeded     | Toast notifications + optimistic updates                                 |
| **Confirmation** | Delete without warning             | Always confirm destructive actions                                       |
| **Table Design** | Cramped, hard to scan              | Generous spacing, clear visual hierarchy                                 |

---

## 🐛 5-Minute Debugger

### Issue: Form losing state on step navigation

```
Symptom: Data disappears when going back to previous step

Diagnosis:
1. Check if form is being unmounted on step change
2. Are you using controlled vs uncontrolled inputs?
3. Is form state lifting to parent correctly?

Solution:
- Use single form component with conditional step rendering
- Don't unmount steps, just hide them (CSS)
- Or persist to localStorage between steps
```

### Issue: Modal appears behind other elements

```
Symptom: Modal overlay works but content is hidden

Diagnosis:
1. Check z-index stacking context
2. Is modal rendered inside a container with transform/position?
3. Are you using a portal?

Solution:
- Always use createPortal for modals
- Render to document.body or dedicated portal root
- Set z-index on portal container, not just modal
```

### Issue: Data not refreshing after mutation

```
Symptom: Changes save but UI doesn't update

Diagnosis:
1. Is queryKey correct in invalidateQueries?
2. Are you awaiting the mutation?
3. Is there a cache time issue?

Solution:
// Correct invalidation pattern
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['jobs', 'employer'] });
  // For immediate update, also do:
  queryClient.setQueryData(['jobs', 'employer'], (old) =>
    old?.map(j => j.id === updatedJob.id ? updatedJob : j)
  );
}
```

---

## 🚀 Next Steps

In the next lesson, we'll build the **Admin Panel** with:

- User management interface
- Job moderation queue
- Analytics dashboard
- System settings

The admin panel brings everything together and gives platform administrators complete control.

→ **Next:** [Lesson 4 - Admin Panel](./04-admin-panel.md)

---

## 📚 Additional Resources

- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [React Hook Form](https://react-hook-form.com/)
- [Radix UI Components](https://www.radix-ui.com/) - Accessible UI primitives
- [Headless UI](https://headlessui.com/) - Unstyled, accessible components
