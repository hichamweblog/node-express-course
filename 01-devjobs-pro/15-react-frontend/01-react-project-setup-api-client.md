# Lesson 1: React Project Setup & API Client

## 🎯 Hook: Connect Your Frontend to the Backend You Built

You've spent 14 modules building a production-ready backend with authentication, authorization, file uploads, validation, and testing. Now comes the exciting part: **connecting a real frontend to it**.

This lesson teaches you to set up a **professional React project** with TypeScript and create a **type-safe API client** that communicates with your Express backend. By the end, you'll have the foundation for building three complete dashboards.

> 💡 **Senior Insight**: The API client is arguably the most important part of your frontend architecture. A well-designed client makes every feature easier to build; a poorly designed one creates bugs and technical debt that compound over time.

---

## 🧠 Theory: Frontend ↔ Backend Communication

### The Big Picture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Frontend ↔ Backend Flow                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        REACT FRONTEND                                 │  │
│  │                                                                       │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐     │  │
│  │   │ Components  │───▶│  TanStack   │───▶│    API Client       │     │  │
│  │   │  (UI Layer) │    │   Query     │    │  (Axios Instance)   │     │  │
│  │   └─────────────┘    │  (Cache)    │    └──────────┬──────────┘     │  │
│  │         ▲            └─────────────┘               │                 │  │
│  │         │                   │                      │                 │  │
│  │         │            ┌──────▼──────┐              │                 │  │
│  │         └────────────│   Hooks     │              │                 │  │
│  │                      │ useJobs()   │              │                 │  │
│  │                      │ useAuth()   │              │                 │  │
│  │                      └─────────────┘              │                 │  │
│  └───────────────────────────────────────────────────┼──────────────────┘  │
│                                                      │                      │
│                           HTTP Request (with JWT)    │                      │
│                                                      ▼                      │
│  ════════════════════════════════════════════════════════════════════════  │
│                              NETWORK BOUNDARY                               │
│  ════════════════════════════════════════════════════════════════════════  │
│                                                      │                      │
│  ┌───────────────────────────────────────────────────┼──────────────────┐  │
│  │                      EXPRESS BACKEND              │                   │  │
│  │                                                   ▼                   │  │
│  │   ┌────────────┐   ┌────────────┐   ┌────────────────────────┐      │  │
│  │   │  Routes    │──▶│ Middleware │──▶│     Controllers        │      │  │
│  │   │            │   │  (Auth)    │   │                        │      │  │
│  │   └────────────┘   └────────────┘   └───────────┬────────────┘      │  │
│  │                                                  │                   │  │
│  │                                                  ▼                   │  │
│  │                                     ┌────────────────────────┐      │  │
│  │                                     │    Services / DB       │      │  │
│  │                                     └────────────────────────┘      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why Vite (Not Create React App)?

| Feature                    | Vite          | Create React App |
| -------------------------- | ------------- | ---------------- |
| **Cold Start**             | ~200ms        | ~30s             |
| **Hot Module Replacement** | Instant       | 2-5s             |
| **Build Time**             | Seconds       | Minutes          |
| **Bundle Size**            | Smaller (ESM) | Larger           |
| **Maintenance**            | Active        | Deprecated       |
| **TypeScript**             | Native        | Requires config  |

> ⚠️ **Important**: Create React App is officially deprecated. Use Vite for all new projects.

### Axios vs Fetch

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Axios vs Fetch                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  AXIOS                              │  FETCH                             │
│  ─────────────────────────────────  │  ─────────────────────────────────│
│  ✅ Interceptors (auth, logging)    │  ❌ No interceptors                │
│  ✅ Automatic JSON parsing          │  ❌ Manual .json() call            │
│  ✅ Request cancellation easy       │  ✅ AbortController (verbose)      │
│  ✅ Request/response transforms     │  ❌ Manual transforms              │
│  ✅ Browser + Node.js support       │  ⚠️ Node 18+ only (native)         │
│  ✅ Progress events                 │  ❌ No progress events             │
│  ✅ Timeout configuration           │  ❌ Manual timeout handling        │
│                                                                          │
│  📦 Bundle size: ~13KB (gzipped)    │  📦 Bundle size: 0 (built-in)     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**My recommendation**: Use Axios when you need interceptors (which you always do for auth). The bundle size is worth it.

