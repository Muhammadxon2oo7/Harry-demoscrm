import { type NextRequest, NextResponse } from "next/server";

// Mock users for demonstration
const mockUsers = [
  {
    id: "1",
    email: "admin@hp.com",
    password: "admin123",
    fullName: "Admin User",
    userType: "admin" as const,
    phone: "+998901234569",
  },
  {
    id: "2",
    email: "staff@hp.com",
    password: "staff123",
    fullName: "O'qituvchi Alijon",
    userType: "staff" as const,
    phone: "+998901234568",
    subjectId: "1",
    groupIds: ["1", "2"],
  },
  {
    id: "3",
    email: "student@hp.com",
    password: "student123",
    fullName: "O'quvchi Vali",
    userType: "student" as const,
    phone: "+998901234567",
    groupIds: ["1"],
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json();

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password && u.userType === userType
    );

    if (!user) {
      return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
