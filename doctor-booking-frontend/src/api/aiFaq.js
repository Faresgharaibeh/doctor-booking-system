import api from "../services/api";

export async function askFaq(message) {
  try {
    const res = await api.post("/ai/faq/ask", { message });
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;

    // ✅ Console debugging (مؤقت)
    console.error("FAQ API error:", { status, data, err });

    throw err;
  }
}