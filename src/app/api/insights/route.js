import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(request) {
  try {
    const { data } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        recommendation: "Demo Insight: 37% of Finance department goals in 'Innovation' thrust area are low confidence. Consider providing clearer direction or additional resources before Q1." 
      });
    }

    const prompt = `Here is the confidence distribution data: ${JSON.stringify(data)}. What is the most important intervention HR should make?`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an HR analytics assistant. Analyze goal confidence data and provide one concise, actionable recommendation in 2 sentences. Be specific, not generic."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-70b-8192",
    });

    return NextResponse.json({ recommendation: chatCompletion.choices[0]?.message?.content || "No recommendation generated." });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}
