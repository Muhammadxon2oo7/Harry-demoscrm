/**
 * Harry Potter Academy — CRM API Client
 * Base URL: https://api.harry-potter.uz/api/v1/
 * Mock API Base URL: https://api.harry-potter.uz/api/v1/mock/
 *
 * All API calls are centralised here.
 * Token management, request helpers, and typed wrappers for every endpoint.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const API_ROOT =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://www.harry-potter.uz/api/v1";

// Section-specific base URLs matching the documented API structure
const ACCOUNTS_URL = `${API_ROOT}/accounts`;
const EDUCATION_URL = `${API_ROOT}/education`;
const EXAMS_URL = `${API_ROOT}/exams`;
const FINANCE_URL = `${API_ROOT}/finance`;

// Legacy alias — kept so existing call-sites that use BASE_URL still compile.
// New code should prefer the section-specific constants above.
const BASE_URL = API_ROOT;

const MOCK_BASE_URL =
  process.env.NEXT_PUBLIC_MOCK_API_BASE_URL ||
  "https://www.harry-potter.uz/api/v1/mock";

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
  teacher: number | null;
  teacher_name: string | null;
  is_active: boolean;
  days: string;
  start_time: string;
  end_time: string;
  students_count: number;
  homework_count: number;
  group_total_score: number;
  created_at: string;
}

export interface GroupRating {
  id: number;
  name: string;
  subject_name: string;
  total_score: number;
  rank: number;
  students_count: number;
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
  students: { total: number };
  workers: { total: number };
  groups: { total: number };
  payments: { total: number; this_month: number };
  cashouts: { total: number; this_month: number };
}

export interface ExamOption {
  id: number;
  text: string;
  is_correct: boolean;
  order?: number;
}

export interface ExamQuestion {
  id: number;
  text: string;
  type: "test" | "written";
  order?: number;
  options?: ExamOption[];
  written_answer_sample?: string | null;
}

export interface ExamRecord {
  id: number;
  subject: number;
  subject_name: string;
  title: string;
  code: string;
  description?: string;
  time_limit: number;
  is_published: boolean;
  is_active: boolean;
  date: string;
  created_by?: number;
  questions_count?: number;
  participants_count?: number;
  questions?: ExamQuestion[];
  created_at: string;
}

export interface ExamSubmitAnswer {
  question_id: number;
  option_id?: number;
  written_answer?: string;
}

export interface ExamAnswer {
  id: number;
  exam_result?: number;
  question: number;
  question_text: string;
  option: number | null;
  option_text: string | null;
  written_answer: string | null;
  earned_score: number;
  is_correct: boolean;
  comment: string | null;
}

export interface ExamResultRecord {
  id: number;
  exam: number;
  exam_title?: string;
  student: number;
  score: number;
  correct_answers: number;
  total_questions: number;
  is_checked: boolean;
  checked_by: number | null;
  answers?: ExamAnswer[];
  created_at: string;
}

export interface MessageLog {
  id: number;
  message: number;
  recipient: number;
  recipient_name: string;
  status: "pending" | "sent" | "failed";
  error: string | null;
  sent_at: string | null;
}

export interface MessageRecord {
  id: number;
  text: string;
  recipients: number[];
  sent_by?: number;
  created_at: string;
  logs: MessageLog[];
}

export interface WorkLog {
  id: number;
  employee: number;
  date: string;
  status: boolean;
  note: string | null;
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
    api.post<LoginResponse>(`${ACCOUNTS_URL}/login/`, { username, password }),
};

// ─── Dashboard ─────────────────────────────────────────────────────

export const dashboardApi = {
  get: () => api.get<DashboardData>(`${ACCOUNTS_URL}/dashboard/`),
};

// ─── Subjects ─────────────────────────────────────────────────────

export const subjectsApi = {
  list: () => api.get<Subject[]>(`${EDUCATION_URL}/subjects/`),
  get: (id: number) => api.get<Subject>(`${EDUCATION_URL}/subjects/${id}/`),
  create: (name: string) => api.post<Subject>(`${EDUCATION_URL}/subjects/`, { name }),
  update: (id: number, name: string) => api.put<Subject>(`${EDUCATION_URL}/subjects/${id}/`, { name }),
  delete: (id: number) => api.delete<void>(`${EDUCATION_URL}/subjects/${id}/`),
};

// ─── Groups ────────────────────────────────────────────────────────────────────

export interface GroupCreateInput {
  name: string;
  description?: string;
  subject: number;
  teacher?: number | null;
  is_active?: boolean;
  days: string;
  start_time: string;
  end_time: string;
}

export const groupsApi = {
  list: () => api.get<Group[]>(`${EDUCATION_URL}/groups/`),
  get: (id: number) => api.get<Group>(`${EDUCATION_URL}/groups/${id}/`),
  create: (data: GroupCreateInput) => api.post<Group>(`${EDUCATION_URL}/groups/`, data),
  update: (id: number, data: Partial<GroupCreateInput>) =>
    api.put<Group>(`${EDUCATION_URL}/groups/${id}/`, data),
  patch: (id: number, data: Partial<GroupCreateInput>) =>
    api.patch<Group>(`${EDUCATION_URL}/groups/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${EDUCATION_URL}/groups/${id}/`),
  rating: () => api.get<GroupRating[]>(`${EDUCATION_URL}/groups/rating/`),
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

export interface StudentRating {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  total_score: number;
  rank: number;
  group_name: string;
}

// Alias for backwards compatibility
export type Student = UserProfile;

export const ownersApi = {
  list: () => api.get<UserProfile[]>(`${ACCOUNTS_URL}/owners/`),
  get: (id: number) => api.get<UserProfile>(`${ACCOUNTS_URL}/owners/${id}/`),
  create: (data: UserCreateInput) => api.post<UserProfile>(`${ACCOUNTS_URL}/owners/`, data),
  update: (id: number, data: Partial<UserCreateInput>) =>
    api.put<UserProfile>(`${ACCOUNTS_URL}/owners/${id}/`, data),
  patch: (id: number, data: Partial<UserCreateInput>) =>
    api.patch<UserProfile>(`${ACCOUNTS_URL}/owners/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${ACCOUNTS_URL}/owners/${id}/`),
};

// ─── Workers ───────────────────────────────────────────────────────────────────

export const workersApi = {
  list: () => api.get<UserProfile[]>(`${ACCOUNTS_URL}/workers/`),
  get: (id: number) => api.get<UserProfile>(`${ACCOUNTS_URL}/workers/${id}/`),
  create: (data: UserCreateInput) => api.post<UserProfile>(`${ACCOUNTS_URL}/workers/`, data),
  update: (id: number, data: Partial<UserCreateInput>) =>
    api.put<UserProfile>(`${ACCOUNTS_URL}/workers/${id}/`, data),
  patch: (id: number, data: Partial<UserCreateInput>) =>
    api.patch<UserProfile>(`${ACCOUNTS_URL}/workers/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${ACCOUNTS_URL}/workers/${id}/`),
};

// ─── Students ──────────────────────────────────────────────────────────────────

export const studentsApi = {
  list: (groupId?: number) =>
    api.get<UserProfile[]>(
      `${ACCOUNTS_URL}/students/${groupId != null ? `?group_id=${groupId}` : ""}`
    ),
  get: (id: number) => api.get<UserProfile>(`${ACCOUNTS_URL}/students/${id}/`),
  create: (data: UserCreateInput) => api.post<UserProfile>(`${ACCOUNTS_URL}/students/`, data),
  update: (id: number, data: Partial<UserCreateInput>) =>
    api.put<UserProfile>(`${ACCOUNTS_URL}/students/${id}/`, data),
  patch: (id: number, data: Partial<UserCreateInput>) =>
    api.patch<UserProfile>(`${ACCOUNTS_URL}/students/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${ACCOUNTS_URL}/students/${id}/`),
  /** group_id is required by the API */
  rating: (groupId: number) =>
    api.get<StudentRating[]>(
      `${ACCOUNTS_URL}/students/rating/?group_id=${groupId}`
    ),
};