### Shared Types Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Sharing Types Between Frontend & Backend              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Option 1: Copy Types (Simple, starts to drift)                         │
│  ┌──────────────┐                    ┌──────────────┐                   │
│  │   Backend    │    copy/paste      │   Frontend   │                   │
│  │   types.ts   │ ───────────────▶   │   types.ts   │                   │
│  └──────────────┘                    └──────────────┘                   │
│                                                                          │
│  Option 2: Shared Package (Monorepo - more setup)                       │
│  ┌──────────────────────────────────────────────────┐                   │
│  │                  packages/shared                  │                   │
│  │                    types.ts                       │                   │
│  └────────────┬───────────────────────┬─────────────┘                   │
│               │                       │                                  │
│               ▼                       ▼                                  │
│       ┌───────────┐           ┌───────────┐                             │
│       │  Backend  │           │ Frontend  │                             │
│       └───────────┘           └───────────┘                             │
│                                                                          │
│  Option 3: Generate from OpenAPI/Swagger (Best for large teams)         │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐                │
│  │  Backend   │ ──▶  │  OpenAPI   │ ──▶  │  Generate  │                │
│  │  Endpoints │      │    Spec    │      │   Types    │                │
│  └────────────┘      └────────────┘      └────────────┘                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

For DevJobs Pro, we'll use **Option 1** (manual copy) to keep things simple, with careful attention to keeping types in sync.

### Environment Variables in React

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Environment Variables in Vite                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ⚠️  VITE_ prefix required for client-side exposure                      │
│                                                                          │
│  .env.development                   .env.production                      │
│  ─────────────────────────────      ─────────────────────────────       │
│  VITE_API_URL=http://localhost:3000 VITE_API_URL=https://api.devjobs.io │
│  VITE_APP_NAME=DevJobs (Dev)        VITE_APP_NAME=DevJobs Pro           │
│                                                                          │
│  Access in code:                                                         │
│  ──────────────────────────────────────────────────                     │
│  import.meta.env.VITE_API_URL                                           │
│  import.meta.env.VITE_APP_NAME                                          │
│                                                                          │
│  ⚠️  NEVER put secrets in VITE_ variables - they're exposed in bundle!  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### 1. Vite + React + TypeScript Setup

```bash
# Create the project
npm create vite@latest devjobs-frontend -- --template react-ts
cd devjobs-frontend

# Install core dependencies
npm install axios @tanstack/react-query react-router-dom
npm install react-hook-form @hookform/resolvers zod
npm install date-fns clsx

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node

# Initialize Tailwind
npx tailwindcss init -p
```

