import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function askGemini(question: string, context = '') {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
  Bạn là trợ lý AI của hệ thống học trực tuyến. Chỉ dựa vào nội dung sau để trả lời:

  ${context}

  Câu hỏi: ${question}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