// ─── Attendance ────────────────────────────────────────────────────────────────

export const attendanceApi = {
  list: () => api.get<AttendanceRecord[]>(`${EDUCATION_URL}/attendance/`),
  create: (student: number, group: number, status: string) =>
    api.post<AttendanceRecord>(`${EDUCATION_URL}/attendance/`, { student, group, status }),
  bulkCreate: (group_id: number) =>
    api.post<AttendanceRecord[]>(`${EDUCATION_URL}/attendance/bulk_create/`, { group_id }),
  updateStatus: (id: number, status: string) =>
    api.patch<AttendanceRecord>(`${EDUCATION_URL}/attendance/${id}/`, { status }),
  delete: (id: number) => api.delete<void>(`${EDUCATION_URL}/attendance/${id}/`),
};

// ─── Scores ────────────────────────────────────────────────────────────────────

export const scoresApi = {
  list: () => api.get<ScoreRecord[]>(`${EDUCATION_URL}/scores/`),
  get: (id: number) => api.get<ScoreRecord>(`${EDUCATION_URL}/scores/${id}/`),
  create: (student: number, group: number, score: number) =>
    api.post<ScoreRecord>(`${EDUCATION_URL}/scores/`, { student, group, score }),
  update: (id: number, score: number) =>
    api.patch<ScoreRecord>(`${EDUCATION_URL}/scores/${id}/`, { score }),
  delete: (id: number) => api.delete<void>(`${EDUCATION_URL}/scores/${id}/`),
};