### 2. TypeScript Configuration

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting - Be strict! */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases for cleaner imports */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/api/*": ["src/api/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Proxy API requests to backend during development
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

### 3. Shared Types (Copy from Backend)

```typescript
// src/types/user.ts
export type UserRole = "job_seeker" | "employer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobSeekerProfile extends User {
  role: "job_seeker";
  resume?: string;
  skills: string[];
  experience: string;
  location?: string;
}

export interface EmployerProfile extends User {
  role: "employer";
  company: {
    name: string;
    logo?: string;
    website?: string;
    description?: string;
  };
}

// src/types/job.ts
export type JobType = "full-time" | "part-time" | "contract" | "remote";
export type JobStatus = "draft" | "pending" | "active" | "closed" | "rejected";

export interface Job {
  id: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  location: string;
  type: JobType;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  status: JobStatus;
  employerId: string;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  type?: JobType | JobType[];
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "salary" | "title";
  sortOrder?: "asc" | "desc";
}

// src/types/application.ts
export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "interview"
  | "offered"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  jobId: string;
  job: Pick<Job, "id" | "title" | "company" | "location" | "type">;
  applicantId: string;
  applicant?: Pick<User, "id" | "name" | "email">;
  coverLetter?: string;
  resume: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  };
}
```

### 4. Axios Instance with Interceptors

```typescript
// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "@/types/api";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
};

// Refresh token storage
export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
};

export const setRefreshToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("refreshToken", token);
  } else {
    localStorage.removeItem("refreshToken");
  }
};

// Clear all tokens (logout)
export const clearTokens = () => {
  accessToken = null;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// Request interceptor: Attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: Handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // If no config or already retried, reject
    if (!originalRequest || (originalRequest as any)._retry) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const refreshToken = getRefreshToken();

      // No refresh token - logout
      if (!refreshToken) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Already refreshing - queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      // Start refresh
      isRefreshing = true;
      (originalRequest as any)._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          { refreshToken },
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.error?.message || error.message || "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
```

### 5. Typed API Endpoints

```typescript
// src/api/auth.ts
import {
  apiClient,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "./client";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/types/user";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: "job_seeker" | "employer";
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data,
    );
    const { accessToken, refreshToken, user } = response.data.data;
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    return user;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data,
    );
    const { accessToken, refreshToken, user } = response.data.data;
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    return user;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      clearTokens();
    }
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post("/auth/reset-password", { token, password });
  },
};
```

```typescript
// src/api/jobs.ts
import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Job, JobFilters } from "@/types/job";

interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  type: Job["type"];
  salary: Job["salary"];
  skills: string[];
  expiresAt?: string;
}

interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: Job["status"];
}

export const jobsApi = {
  // Public endpoints
  getJobs: async (filters?: JobFilters): Promise<PaginatedResponse<Job>> => {
    const response = await apiClient.get<PaginatedResponse<Job>>("/jobs", {
      params: filters,
    });
    return response.data;
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data.data;
  },

  // Employer endpoints
  createJob: async (data: CreateJobRequest): Promise<Job> => {
    const response = await apiClient.post<ApiResponse<Job>>("/jobs", data);
    return response.data.data;
  },

  updateJob: async (id: string, data: UpdateJobRequest): Promise<Job> => {
    const response = await apiClient.patch<ApiResponse<Job>>(
      `/jobs/${id}`,
      data,
    );
    return response.data.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`);
  },

  getMyJobs: async (filters?: JobFilters): Promise<PaginatedResponse<Job>> => {
    const response = await apiClient.get<PaginatedResponse<Job>>(
      "/employer/jobs",
      { params: filters },
    );
    return response.data;
  },

  // Job seeker endpoints
  getSavedJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get<ApiResponse<Job[]>>("/jobs/saved");
    return response.data.data;
  },

  saveJob: async (jobId: string): Promise<void> => {
    await apiClient.post(`/jobs/${jobId}/save`);
  },

  unsaveJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/jobs/${jobId}/save`);
  },
};
```

```typescript
// src/api/applications.ts
import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Application, ApplicationStatus } from "@/types/application";

interface ApplyRequest {
  jobId: string;
  coverLetter?: string;
  resume: string; // URL from file upload
}

interface UpdateApplicationRequest {
  status: ApplicationStatus;
  feedback?: string;
}

export const applicationsApi = {
  // Job seeker endpoints
  apply: async (data: ApplyRequest): Promise<Application> => {
    const response = await apiClient.post<ApiResponse<Application>>(
      "/applications",
      data,
    );
    return response.data.data;
  },

  getMyApplications: async (): Promise<Application[]> => {
    const response =
      await apiClient.get<ApiResponse<Application[]>>("/applications/me");
    return response.data.data;
  },

  withdrawApplication: async (id: string): Promise<void> => {
    await apiClient.post(`/applications/${id}/withdraw`);
  },

  // Employer endpoints
  getApplicationsForJob: async (
    jobId: string,
    status?: ApplicationStatus,
  ): Promise<Application[]> => {
    const response = await apiClient.get<ApiResponse<Application[]>>(
      `/jobs/${jobId}/applications`,
      { params: { status } },
    );
    return response.data.data;
  },

  updateApplicationStatus: async (
    id: string,
    data: UpdateApplicationRequest,
  ): Promise<Application> => {
    const response = await apiClient.patch<ApiResponse<Application>>(
      `/applications/${id}/status`,
      data,
    );
    return response.data.data;
  },

  // Bulk update
  bulkUpdateStatus: async (
    ids: string[],
    status: ApplicationStatus,
  ): Promise<void> => {
    await apiClient.patch("/applications/bulk-status", { ids, status });
  },
};
```

### 6. TanStack Query Setup with Typed Hooks

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

```typescript
// src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth";
import { getAccessToken, clearTokens } from "@/api/client";
import type { User } from "@/types/user";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    enabled: !!getAccessToken(),
    retry: false,
    staleTime: Infinity,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      // Navigate based on role
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "employer":
          navigate("/employer");
          break;
        default:
          navigate("/dashboard");
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      navigate("/dashboard");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
    onError: () => {
      // Even if logout fails, clear local state
      clearTokens();
      queryClient.clear();
      navigate("/login");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    isAdmin: user?.role === "admin",
    isEmployer: user?.role === "employer",
    isJobSeeker: user?.role === "job_seeker",
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
  };
};
```

```typescript
// src/hooks/useJobs.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs";
import type { JobFilters } from "@/types/job";

// Query keys factory for better organization
export const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
  list: (filters: JobFilters) => [...jobKeys.lists(), filters] as const,
  details: () => [...jobKeys.all, "detail"] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  myJobs: () => [...jobKeys.all, "my-jobs"] as const,
  saved: () => [...jobKeys.all, "saved"] as const,
};

// Get paginated jobs
export const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: jobKeys.list(filters || {}),
    queryFn: () => jobsApi.getJobs(filters),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};

// Get single job
export const useJob = (id: string) => {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => jobsApi.getJob(id),
    enabled: !!id,
  });
};

// Get employer's jobs
export const useMyJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: [...jobKeys.myJobs(), filters],
    queryFn: () => jobsApi.getMyJobs(filters),
  });
};

// Get saved jobs
export const useSavedJobs = () => {
  return useQuery({
    queryKey: jobKeys.saved(),
    queryFn: jobsApi.getSavedJobs,
  });
};

// Create job mutation
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.createJob,
    onSuccess: () => {
      // Invalidate employer's jobs list
      queryClient.invalidateQueries({ queryKey: jobKeys.myJobs() });
    },
  });
};

// Update job mutation
export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof jobsApi.updateJob>[1];
    }) => jobsApi.updateJob(id, data),
    onSuccess: (updatedJob) => {
      // Update the specific job in cache
      queryClient.setQueryData(jobKeys.detail(updatedJob.id), updatedJob);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.myJobs() });
    },
  });
};

// Delete job mutation
export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.deleteJob,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: jobKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.myJobs() });
    },
  });
};

// Save/unsave job mutations
export const useSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.saveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.saved() });
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.unsaveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.saved() });
    },
  });
};
```

### 7. Environment Configuration

```bash
# .env.example
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=DevJobs Pro
VITE_APP_VERSION=1.0.0

# .env.development
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=DevJobs Pro (Dev)

# .env.production
VITE_API_URL=https://api.devjobs.io/api
VITE_APP_NAME=DevJobs Pro
```

```typescript
// src/config/env.ts
// Type-safe environment configuration

interface EnvConfig {
  apiUrl: string;
  appName: string;
  appVersion: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

export const env: EnvConfig = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  appName: import.meta.env.VITE_APP_NAME || "DevJobs Pro",
  appVersion: import.meta.env.VITE_APP_VERSION || "0.0.0",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate required env vars at startup
const requiredEnvVars = ["VITE_API_URL"] as const;

requiredEnvVars.forEach((key) => {
  if (!import.meta.env[key]) {
    console.warn(`Warning: Missing environment variable ${key}`);
  }
});
```

---

## 🎓 Mini-Tutorial: Create Type-Safe API Client Module

Let's build the complete API client step by step.

### Step 1: Create the Project Structure

```bash
mkdir -p src/api src/types src/hooks src/config
touch src/api/client.ts src/api/auth.ts src/api/jobs.ts src/api/applications.ts
touch src/types/user.ts src/types/job.ts src/types/application.ts src/types/api.ts
touch src/hooks/useAuth.ts src/hooks/useJobs.ts
touch src/config/env.ts
```

### Step 2: Define Types First (Contract)

```typescript
// src/types/index.ts
// Re-export all types for easy imports
export * from "./user";
export * from "./job";
export * from "./application";
export * from "./api";
```

### Step 3: Create the Base Client

Create `src/api/client.ts` with the axios instance and interceptors (shown in code examples above).

### Step 4: Create Endpoint Modules

Each API domain gets its own file with typed functions.

### Step 5: Create Hooks for Components

```typescript
// src/hooks/index.ts
export * from "./useAuth";
export * from "./useJobs";
export * from "./useApplications";
```

### Step 6: Test the Setup

```typescript
// src/App.tsx
import { useAuth } from '@/hooks/useAuth';

function App() {
  const { user, isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
    );
  }

  return <div>Welcome, {user.name}!</div>;
}

export default App;
```

---

## 🏗️ Practice: DevJobs Pro React Setup

### Task: Set Up the Complete Frontend Foundation

Your mission is to create the React project with a fully typed API client that works with your backend.

#### Requirements

1. **Vite Project with TypeScript**
   - Use the `react-ts` template
   - Configure path aliases
   - Set up Tailwind CSS

2. **API Client for Auth, Jobs, Applications**
   - Axios instance with base URL
   - Request interceptor for auth token
   - Response interceptor for token refresh
   - Typed endpoint functions

3. **Shared Types from Backend**
   - Copy/sync User, Job, Application types
   - API response wrapper types
   - Pagination types

4. **Environment-Based Configuration**
   - Different API URLs for dev/prod
   - Type-safe env config module

5. **TanStack Query Setup**
   - QueryClient with sensible defaults
   - Custom hooks for each API domain

#### Verification

```bash
# Start both backend and frontend
cd backend && npm run dev
cd frontend && npm run dev

# Frontend should:
# 1. Compile without TypeScript errors
# 2. Make API calls with correct types
# 3. Attach auth token automatically
# 4. Handle 401 with token refresh
```

---

## 💡 Pro Tips vs Junior Traps

| Aspect             | ❌ Junior Trap                                     | ✅ Pro Tip                                             |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------ |
| **API Calls**      | Calling axios directly in components               | Create typed hooks that handle loading/error states    |
| **Token Storage**  | Storing token in component state (lost on refresh) | Use localStorage + memory cache with interceptors      |
| **Error Handling** | Generic `catch (e) { console.log(e) }`             | Type-safe error extraction with user-friendly messages |
| **Types**          | Using `any` for API responses                      | Define types that match your backend contracts         |
| **Environment**    | Hardcoding API URLs                                | Use environment variables with type-safe config        |
| **Token Refresh**  | Logging user out on first 401                      | Queue requests during refresh, retry after             |
| **Caching**        | Fetching same data repeatedly                      | Use TanStack Query with appropriate staleTime          |
| **Type Sync**      | Copy types once, never update                      | Establish a process to keep types in sync              |

---

## 🔧 5-Minute Debugger

### Problem 1: CORS Errors from Frontend

```
Access to XMLHttpRequest at 'http://localhost:3000/api'
has been blocked by CORS policy
```

**Quick Diagnosis:**

```typescript
// Check 1: Is backend CORS configured?
// backend/src/app.ts
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
}));

// Check 2: Is Vite proxy configured? (alternative to CORS)
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

// Check 3: API URL correct in .env?
// .env
VITE_API_URL=http://localhost:3000/api
// NOT: VITE_API_URL=http://localhost:3000 (missing /api)
```

---

### Problem 2: Token Not Attached to Requests

```
401 Unauthorized - but I just logged in!
```

**Quick Diagnosis:**

```typescript
// Check 1: Is token being saved after login?
// In browser DevTools > Application > Local Storage
// Should see: accessToken, refreshToken

// Check 2: Is interceptor running?
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  console.log("Token in interceptor:", token); // Debug
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Check 3: Is the apiClient instance being used?
// WRONG: Using axios directly
import axios from "axios";
axios.get("/api/jobs"); // ❌ No interceptors!

// RIGHT: Using configured client
import { apiClient } from "@/api/client";
apiClient.get("/jobs"); // ✅ Has interceptors
```

---

### Problem 3: Environment Variable Undefined

```typescript
console.log(import.meta.env.API_URL); // undefined
```

**Quick Diagnosis:**

```bash
# Check 1: Does variable have VITE_ prefix?
# WRONG:
API_URL=http://localhost:3000

# RIGHT:
VITE_API_URL=http://localhost:3000

# Check 2: Did you restart Vite after adding env var?
# Vite only reads .env files at startup!
npm run dev # Restart required

# Check 3: Is .env in the right location?
# Should be in project root (next to package.json)
devjobs-frontend/
├── .env              # ✅ Here
├── package.json
└── src/
    └── .env          # ❌ Not here!

# Check 4: Is there a typo in access?
import.meta.env.VITE_API_URL  // ✅ Correct
process.env.VITE_API_URL      // ❌ Wrong (that's for Node.js)
```

---

## ✅ Definition of Done Checklist

Before moving to Lesson 2, verify:

- [ ] Vite project created with `react-ts` template
- [ ] TypeScript configured with strict mode and path aliases
- [ ] Tailwind CSS installed and configured
- [ ] Axios client created with base URL from environment
- [ ] Request interceptor attaches auth token
- [ ] Response interceptor handles 401 and refreshes token
- [ ] All API types defined (User, Job, Application, ApiResponse)
- [ ] Auth API endpoints typed and working (login, register, getMe, logout)
- [ ] Jobs API endpoints typed (getJobs, getJob, createJob, etc.)
- [ ] Applications API endpoints typed (apply, getMyApplications, etc.)
- [ ] TanStack Query configured with QueryClient
- [ ] Custom hooks created (useAuth, useJobs)
- [ ] Environment variables working for API URL
- [ ] Frontend can successfully call backend (test with login)
- [ ] CORS working between frontend and backend
- [ ] No TypeScript errors in the project

---

## 🔗 Navigation

| Previous                                              | Next                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| [← Module 14: Deployment](../14-deployment/README.md) | [Lesson 2: Job Seeker Dashboard →](./02-job-seeker-dashboard.md) |

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- [React Router v6](https://reactrouter.com/)
- [TypeScript + React Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

_Your backend is ready. Your types are shared. Your API client is bulletproof. Let's build some dashboards! 🚀_
