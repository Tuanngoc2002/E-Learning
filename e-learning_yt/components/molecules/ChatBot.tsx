import { useState } from "react";
import { useEffect, useRef } from "react";
import { FaRobot } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function ChatbotButton() {
  const [showChatBox, setShowChatBox] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isLoading]);

  const handleSend = async () => {
    if (!message.trim()) return;

    setChatLog((prev) => [...prev, `🧑 Bạn: ${message}`]);
    setIsLoading(true);

    const prompt = `
        Bạn là một trợ lý học tập thân thiện. Hãy trả lời các câu hỏi liên quan đến học tập, định hướng ngành nghề, kỹ năng cần thiết để đi làm, hoặc lộ trình học phù hợp.

        Nếu người dùng hỏi điều gì không liên quan đến học tập, bạn phải lịch sự từ chối. Trả lời ngắn gọn dưới 300 ký tự.

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
    <div>
      {!showChatBox && (
        <button
          onClick={() => setShowChatBox(true)}
          className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-110 z-50"
        >
          <FaRobot className="w-6 h-6" />
        </button>
      )}

      {showChatBox && (
        <div className="fixed bottom-6 left-6 w-[350px] sm:w-96 h-[500px] bg-white/90 backdrop-blur-md border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl z-50 flex flex-col overflow-hidden transition-all duration-300">
          <div className="bg-gradient-to-r from-[#1d2671] to-[#c33764] text-white px-4 py-3 flex justify-between items-center rounded-t-2xl shadow-md">
            <span className="font-semibold text-lg tracking-wide">
              🎓 Trợ lý học tập AI
            </span>
            <button
              onClick={() => setShowChatBox(false)}
              className="hover:bg-white/20 rounded-full p-1 transition"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 text-sm max-h-[420px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {chatLog.map((line, idx) => {
              const isUser = line.startsWith("🧑");
              const content = line.replace(/^🧑 Bạn: |^🤖 AI: /, "");
              return (
                <div
                  key={idx}
                  className={`flex ${
                    isUser ? "justify-end" : "justify-start"
                  } animate-fadeIn`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-xl text-sm shadow-md ${
                      isUser
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none"
                        : "bg-white/60 backdrop-blur-sm text-gray-900 rounded-bl-none border"
                    }`}
                  >
                    {content}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white/60 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl rounded-bl-none text-sm shadow-md max-w-[75%] border">
                  🤖 Đang trả lời...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-200 flex gap-2 bg-white/80 backdrop-blur">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:ring focus:ring-indigo-300 bg-white"
              placeholder="Nhập câu hỏi..."
            />
            <button
              onClick={handleSend}
              className="bg-gradient-to-r from-[#1d2671] to-[#c33764] text-white px-4 py-2 rounded-full text-sm shadow hover:brightness-110 transition"
              disabled={isLoading}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