// ─── Homework ──────────────────────────────────────────────────────────────────

export const homeworkApi = {
  list: () => api.get<HomeworkRecord[]>(`${EDUCATION_URL}/homework/`),
  get: (id: number) => api.get<HomeworkRecord>(`${EDUCATION_URL}/homework/${id}/`),
  myHomework: () => api.get<HomeworkRecord[]>(`${EDUCATION_URL}/homework/my-homework/`),
  create: (formData: FormData) =>
    api.postForm<HomeworkRecord>(`${EDUCATION_URL}/homework/`, formData),
  update: (id: number, formData: FormData) =>
    request<HomeworkRecord>(`${EDUCATION_URL}/homework/${id}/`, {
      method: "PATCH",
      body: formData,
      isFormData: true,
    }),
  delete: (id: number) => api.delete<void>(`${EDUCATION_URL}/homework/${id}/`),
};

// ─── Payments ──────────────────────────────────────────────────────────────────

export interface PaymentCreateInput {
  student: number;
  group: number;
  amount: number;
  months: { year: number; month: number }[];
}

export const paymentsApi = {
  list: () => api.get<PaymentRecord[]>(`${FINANCE_URL}/payments/`),
  get: (id: number) => api.get<PaymentRecord>(`${FINANCE_URL}/payments/${id}/`),
  myPayments: () => api.get<PaymentRecord[]>(`${FINANCE_URL}/payments/my-payments/`),
  create: (data: PaymentCreateInput) => api.post<PaymentRecord>(`${FINANCE_URL}/payments/`, data),
  update: (id: number, data: Partial<PaymentCreateInput>) =>
    api.patch<PaymentRecord>(`${FINANCE_URL}/payments/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${FINANCE_URL}/payments/${id}/`),
};

// ─── Expenses ──────────────────────────────────────────────────────────────────

export interface ExpenseCreateInput {
  recipient?: string | null;
  recipient_user?: number | null;
  amount: number;
  reason: string;
}

export const expensesApi = {
  list: () => api.get<ExpenseRecord[]>(`${FINANCE_URL}/expenses/`),
  get: (id: number) => api.get<ExpenseRecord>(`${FINANCE_URL}/expenses/${id}/`),
  create: (data: ExpenseCreateInput) =>
    api.post<ExpenseRecord>(`${FINANCE_URL}/expenses/`, data),
  update: (id: number, data: Partial<ExpenseCreateInput>) =>
    api.patch<ExpenseRecord>(`${FINANCE_URL}/expenses/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${FINANCE_URL}/expenses/${id}/`),
};

// ─── Exams ─────────────────────────────────────────────────────────────────────

export interface ExamQuestionInput {
  text: string;
  type: "test" | "written";
  order?: number;
  options?: { text: string; is_correct: boolean; order?: number }[];
  written_answer_sample?: string;
}

export interface ExamCreateInput {
  subject: number;
  title: string;
  description?: string;
  time_limit?: number;
  is_published?: boolean;
  is_active?: boolean;
  date?: string;
  questions?: ExamQuestionInput[];
}

export interface MessageCreateInput {
  text: string;
  recipient_ids: number[];
}

export const examsApi = {
  list: () => api.get<ExamRecord[]>(`${EXAMS_URL}/exams/`),
  get: (id: number) => api.get<ExamRecord>(`${EXAMS_URL}/exams/${id}/`),
  create: (data: ExamCreateInput) =>
    api.post<ExamRecord>(`${EXAMS_URL}/exams/`, data),
  update: (id: number, data: Partial<ExamCreateInput>) =>
    api.patch<ExamRecord>(`${EXAMS_URL}/exams/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${EXAMS_URL}/exams/${id}/`),
  enterCode: (code: string) =>
    api.post<ExamRecord>(`${EXAMS_URL}/exams/enter-code/`, { code }),
  publish: (id: number) =>
    api.post<{ status: string }>(`${EXAMS_URL}/exams/${id}/publish/`),
  unpublish: (id: number) =>
    api.post<{ status: string }>(`${EXAMS_URL}/exams/${id}/unpublish/`),
  copy: (id: number) =>
    api.post<ExamRecord>(`${EXAMS_URL}/exams/${id}/copy/`),
  submit: (id: number, answers: ExamSubmitAnswer[]) =>
    api.post<ExamResultRecord>(`${EXAMS_URL}/exams/${id}/submit/`, { answers }),
};

