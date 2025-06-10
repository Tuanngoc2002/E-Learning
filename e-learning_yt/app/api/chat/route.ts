import { askGemini } from "@/lib/geminiService";

export async function POST(req: Request) {
  const body = await req.json();
  const question = body.question;

  // Ví dụ: Context giả lập (có thể thay bằng truy vấn từ DB)
  const context = `
  - Khóa học: JavaScript cơ bản
  - Giảng viên: Nguyễn Văn A
  - Nội dung gồm: Biến, Hàm, Vòng lặp, DOM
  `;

  try {
    const answer = await askGemini(question, context);
    return Response.json({ answer });
  } catch (error) {
    return Response.json({ error: "Lỗi xử lý Gemini" }, { status: 500 });
  }
}
