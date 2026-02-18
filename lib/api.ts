/**
 * Harry Potter Academy — CRM API Client
 * Base URL: https://api.harry-potter.uz/api/v1/
 * Mock API Base URL: https://api.harry-potter.uz/api/v1/mock/
 *
 * All API calls are centralised here.
 * Token management, request helpers, and typed wrappers for every endpoint.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.harry-potter.uz/api/v1";

const MOCK_BASE_URL =
  process.env.NEXT_PUBLIC_MOCK_API_BASE_URL ||
  "https://api.harry-potter.uz/api/v1/mock";

// ─── Token Helpers ─────────────────────────────────────────────────────────────

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hp_access_token");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hp_refresh_token");
};

export const setTokens = (access: string, refresh: string): void => {
  localStorage.setItem("hp_access_token", access);
  localStorage.setItem("hp_refresh_token", refresh);
};

export const clearTokens = (): void => {
  localStorage.removeItem("hp_access_token");
  localStorage.removeItem("hp_refresh_token");
  localStorage.removeItem("hp_user");
};

// ─── Request Helper ────────────────────────────────────────────────────────────

type RequestOptions = Omit<RequestInit, "body"> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any> | FormData | null;
  isFormData?: boolean;
};

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { body, isFormData = false, ...rest } = options;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(rest.headers as Record<string, string>),
  };

  const init: RequestInit = {
    ...rest,
    headers,
    body: isFormData
      ? (body as FormData)
      : body != null
      ? JSON.stringify(body)
      : undefined,
  };

  const res = await fetch(url, init);

  if (res.status === 401) {
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sessiya muddati tugadi. Qayta kiring.");
  }

  if (!res.ok) {
    let errorData: unknown;
    try {
      errorData = await res.json();
    } catch {
      errorData = { detail: res.statusText };
    }
    throw errorData;
  }

  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = {
  get: <T>(url: string, opts?: RequestOptions) =>
    request<T>(url, { method: "GET", ...opts }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: <T>(url: string, body?: Record<string, any>, opts?: RequestOptions) =>
    request<T>(url, { method: "POST", body, ...opts }),
  postForm: <T>(url: string, body: FormData, opts?: RequestOptions) =>
    request<T>(url, { method: "POST", body, isFormData: true, ...opts }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: <T>(url: string, body?: Record<string, any>, opts?: RequestOptions) =>
    request<T>(url, { method: "PUT", body, ...opts }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: <T>(url: string, body?: Record<string, any>, opts?: RequestOptions) =>
    request<T>(url, { method: "PATCH", body, ...opts }),
  delete: <T>(url: string, opts?: RequestOptions) =>
    request<T>(url, { method: "DELETE", ...opts }),
};

// ─── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "owner" | "employee" | "student";

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  full_name: string;
}

export interface LoginResponse {
  tokens: { access: string; refresh: string };
  user: AuthUser;
}

export interface Subject {
  id: number;
  name: string;
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  subject: number;
  subject_name: string;
  is_active: boolean;
  days: string;
  start_time: string;
  end_time: string;
  students_count: number;
  homework_count: number;
  group_total_score: number;
  created_at: string;
}

export interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  parent_phone?: string;
  telegram_id?: string | null;
  role: UserRole;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  last_login?: string;
  date_joined?: string;
  created_at: string;
  group?: { id: number; name: string } | null;
  all_score?: number;
}

export interface AttendanceRecord {
  id: number;
  student: { id: number; first_name: string; last_name: string; username: string };
  group: { id: number; name: string };
  status: "keldi" | "kechikdi" | "kelmadi";
  date: string;
  time: string;
  marked_by: number;
  created_at: string;
  updated_at: string;
}

export interface ScoreRecord {
  id: number;
  student: { id: number; first_name: string; last_name: string; username: string };
  group: { id: number; name: string };
  score: number;
  date: string;
  given_by: { id: number; first_name: string; last_name: string };
  created_at: string;
  updated_at: string;
}

export interface HomeworkRecord {
  id: number;
  group: number;
  created_by: number;
  text: string;
  file: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMonth {
  id: number;
  year: number;
  month: number;
  month_name: string;
}

export interface PaymentRecord {
  id: number;
  student: number | { id: number; first_name: string; last_name: string; username: string };
  student_name?: string;
  group: number | { id: number; name: string };
  group_name?: string;
  months_paid: number;
  amount: string;
  received_by: { id: number; first_name: string; last_name: string; username: string };
  months: PaymentMonth[];
  created_at: string;
}

export interface ExpenseRecord {
  id: number;
  recipient: string | null;
  recipient_user: number | null;
  amount: string;
  reason: string;
  created_at: string;
}

export interface DashboardData {
  finance: { income: number; expense: number; profit: number };
  attendance: { employees_present_today: number; total_employees: number };
}

export interface ExamRecord {
  id: number;
  subject: number;
  name: string;
  code: string;
  date: string;
  created_by: number;
  created_at: string;
}

export interface ExamResultRecord {
  id: number;
  exam: number;
  student: number;
  score: number;
  correct_answers: number;
  total_questions: number;
  is_checked: boolean;
  checked_by: number;
  created_at: string;
}

export interface WorkLog {
  id: number;
  employee: number;
  date: string;
  status: boolean;
  note: string;
  created_at: string;
}

export interface MockTestSection {
  id: number;
  file?: string;
  audio_file?: string;
  question_file?: string;
  duration: number;
  question_count: number;
  created_at: string;
}

export interface MockTest {
  id: string;
  title: string;
  code: string;
  created_by: number;
  reading: MockTestSection;
  writing: MockTestSection;
  listening: MockTestSection;
  created_at: string;
  updated_at: string;
}

export interface MockScore {
  id: number;
  session: string;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  score: number;
  created_by: number | { id: number; first_name: string; last_name: string };
  created_at: string;
}

export interface TestSession {
  id: string;
  user: { id: number; first_name: string; last_name: string; group: { id: number; name: string } };
  test: string | MockTest | null;
  started_at: string;
  ended_at: string | null;
  is_completed: boolean;
  is_finished: boolean;
  score?: MockScore;
  listening?: MockTestSection;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>(`${BASE_URL}/login/`, { username, password }),
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboardApi = {
  get: () => api.get<DashboardData>(`${BASE_URL}/dashboard/`),
};

// ─── Subjects ─────────────────────────────────────────────────────────────────

export const subjectsApi = {
  list: () => api.get<Subject[]>(`${BASE_URL}/subjects/`),
  get: (id: number) => api.get<Subject>(`${BASE_URL}/subjects/${id}/`),
  create: (name: string) => api.post<Subject>(`${BASE_URL}/subjects/`, { name }),
  update: (id: number, name: string) => api.put<Subject>(`${BASE_URL}/subjects/${id}/`, { name }),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/subjects/${id}/`),
};

// ─── Groups ────────────────────────────────────────────────────────────────────

export interface GroupCreateInput {
  name: string;
  description?: string;
  subject: number;
  is_active?: boolean;
  days: string;
  start_time: string;
  end_time: string;
}

export const groupsApi = {
  list: () => api.get<Group[]>(`${BASE_URL}/groups/`),
  get: (id: number) => api.get<Group>(`${BASE_URL}/groups/${id}/`),
  create: (data: GroupCreateInput) => api.post<Group>(`${BASE_URL}/groups/`, data),
  update: (id: number, data: Partial<GroupCreateInput>) =>
    api.put<Group>(`${BASE_URL}/groups/${id}/`, data),
  patch: (id: number, data: Partial<GroupCreateInput>) =>
    api.patch<Group>(`${BASE_URL}/groups/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/groups/${id}/`),
};

// ─── Owners ────────────────────────────────────────────────────────────────────

export interface UserCreateInput {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  parent_phone?: string;
  group?: number;
  telegram_id?: string | null;
  role?: string;
}

// Alias for backwards compatibility
export type Student = UserProfile;

export const ownersApi = {
  list: () => api.get<UserProfile[]>(`${BASE_URL}/owners/`),
  get: (id: number) => api.get<UserProfile>(`${BASE_URL}/owners/${id}/`),
  create: (data: UserCreateInput) => api.post<UserProfile>(`${BASE_URL}/owners/`, data),
  update: (id: number, data: Partial<UserCreateInput>) =>
    api.put<UserProfile>(`${BASE_URL}/owners/${id}/`, data),
  patch: (id: number, data: Partial<UserCreateInput>) =>
    api.patch<UserProfile>(`${BASE_URL}/owners/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/owners/${id}/`),
};

// ─── Workers ───────────────────────────────────────────────────────────────────

export const workersApi = {
  list: () => api.get<UserProfile[]>(`${BASE_URL}/workers/`),
  get: (id: number) => api.get<UserProfile>(`${BASE_URL}/workers/${id}/`),
  create: (data: UserCreateInput) => api.post<UserProfile>(`${BASE_URL}/workers/`, data),
  update: (id: number, data: Partial<UserCreateInput>) =>
    api.put<UserProfile>(`${BASE_URL}/workers/${id}/`, data),
  patch: (id: number, data: Partial<UserCreateInput>) =>
    api.patch<UserProfile>(`${BASE_URL}/workers/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/workers/${id}/`),
};

// ─── Students ──────────────────────────────────────────────────────────────────

export const studentsApi = {
  list: (groupId?: number) =>
    api.get<UserProfile[]>(
      `${BASE_URL}/students/${groupId != null ? `?group_id=${groupId}` : ""}`
    ),
  get: (id: number) => api.get<UserProfile>(`${BASE_URL}/students/${id}/`),
  create: (data: UserCreateInput) => api.post<UserProfile>(`${BASE_URL}/students/`, data),
  update: (id: number, data: Partial<UserCreateInput>) =>
    api.put<UserProfile>(`${BASE_URL}/students/${id}/`, data),
  patch: (id: number, data: Partial<UserCreateInput>) =>
    api.patch<UserProfile>(`${BASE_URL}/students/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/students/${id}/`),
};

// ─── Attendance ────────────────────────────────────────────────────────────────

export const attendanceApi = {
  list: () => api.get<AttendanceRecord[]>(`${BASE_URL}/attendance/`),
  create: (student: number, group: number, status: string) =>
    api.post<AttendanceRecord>(`${BASE_URL}/attendance/`, { student, group, status }),
  bulkCreate: (group_id: number) =>
    api.post<AttendanceRecord[]>(`${BASE_URL}/attendance/bulk_create/`, { group_id }),
  updateStatus: (id: number, status: string) =>
    api.patch<AttendanceRecord>(`${BASE_URL}/attendance/${id}/`, { status }),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/attendance/${id}/`),
};

// ─── Scores ────────────────────────────────────────────────────────────────────

export const scoresApi = {
  list: () => api.get<ScoreRecord[]>(`${BASE_URL}/scores/`),
  get: (id: number) => api.get<ScoreRecord>(`${BASE_URL}/scores/${id}/`),
  create: (student: number, group: number, score: number) =>
    api.post<ScoreRecord>(`${BASE_URL}/scores/`, { student, group, score }),
  update: (id: number, score: number) =>
    api.patch<ScoreRecord>(`${BASE_URL}/scores/${id}/`, { score }),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/scores/${id}/`),
};

// ─── Homework ──────────────────────────────────────────────────────────────────

export const homeworkApi = {
  list: () => api.get<HomeworkRecord[]>(`${BASE_URL}/homework/`),
  get: (id: number) => api.get<HomeworkRecord>(`${BASE_URL}/homework/${id}/`),
  myHomework: () => api.get<HomeworkRecord[]>(`${BASE_URL}/homework/my-homework/`),
  create: (formData: FormData) =>
    api.postForm<HomeworkRecord>(`${BASE_URL}/homework/`, formData),
  update: (id: number, formData: FormData) =>
    request<HomeworkRecord>(`${BASE_URL}/homework/${id}/`, {
      method: "PATCH",
      body: formData,
      isFormData: true,
    }),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/homework/${id}/`),
};

// ─── Payments ──────────────────────────────────────────────────────────────────

export interface PaymentCreateInput {
  student: number;
  group: number;
  amount: number;
  months: { year: number; month: number }[];
}

export const paymentsApi = {
  list: () => api.get<PaymentRecord[]>(`${BASE_URL}/payments/`),
  get: (id: number) => api.get<PaymentRecord>(`${BASE_URL}/payments/${id}/`),
  myPayments: () => api.get<PaymentRecord[]>(`${BASE_URL}/payments/my-payments/`),
  create: (data: PaymentCreateInput) => api.post<PaymentRecord>(`${BASE_URL}/payments/`, data),
  update: (id: number, data: Partial<PaymentCreateInput>) =>
    api.patch<PaymentRecord>(`${BASE_URL}/payments/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/payments/${id}/`),
};

// ─── Expenses ──────────────────────────────────────────────────────────────────

export interface ExpenseCreateInput {
  recipient?: string | null;
  recipient_user?: number | null;
  amount: number;
  reason: string;
}

export const expensesApi = {
  list: () => api.get<ExpenseRecord[]>(`${BASE_URL}/expenses/`),
  get: (id: number) => api.get<ExpenseRecord>(`${BASE_URL}/expenses/${id}/`),
  create: (data: ExpenseCreateInput) =>
    api.post<ExpenseRecord>(`${BASE_URL}/expenses/`, data),
  update: (id: number, data: Partial<ExpenseCreateInput>) =>
    api.patch<ExpenseRecord>(`${BASE_URL}/expenses/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/expenses/${id}/`),
};

// ─── Exams ─────────────────────────────────────────────────────────────────────

export interface ExamCreateInput {
  subject: number;
  name: string;
  code: string;
  date: string;
}

export const examsApi = {
  list: () => api.get<ExamRecord[]>(`${BASE_URL}/exams/`),
  get: (id: number) => api.get<ExamRecord>(`${BASE_URL}/exams/${id}/`),
  create: (data: ExamCreateInput) =>
    api.post<ExamRecord>(`${BASE_URL}/exams/`, data),
  update: (id: number, data: Partial<ExamCreateInput>) =>
    api.patch<ExamRecord>(`${BASE_URL}/exams/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/exams/${id}/`),
  enterCode: (code: string) =>
    api.post<ExamRecord>(`${BASE_URL}/exams/enter-code/`, { code }),
};

// ─── Exam Results ──────────────────────────────────────────────────────────────

export const examResultsApi = {
  list: () => api.get<ExamResultRecord[]>(`${BASE_URL}/exam-results/`),
  get: (id: number) => api.get<ExamResultRecord>(`${BASE_URL}/exam-results/${id}/`),
  myResults: () => api.get<ExamResultRecord[]>(`${BASE_URL}/exam-results/my-results/`),
  create: (data: Partial<ExamResultRecord>) =>
    api.post<ExamResultRecord>(`${BASE_URL}/exam-results/`, data),
  update: (id: number, data: Partial<ExamResultRecord>) =>
    api.patch<ExamResultRecord>(`${BASE_URL}/exam-results/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${BASE_URL}/exam-results/${id}/`),
};

// ─── Work Logs ─────────────────────────────────────────────────────────────────

export const workLogsApi = {
  list: (params?: { employee?: number; date?: string }) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${v}`)
          .join("&")
      : "";
    return api.get<WorkLog[]>(`${BASE_URL}/work-logs/${qs}`);
  },
};

// ─── Mock Tests ────────────────────────────────────────────────────────────────

export const mockTestsApi = {
  list: () => api.get<MockTest[]>(`${MOCK_BASE_URL}/tests/`),
  get: (uuid: string) => api.get<MockTest>(`${MOCK_BASE_URL}/tests/${uuid}/`),
  create: (formData: FormData) =>
    api.postForm<MockTest>(`${MOCK_BASE_URL}/tests/create/`, formData),
  delete: (uuid: string) =>
    api.delete<void>(`${MOCK_BASE_URL}/tests/${uuid}/`),
};

// ─── Mock Sessions ─────────────────────────────────────────────────────────────

export const mockSessionsApi = {
  start: (test: string, code: string) =>
    api.post<TestSession>(`${MOCK_BASE_URL}/session/start/`, { test, code }),
  me: () => api.get<TestSession[]>(`${MOCK_BASE_URL}/session/me/`),
  reading: (sessionId: string) =>
    api.get<MockTestSection>(`${MOCK_BASE_URL}/session/reading/${sessionId}/`),
  writing: (sessionId: string) =>
    api.get<MockTestSection>(`${MOCK_BASE_URL}/session/writing/${sessionId}/`),
  finish: (uuid: string) =>
    api.post<TestSession>(`${MOCK_BASE_URL}/session/${uuid}/finish/`),
  answers: (sessionId: string) =>
    api.get<unknown>(`${MOCK_BASE_URL}/session/${sessionId}/answers/`),
  allAnswers: () =>
    api.get<unknown[]>(`${MOCK_BASE_URL}/session/answers/`),
};

// ─── Mock Answers ──────────────────────────────────────────────────────────────

export const mockAnswersApi = {
  submitReading: (session: string, answers: Record<string, string>) =>
    api.post<unknown>(`${MOCK_BASE_URL}/answers/reading/`, { session, answers }),
  submitWriting: (session: string, task_number: 1 | 2, text: string) =>
    api.post<unknown>(`${MOCK_BASE_URL}/answers/writing/`, { session, task_number, text }),
  submitListening: (session: string, answers: Record<string, string>) =>
    api.post<unknown>(`${MOCK_BASE_URL}/answers/listening/`, { session, answers }),
};

// ─── Mock Scores ───────────────────────────────────────────────────────────────

export const mockScoresApi = {
  create: (data: {
    session: string;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  }) => api.post<MockScore>(`${MOCK_BASE_URL}/score/create/`, data),
  update: (
    id: number,
    data: Partial<{ listening: number; reading: number; writing: number; speaking: number }>
  ) => api.patch<MockScore>(`${MOCK_BASE_URL}/score/${id}/update/`, data),
  me: () => api.get<MockScore[]>(`${MOCK_BASE_URL}/score/me/`),
};

// ─── Utility helpers used by legacy components ───────────────────────────────

/** Transfer a student to another group by patching the student's group field */
export async function transferStudent(
  studentId: number,
  _fromGroupId: number,
  toGroupId: number
): Promise<UserProfile> {
  return studentsApi.patch(studentId, { group: toGroupId });
}

/** Returns groups list (alias for groupsApi.list) */
export async function getStaffGroups(): Promise<Group[]> {
  return groupsApi.list();
}

/** Stub: send message to students via Telegram – no backend endpoint yet */
export async function sendMessageToStudents(
  _studentIds: number[],
  _message: string
): Promise<void> {
  // No messaging endpoint available in current API
  return Promise.resolve();
}