// ─── Exam Results ──────────────────────────────────────────────────────────────

export interface ExamGradeInput {
  answer_id: number;
  earned_score: number;
  comment?: string;
}

export const examResultsApi = {
  list: () => api.get<ExamResultRecord[]>(`${EXAMS_URL}/exam-results/`),
  get: (id: number) => api.get<ExamResultRecord>(`${EXAMS_URL}/exam-results/${id}/`),
  myResults: () => api.get<ExamResultRecord[]>(`${EXAMS_URL}/exam-results/my-results/`),
  create: (data: Partial<ExamResultRecord>) =>
    api.post<ExamResultRecord>(`${EXAMS_URL}/exam-results/`, data),
  update: (id: number, data: Partial<ExamResultRecord>) =>
    api.patch<ExamResultRecord>(`${EXAMS_URL}/exam-results/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${EXAMS_URL}/exam-results/${id}/`),
  /** Grade written answers for an exam result. Only owner/employee. */
  grade: (id: number, grades: ExamGradeInput[]) =>
    api.post<ExamResultRecord>(`${EXAMS_URL}/exam-results/${id}/grade/`, { grades }),
};

// ─── Teacher Logs ─────────────────────────────────────────────────────────────

export type TeacherLogStatus = "dars_otdi" | "dars_otmadi" | "orin_bosdi";

export interface TeacherLog {
  id: number;
  teacher: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  group: number;
  group_name: string;
  group_subject: string;
  date: string;
  status: TeacherLogStatus;
  status_display: string;
  replaced_for: number | null;
  replaced_for_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherLogStat {
  total_lessons: number;
  dars_otdi: number;
  dars_otmadi: number;
  orin_bosdi: number;
  efficiency: number;
}

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const teacherLogsApi = {
  list: (params?: {
    teacher_id?: number;
    group_id?: number;
    date_from?: string;
    date_to?: string;
    status?: TeacherLogStatus;
  }) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${v}`)
          .join("&")
      : "";
    return api.get<TeacherLog[]>(`${EDUCATION_URL}/teacher-logs/${qs}`);
  },
  get: (id: number) => api.get<TeacherLog>(`${EDUCATION_URL}/teacher-logs/${id}/`),
  myLogs: (params?: {
    date_from?: string;
    date_to?: string;
    status?: TeacherLogStatus;
  }) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${v}`)
          .join("&")
      : "";
    return api.get<PaginatedResult<TeacherLog>>(`${EDUCATION_URL}/teacher-logs/my-logs/${qs}`);
  },
  groupLogs: (group_id: number) =>
    api.get<PaginatedResult<TeacherLog>>(`${EDUCATION_URL}/teacher-logs/group-logs/?group_id=${group_id}`),
  stat: (params?: { teacher_id?: number; date_from?: string; date_to?: string }) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${v}`)
          .join("&")
      : "";
    return api.get<TeacherLogStat>(`${EDUCATION_URL}/teacher-logs/stat/${qs}`);
  },
};

// ─── Work Logs (legacy — not in documented API, kept for type-compatibility) ─────────
// NOTE: The documented backend does not expose a /work-logs/ endpoint.
// Use teacherLogsApi for teacher activity tracking.
/** @deprecated Use teacherLogsApi instead */
export const workLogsApi = {
  list: (_params?: { employee?: number; date?: string }) =>
    Promise.resolve([] as WorkLog[]),
  get: (_id: number) => Promise.resolve(null as unknown as WorkLog),
};

// ─── Messages ──────────────────────────────────────────────────────────────────

export const messagesApi = {
  list: () => api.get<MessageRecord[]>(`${ACCOUNTS_URL}/messages/`),
  get: (id: number) => api.get<MessageRecord>(`${ACCOUNTS_URL}/messages/${id}/`),
  messageLogs: (messageId: number) =>
    api.get<MessageLog[]>(`${ACCOUNTS_URL}/message/logs/${messageId}/`),
  send: (data: MessageCreateInput) =>
    api.post<MessageRecord>(`${ACCOUNTS_URL}/messages/`, data),
  update: (id: number, data: { text: string }) =>
    api.put<MessageRecord>(`${ACCOUNTS_URL}/messages/${id}/`, data),
  patch: (id: number, data: Partial<{ text: string }>) =>
    api.patch<MessageRecord>(`${ACCOUNTS_URL}/messages/${id}/`, data),
  delete: (id: number) => api.delete<void>(`${ACCOUNTS_URL}/messages/${id}/`),
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

/** Send message to students via Telegram using the messages API */
export async function sendMessageToStudents(
  studentIds: number[],
  message: string
): Promise<void> {
  await messagesApi.send({ text: message, recipient_ids: studentIds });
}
