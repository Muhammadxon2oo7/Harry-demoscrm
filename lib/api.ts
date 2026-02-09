// Mock API functions for Harry Potter Academy
// Replace with real API calls later

export interface Homework {
  id: number;
  title: string;
  text: string;
  document: string;
  deadline: string;
  created_at: string;
}

export interface Attendance {
  id: number;
  student_id: number;
  student: Student;
  date: string;
  status: "keldi" | "kelmadi" | "kechikdi";
}

export interface Score {
  id: number;
  student_id: number;
  student: Student;
  date: string;
  score: number;
  max_score: number;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  parent_phone: string;
  telegram_id?: string;
  status: "Faol" | "Nofaol";
}

export interface Payment {
  id: number;
  student_id: number;
  amount: number;
  date: string;
  note: string;
}

// Group related API
export const getGroupById = async (id: number) => {
  // Mock implementation
  return {
    id,
    name: "Beginner A1",
    subject: "Ingliz tili",
    teacher: "Aliyev Jasur",
    days: ["Dushanba", "Chorshanba", "Juma"],
    time: "14:00 - 16:00",
    students_count: 12,
    students: [
      {
        id: 1,
        first_name: "Ali",
        last_name: "Valiyev",
        username: "alivaliyev",
        phone: "+998901234567",
        parent_phone: "+998901234568",
        telegram_id: "@alivaliyev",
        status: "Faol",
      },
    ],
    homeworks: [
      {
        id: 1,
        title: "Present Simple",
        text: "Kitobdagi 25-betni bajaring",
        document: "",
        deadline: "2024-12-25",
        created_at: new Date().toISOString(),
      },
    ],
  };
};

// Student related API
export const addStudent = async (data: Partial<Student>) => {
  // Mock implementation
  return {
    id: Math.floor(Math.random() * 1000),
    ...data,
    status: "Faol" as const,
  };
};

export const updateStudent = async (id: number, changes: Partial<Student>) => {
  // Mock implementation
  return { id, ...changes };
};

export const deleteStudent = async (id: number) => {
  // Mock implementation
  return { success: true };
};

export const getStudentPayments = async (studentId: number) => {
  // Mock implementation
  return [
    {
      id: 1,
      student_id: studentId,
      amount: 500000,
      date: new Date().toISOString(),
      note: "Yanvar oyi uchun to'lov",
      created_at: new Date().toISOString(),
    },
  ];
};

// Homework related API
export const createHomework = async (groupId: number, data: any) => {
  // Mock implementation
  return {
    id: Math.floor(Math.random() * 1000),
    group_id: groupId,
    ...data,
    created_at: new Date().toISOString(),
  };
};

export const deleteHomework = async (id: number) => {
  // Mock implementation
  return { success: true };
};

export const downloadHomework = async (url: string) => {
  // Mock implementation
  window.open(url, "_blank");
};

// Attendance related API
export const getAttendanceByDate = async (groupId: number, date: string): Promise<Attendance[]> => {
  // Mock implementation
  return [];
};

export const startAttendance = async (groupId: number, date: string): Promise<Attendance[]> => {
  // Mock implementation - returns empty array, will be populated in UI
  return [];
};

export const updateAttendanceStatus = async (
  attendanceId: number,
  status: string
): Promise<Attendance> => {
  // Mock implementation
  return {
    id: attendanceId,
    student_id: 1,
    student: {
      id: 1,
      first_name: "Ali",
      last_name: "Valiyev",
      username: "alivaliyev",
      phone: "+998901234567",
      parent_phone: "+998901234568",
      status: "Faol",
    },
    date: new Date().toISOString(),
    status: status as any,
  };
};

// Score related API
export const getScoresByDate = async (groupId: number, date: string): Promise<Score[]> => {
  // Mock implementation
  return [];
};

export const startScoreSession = async (groupId: number, date: string): Promise<Score[]> => {
  // Mock implementation
  return [];
};

export const updateScore = async (
  scoreId: number,
  score: number,
  maxScore: number
): Promise<Score> => {
  // Mock implementation
  return {
    id: scoreId,
    student_id: 1,
    student: {
      id: 1,
      first_name: "Ali",
      last_name: "Valiyev",
      username: "alivaliyev",
      phone: "+998901234567",
      parent_phone: "+998901234568",
      status: "Faol",
    },
    date: new Date().toISOString(),
    score,
    max_score: maxScore,
  };
};

// Message related API
export const sendMessageToStudents = async (studentIds: number[], message: string) => {
  // Mock implementation
  console.log("Sending message to", studentIds, ":", message);
  return { success: true };
};

// Groups API
export const getStaffGroups = async () => {
  // Mock implementation
  return [
    {
      id: 1,
      name: "Beginner A1",
      subject: "Ingliz tili",
      teacher: "Aliyev Jasur",
    },
    {
      id: 2,
      name: "Advanced C1",
      subject: "Ingliz tili",
      teacher: "Karimov Bekzod",
    },
  ];
};

export const transferStudent = async (studentId: number, fromGroupId: number, toGroupId: number) => {
  // Mock implementation
  console.log(`Transferring student ${studentId} from group ${fromGroupId} to group ${toGroupId}`);
  return { success: true };
};
