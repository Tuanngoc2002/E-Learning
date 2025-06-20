"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatbotPanel() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatLog, isLoading]);

  const handleSend = async () => {
    if (!message.trim()) return;

    setChatLog((prev) => [...prev, `🧑 Bạn: ${message}`]);
    setIsLoading(true);

    const prompt = `
        Bạn là một trợ lý học tập thân thiện. Hãy trả lời các câu hỏi liên quan đến học tập, định hướng ngành nghề, kỹ năng cần thiết để đi làm, hoặc lộ trình học phù hợp.

        Nếu người dùng hỏi điều gì không liên quan đến học tập, bạn phải lịch sự từ chối. Nếu người dùng hỏi những câu không có ý nghĩa, bạn sẽ tự giới thiệu như sau: 'Chào bạn! Trang web của bọn mình cung cấp những khoá học rất bổ ích đấy. Tôi là Trợ lý học tập thông minh, bạn có cần tôi trợ giúp gì không?'
        
        Trả lời ngắn gọn dưới 300 ký tự. Chỉ dùng dấu chấm, không dùng những ký tự đặc biệt nhiều ngoài icon để thêm sinh động.

        Câu hỏi của người dùng: ${message}
        `;

    setMessage("");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB-lnPkEUFwuBmToLM3lM4GATdXkGK4BH0`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );
    const data = await res.json();
    const aiReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Xin lỗi, tôi chưa có câu trả lời.";

    const sentences = aiReply.split(/(?<=\.)\s+/);
    const formattedChunks = [];
    let chunk = "";

    for (const s of sentences) {
      if ((chunk + " " + s).length > 100) {
        formattedChunks.push(chunk.trim());
        chunk = s;
      } else {
        chunk += " " + s;
      }
    }
    if (chunk) formattedChunks.push(chunk.trim());

    for (const line of formattedChunks) {
      setChatLog((prev) => [...prev, `🤖 AI: ${line}`]);
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full mx-auto bg-white shadow rounded-xl p-6 flex flex-col h-[80vh]">
      <h2 className="text-xl font-bold mb-4 text-purple-700">
        🎓 Trợ lý học tập AI
      </h2>

      <div
        className="flex-1 overflow-y-auto space-y-3 text-sm max-h-full px-2"
        ref={chatContainerRef}
      >
        {chatLog.map((line, idx) => {
          const isUser = line.startsWith("🧑");
          const content = line.replace(/^🧑 Bạn: |^🤖 AI: /, "");
          return (
            <div
              key={idx}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-xl text-sm shadow ${
                  isUser
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                {content}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm shadow max-w-[75%]">
              🤖 Đang trả lời...
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none"
          placeholder="Nhập câu hỏi..."
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm shadow hover:bg-purple-700 transition"
          disabled={isLoading}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
