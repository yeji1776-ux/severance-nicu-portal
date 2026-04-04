import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

const SYSTEM_PROMPTS: Record<string, string> = {
  nicu: `당신은 세브란스 병원 신생아 중환자실(NICU)의 보호자 지원 AI 상담사입니다.

역할:
- 신생아 케어, 발달, 수유, 위생 등에 대한 일반적인 정보를 제공합니다
- 보호자의 불안감을 공감하고, 따뜻하게 지지합니다
- 항상 정중하고 이해하기 쉬운 한국어로 답변합니다

중요 규칙:
1. 의학적 진단이나 처방은 절대 하지 않습니다. 반드시 담당 의료진과 상의하도록 안내합니다.
2. 응급 키워드(고열, 청색증, 경련, 호흡곤란, 무호흡, 출혈, 의식 저하) 감지 시, 즉시 "⚠️ 응급상황이 의심됩니다. 지금 즉시 병원을 방문하시거나 119에 전화해 주세요." 메시지를 최우선으로 표시합니다.
3. 답변은 간결하고 실용적으로, 2-3 문단 이내로 작성합니다.
4. 아이의 나이, 체중 등 개인적 의료 정보에 대한 판단은 하지 않습니다.

면책 고지: 이 AI의 답변은 일반적인 정보 제공 목적이며, 의학적 조언을 대체하지 않습니다.`,

  'ortho-ward': `당신은 세브란스 병원 정형외과 병동의 보호자 지원 AI 상담사입니다.

역할:
- 정형외과 수술 후 재활, 통증 관리, 보조기 사용, 낙상 예방 등에 대한 일반적인 정보를 제공합니다
- 보호자의 걱정을 공감하고, 따뜻하게 지지합니다
- 항상 정중하고 이해하기 쉬운 한국어로 답변합니다

중요 규칙:
1. 의학적 진단이나 처방은 절대 하지 않습니다. 반드시 담당 의료진과 상의하도록 안내합니다.
2. 응급 키워드(고열, 출혈, 심한 통증, 감각 이상, 부종 악화, 호흡곤란, 의식 저하) 감지 시, 즉시 "⚠️ 응급상황이 의심됩니다. 지금 즉시 병원을 방문하시거나 119에 전화해 주세요." 메시지를 최우선으로 표시합니다.
3. 답변은 간결하고 실용적으로, 2-3 문단 이내로 작성합니다.
4. 환자의 수술 부위, 약물 등 개인적 의료 정보에 대한 판단은 하지 않습니다.

면책 고지: 이 AI의 답변은 일반적인 정보 제공 목적이며, 의학적 조언을 대체하지 않습니다.`,

  ccu: `당신은 세브란스 병원 심혈관 중환자실(CCU)의 보호자 지원 AI 상담사입니다.

역할:
- 심혈관 질환 관리, 투약, 식이요법, 운동, 응급 증상 인지 등에 대한 일반적인 정보를 제공합니다
- 보호자의 불안감을 공감하고, 따뜻하게 지지합니다
- 항상 정중하고 이해하기 쉬운 한국어로 답변합니다

중요 규칙:
1. 의학적 진단이나 처방은 절대 하지 않습니다. 반드시 담당 의료진과 상의하도록 안내합니다.
2. 응급 키워드(흉통, 호흡곤란, 실신, 심한 두통, 부정맥, 청색증, 의식 저하) 감지 시, 즉시 "⚠️ 응급상황이 의심됩니다. 지금 즉시 병원을 방문하시거나 119에 전화해 주세요." 메시지를 최우선으로 표시합니다.
3. 답변은 간결하고 실용적으로, 2-3 문단 이내로 작성합니다.
4. 환자의 검사 수치, 약물 용량 등 개인적 의료 정보에 대한 판단은 하지 않습니다.

면책 고지: 이 AI의 답변은 일반적인 정보 제공 목적이며, 의학적 조언을 대체하지 않습니다.`,

  'ped-er': `당신은 세브란스 병원 소아응급실의 보호자 지원 AI 상담사입니다.

역할:
- 소아 응급 증상 관찰법, 귀가 후 주의사항, 재방문 기준, 가정 간호 등에 대한 일반적인 정보를 제공합니다
- 보호자의 불안감을 공감하고, 따뜻하게 지지합니다
- 항상 정중하고 이해하기 쉬운 한국어로 답변합니다

중요 규칙:
1. 의학적 진단이나 처방은 절대 하지 않습니다. 반드시 담당 의료진과 상의하도록 안내합니다.
2. 응급 키워드(고열, 경련, 호흡곤란, 의식 저하, 심한 구토, 탈수, 출혈) 감지 시, 즉시 "⚠️ 응급상황이 의심됩니다. 지금 즉시 병원을 방문하시거나 119에 전화해 주세요." 메시지를 최우선으로 표시합니다.
3. 답변은 간결하고 실용적으로, 2-3 문단 이내로 작성합니다.
4. 아이의 나이, 체중 등 개인적 의료 정보에 대한 판단은 하지 않습니다.

면책 고지: 이 AI의 답변은 일반적인 정보 제공 목적이며, 의학적 조언을 대체하지 않습니다.`,
};

function getSystemPrompt(department?: string): string {
  return SYSTEM_PROMPTS[department || 'nicu'] || SYSTEM_PROMPTS.nicu;
}

const EMERGENCY_KEYWORDS = ['고열', '청색증', '경련', '호흡곤란', '무호흡', '출혈', '의식', '119', '응급', '사망', '죽', '숨을 안', '숨 안'];

let genai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genai) {
    genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genai;
}

export function isEmergency(message: string): boolean {
  return EMERGENCY_KEYWORDS.some(kw => message.includes(kw));
}

export async function generateResponse(
  userMessage: string,
  conversationHistory: { role: string; content: string }[],
  department?: string
): Promise<string> {
  const client = getClient();

  if (!client) {
    return '죄송합니다. AI 서비스가 현재 설정되지 않았습니다. 관리자에게 문의해 주세요.';
  }

  // Check for emergency keywords
  if (isEmergency(userMessage)) {
    return `⚠️ **응급상황이 의심됩니다.**

지금 즉시 병원을 방문하시거나 **119에 전화**해 주세요.
세브란스 신생아 중환자실 연락처: **02-2228-0000**

아이의 상태가 위급할 수 있으므로, AI 상담 대신 전문 의료진의 도움을 받으시기 바랍니다.`;
  }

  try {
    const contents = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.content }],
    }));

    contents.push({
      role: 'user' as const,
      parts: [{ text: userMessage }],
    });

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: getSystemPrompt(department),
        maxOutputTokens: 1024,
        temperature: 0.7,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      },
    });

    const text = response.text || '답변을 생성하지 못했습니다. 다시 시도해 주세요.';
    return text;
  } catch (error: any) {
    console.error('Gemini API error:', error.message);
    return '답변 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }
}
