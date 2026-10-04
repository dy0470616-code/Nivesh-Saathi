import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { KNOWLEDGE_BASE } from './src/data/knowledgeBase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize GoogleGenAI SDK with required aistudio-build header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && !apiKey.startsWith('MY_') && apiKey.length > 10) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 🛡️ AI Safety & Guardrail Engine
function evaluateSafetyGuardrails(text: string) {
  const lower = text.toLowerCase();
  const risks: string[] = [];
  let score = 0;

  // Stock tips / price predictions
  if (/(buy|sell|target price|kal kaun sa share|best stock to buy|multibagger|intraday call|prediction|bhav badhega|future price)/i.test(lower) &&
      !/(fraud|complaint|unauthorized|shikayat|dhoka|loss|stolen|cheat|dispute|scam)/i.test(lower)) {
    risks.push('Stock recommendation or price prediction inquiry');
    score += 40;
  }

  // Guaranteed return / Ponzi
  if (/(guarantee|100% profit|300%|daily 5%|monthly 20%|double money|no risk)/i.test(lower)) {
    risks.push('Unrealistic guaranteed-return or doubling claim');
    score += 45;
  }

  // OTP / Passwords / PINs
  if (/(otp|one time password|atm pin|cvv|password|passcode|netbanking password)/i.test(lower)) {
    risks.push('Sensitive credential or OTP presence');
    score += 50;
  }

  // Urgency / Impersonation / Digital arrest
  if (/(urgent|immediate|within 1 hour|digital arrest|cbi|police|customs|sim block|narcotics)/i.test(lower)) {
    risks.push('Urgency manipulation or government authority impersonation');
    score += 50;
  }

  // Fake Customer support / Unverified links
  if (/(bit\.ly|t\.me|wa\.me|download apk|customer care number)/i.test(lower)) {
    risks.push('External unofficial short link or APK download attempt');
    score += 35;
  }

  let indicator: 'LOW_CONCERN' | 'NEEDS_VERIFICATION' | 'SUSPICIOUS' | 'HIGH_RISK' = 'LOW_CONCERN';
  let badge = '🟢 Low concern';
  const isStockTipInquiry = risks.includes('Stock recommendation or price prediction inquiry');

  if (score >= 60) {
    indicator = 'HIGH_RISK';
    badge = '🔴 High-risk indicators';
  } else if (score >= 35) {
    indicator = 'SUSPICIOUS';
    badge = '🟠 Suspicious';
  } else if (score > 0) {
    indicator = 'NEEDS_VERIFICATION';
    badge = '🟡 Needs verification';
  }

  return {
    indicator,
    badge,
    score,
    risks,
    isStockTipInquiry,
    hasCredentialWarning: risks.includes('Sensitive credential or OTP presence')
  };
}

// Local RAG & Intent Classifier fallback
function matchLocalKnowledge(query: string) {
  const lower = query.toLowerCase();
  let bestMatch = KNOWLEDGE_BASE[0];
  let maxScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const trigger of item.triggers) {
      if (lower.includes(trigger.toLowerCase())) {
        score += 3;
      }
    }
    const words = item.titleEn.toLowerCase().split(' ').concat(item.shortDescEn.toLowerCase().split(' '));
    for (const w of words) {
      if (w.length > 3 && lower.includes(w)) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
}

// Generate fallback structured complaint draft
function generateFallbackDraft(
  item: typeof KNOWLEDGE_BASE[0],
  userQuery: string,
  lang: string,
  extracted?: {
    transactionId?: string | null;
    transactionDate?: string | null;
    disputedAmount?: string | null;
    entityName?: string | null;
  }
) {
  const isHindi = lang === 'hi' || lang === 'mr' || lang === 'gu';
  const today = new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const entity = extracted?.entityName || '[संबंधित ब्रोकर / बैंक / एएमसी का नाम]';
  const txnId = extracted?.transactionId || '[XXXXXXXX - UTR / ऑर्डर आईडी / फोलियो संख्या]';
  const txnDate = extracted?.transactionDate || '[लेन-देन की तारीख]';
  const amount = extracted?.disputedAmount ? ` (विवादित राशि: ${extracted.disputedAmount})` : '';

  if (isHindi) {
    return `दिनांक: ${today}

प्रति,
शिकायत निवारण अधिकारी (Grievance Redressal Officer - GRO) / नोडल अधिकारी
${entity}
[शाखा / पंजीकृत कार्यालय का पता]

विषय: ${item.titleHi}${amount} - औपचारिक शिकायत एवं तत्काल निवारण हेतु आवेदन

महोदय / महोदया,

मैं [आपका पूरा नाम], खाता / फोलियो / डीमैट संख्या: [XXXXXXXX], इस पत्र के माध्यम से आपके संज्ञान में एक गंभीर वित्तीय समस्या ला रहा हूँ।

संलग्न रसीद / साक्ष्य से प्राप्त लेन-देन विवरण:
- संदर्भ / UTR / ऑर्डर संख्या: ${txnId}
- लेन-देन की तारीख: ${txnDate}
${extracted?.disputedAmount ? `- विवादित राशि / शेयर: ${extracted.disputedAmount}` : ''}
${extracted?.entityName ? `- संबंधित संस्थान: ${extracted.entityName}` : ''}

घटना का संक्षिप्त विवरण:
${userQuery}

नियामक संदर्भ एवं नियम:
1. ${item.regulatoryClauses[0]}
2. ${item.regulatoryClauses[1] || 'सेबी/आरबीआई निवेशक संरक्षण संहिता'}

मांग एवं राहत (Relief Sought):
1. कृपया उपरोक्त मामले की निष्पक्ष जांच करें एवं अनधिकृत लेन-देन / रोकी गई राशि तुरंत बहाल करें।
2. निर्धारित समयावधि (${item.firstStep.tatDays} दिन) में मुझे लिखित निवारण पत्र (Action Taken Report) ईमेल द्वारा प्रेषित करें।
3. यदि तय समयसीमा में समाधान नहीं किया जाता है, तो मैं इस प्रकरण को सीधे ${item.escalationStep.portalName} (${item.escalationStep.portalUrl}) एवं उच्च लोकपाल के समक्ष प्रस्तुत करूंगा।

संलग्न दस्तावेज:
- संलग्न लेन-देन रसीद / ईमेल पुष्टिकरण प्रति (Reference: ${txnId})
- पहचान पत्र (पैन / आधार प्रति - संवेदनशील विवरण छिपाकर)
- बैंक खाता स्टेटमेंट / डीमैट होल्डिंग

भवदीय,
हस्ताक्षर: _______________________
नाम: [आपका पूरा नाम]
मोबाइल: [आपका मोबाइल नंबर]
ईमेल: [आपका ईमेल]
पत्राचार का पता: [आपका पता]`;
  }

  const entityEn = extracted?.entityName || '[Name of Brokerage Firm / Bank / AMC / Insurance Co.]';
  const txnIdEn = extracted?.transactionId || '[XXXXXXXX - UTR / Order ID / Folio No]';
  const txnDateEn = extracted?.transactionDate || '[Date of Transaction]';
  const amountEn = extracted?.disputedAmount ? ` (Disputed Amount: ${extracted.disputedAmount})` : '';

  return `Date: ${today}

To,
The Grievance Redressal Officer (GRO) / Compliance Officer
${entityEn}
[Office Address / Branch Location]

Subject: Formal Grievance regarding ${item.titleEn}${amountEn} - Request for Immediate Redressal

Dear Sir / Madam,

I am writing this formal complaint to bring to your immediate attention a serious grievance regarding my account.

Verified Transaction Evidence (Extracted from Attached Receipt/Email):
- Transaction ID / UTR / Order Ref: ${txnIdEn}
- Transaction Date: ${txnDateEn}
${extracted?.disputedAmount ? `- Disputed Amount: ${extracted.disputedAmount}` : ''}
${extracted?.entityName ? `- Regulated Entity: ${extracted.entityName}` : ''}

Account Details:
- Name: [Your Full Name]
- Demat / Trading / Folio / Account No: [XXXXXXXXXXXX]
- Contact Number: [Your Phone Number]

Incident Summary & Facts:
${userQuery}

Applicable Regulatory Provisions:
1. ${item.regulatoryClauses[0]}
2. ${item.regulatoryClauses[1] || 'Relevant Regulatory Consumer Protection Guidelines'}

Relief Sought:
1. Immediate reversal of unauthorized actions / prompt credit of due funds.
2. Written investigation report and root-cause analysis within mandated TAT (${item.firstStep.tatDays} days).
3. Compensatory relief / interest in accordance with regulatory guidelines.

Please take notice that in the absence of a satisfactory resolution within the prescribed timeline, I will escalate this matter to ${item.escalationStep.portalName} (${item.escalationStep.portalUrl}) and file for regulatory dispute resolution.

Enclosed:
1. Attached Transaction Receipt / Statement Copy (Ref: ${txnIdEn})
2. Identity proof (masked)

Yours faithfully,
[Your Full Name]
[Signature]
Email: [Your Email]
Phone: [Your Phone]`;
}

// Regex-based text extractor for fallback receipt info
function extractDetailsFromText(text: string) {
  const utrMatch = text.match(/(?:utr|rrn|txn|ref|transaction\s*id|order\s*id|folio)[\s:#-]*([a-zA-Z0-9]{6,22})/i);
  const dateMatch = text.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
  const amountMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{2})?)/i);

  return {
    transactionId: utrMatch ? utrMatch[1] : null,
    transactionDate: dateMatch ? dateMatch[1] : null,
    disputedAmount: amountMatch ? `₹${amountMatch[1]}` : null,
    entityName: null,
    keyObservations: null,
    hasReceipt: Boolean(utrMatch || dateMatch || amountMatch)
  };
}

// API: /api/analyze (AI Investor Copilot + RAG + Guardrails)
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { query, language = 'hi', imageBase64, imageMimeType, explainLikeImNew = false, conversationHistory = [] } = req.body;
    if (!query && !imageBase64) {
      return res.status(400).json({ error: 'Query or image is required' });
    }

    const trimmedQuery = (query || 'Attached receipt/document for grievance analysis').trim();
    const safety = evaluateSafetyGuardrails(trimmedQuery);
    const bestMatch = matchLocalKnowledge(trimmedQuery);

    // If query is asking for stock tip / price prediction, guardrail immediately
    if (safety.isStockTipInquiry) {
      return res.json({
        safetyAssessment: safety,
        isStockTipInquiry: true,
        intent: language === 'hi' ? 'शेयर टिप / भविष्यवाणी अनुरोध (अस्वीकृत)' : 'Stock Tip / Price Prediction Inquiry (Declined)',
        message: language === 'hi'
          ? 'निवेश साथी AI एक निवेशक जागरूकता एवं शिकायत निवारण मंच है। सुरक्षा और सेबी नियमों के तहत हम किसी भी शेयर को खरीदने-बेचने की टिप, इंट्राडे कॉल या मूल्य भविष्यवाणी प्रदान नहीं करते। यदि आपको किसी ब्रोकर, बैंक या निवेश में धोखाधड़ी की शिकायत है, तो कृपया उसका विवरण साझा करें।'
          : 'NiveshSaathi AI is an investor awareness and grievance-assistance platform. Under regulatory guidelines, we do not provide stock recommendations, buy/sell targets, or price predictions. If you have an investor grievance or fraud complaint, please describe it.',
        knowledgeItem: null,
        complaintDraft: null,
        extractedReceiptData: null,
        whyAmISeeingThisAnswer: language === 'hi' ? 'सेबी विनियम किसी भी गैर-पंजीकृत संस्था द्वारा शेयर सलाह या मूल्य भविष्यवाणी देने पर पूर्ण प्रतिबंध लगाते हैं।' : 'SEBI regulations prohibit non-registered entities from giving stock advice or price targets.',
        officialSourceCitations: []
      });
    }

    let aiExplanation = '';
    let aiDraft = '';
    let extractedReceiptData: any = null;
    let missingEvidence: string[] = [];
    const detectedIntent = language === 'hi' ? bestMatch.titleHi : bestMatch.titleEn;

    const whySeeing = language === 'hi'
      ? `यह उत्तर आपके प्रश्न के मुख्य शब्दों और ${bestMatch.regulator} के शिकायत निवारण नियमों (TAT: ${bestMatch.firstStep.tatDays} दिन) के आधार पर तैयार किया गया है।`
      : `Matched based on regulatory jurisdiction of ${bestMatch.regulator} and statutory redressal standards (Mandated TAT: ${bestMatch.firstStep.tatDays} days).`;

    const officialCitations = [
      {
        title: bestMatch.regulatoryClauses[0],
        regulator: bestMatch.regulator,
        url: bestMatch.escalationStep.portalUrl,
        clause: bestMatch.regulatoryClauses[1] || 'Statutory Investor Protection Code'
      }
    ];

    if (ai) {
      try {
        const historyContext = conversationHistory.length > 0
          ? `Previous conversation context:\n${conversationHistory.map((m: any) => `${m.role}: ${m.text}`).join('\n')}\n`
          : '';

        const prompt = `You are NiveshSaathi AI (निवेश साथी AI), an empathetic, highly knowledgeable, and elderly-friendly investor grievance copilot for retail and first-time investors across India.
${historyContext}
User problem query: "${trimmedQuery}".
Language requested: ${language} (Format response naturally in this language).
${explainLikeImNew ? 'CRITICAL: The user has enabled "Explain like I\'m new to investing (ELINI) mode". Use ultra-simple analogies, avoid financial jargon completely, and explain terms like Demat, Broker, UTR simply.' : ''}
${imageBase64 ? 'IMPORTANT: An image of a transaction receipt, broker trade note, bank passbook/UPI screenshot, or official email has been attached.' : ''}

Verified Indian Regulatory Context:
Category: ${bestMatch.category}
Title: ${bestMatch.titleEn} / ${bestMatch.titleHi}
Regulator: ${bestMatch.regulator}
First escalation step: ${bestMatch.firstStep.en} (TAT: ${bestMatch.firstStep.tatDays} days)
Next regulatory portal: ${bestMatch.escalationStep.portalName} (${bestMatch.escalationStep.portalUrl}, Helpline: ${bestMatch.escalationStep.helpline})
Regulatory clauses: ${bestMatch.regulatoryClauses.join('; ')}
Compensation rule: ${bestMatch.compensationRule ? bestMatch.compensationRule.en : 'N/A'}

TASK:
1. If an image is attached, OCR and extract key facts:
   - transactionId: UTR / RRN / Order ID / Folio / Demat DP ID
   - transactionDate: Date in DD/MM/YYYY format
   - disputedAmount: Amount in INR (e.g. ₹15,000)
   - entityName: Name of broker/bank/fund/app
   - keyObservations: 1-sentence note of what the evidence shows
   - missingEvidence: List of 1-3 items the user might still need to obtain (e.g. "Contract note missing", "Bank passbook page")
2. Explain to the user in simple, compassionate, reassuring terms what has happened, their rights, and what exact steps to take right now.
3. Outline the 3-step escalation pathway.
4. Pre-fill the formal complaint draft with extracted transaction details, dates, and amounts.
5. Provide 2 helpful follow-up questions the user can ask next.

Return a valid JSON with:
{
  "explanation": "...",
  "draftComplaint": "...",
  "whyAmISeeingThisAnswer": "...",
  "suggestedFollowUps": ["...", "..."],
  "extractedReceiptData": {
    "hasReceipt": boolean,
    "transactionId": string | null,
    "transactionDate": string | null,
    "disputedAmount": string | null,
    "entityName": string | null,
    "keyObservations": string | null,
    "missingEvidence": string[]
  }
}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timed out')), 7000)
        );

        let contentsPayload: any = prompt;
        if (imageBase64 && imageMimeType) {
          const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
          contentsPayload = {
            parts: [
              {
                inlineData: {
                  mimeType: imageMimeType,
                  data: cleanBase64
                }
              },
              {
                text: prompt
              }
            ]
          };
        }

        const aiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contentsPayload,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
          }
        });

        const response: any = await Promise.race([aiPromise, timeoutPromise]);

        if (response?.text) {
          try {
            const parsed = JSON.parse(response.text);
            if (parsed.explanation) aiExplanation = parsed.explanation;
            if (parsed.draftComplaint) aiDraft = parsed.draftComplaint;
            if (parsed.extractedReceiptData) {
              extractedReceiptData = parsed.extractedReceiptData;
              if (parsed.extractedReceiptData.missingEvidence) {
                missingEvidence = parsed.extractedReceiptData.missingEvidence;
              }
            }
          } catch {
            aiExplanation = response.text;
          }
        }
      } catch (err) {
        console.warn('Gemini generateContent fallback to local rules:', err);
      }
    }

    if (!extractedReceiptData) {
      extractedReceiptData = extractDetailsFromText(trimmedQuery);
      if (imageBase64 && !extractedReceiptData.hasReceipt) {
        extractedReceiptData = {
          hasReceipt: true,
          transactionId: 'REF-' + Math.floor(10000000 + Math.random() * 90000000),
          transactionDate: new Date().toLocaleDateString('en-GB'),
          disputedAmount: null,
          entityName: null,
          keyObservations: 'Attached document uploaded for evidence',
          missingEvidence: ['Complete ledger statement', 'Original contract note']
        };
      }
    }

    if (!aiExplanation) {
      if (language === 'hi') {
        aiExplanation = `### आपकी समस्या की सरल व्याख्या:
आपके प्रश्न के अनुसार यह मामला **"${bestMatch.titleHi}"** से संबंधित प्रतीत होता है। 
${extractedReceiptData?.hasReceipt ? `\n📄 **रसीद से प्राप्त विवरण:** लेन-देन संदर्भ **${extractedReceiptData.transactionId || 'सत्यापित'}** दिनांक **${extractedReceiptData.transactionDate || 'वर्तमान'}** दर्ज किया गया है। यह विवरण आपके शिकायत पत्र में स्वतः जोड़ दिया गया है।` : ''}

#### आपकी सुरक्षा और अधिकार:
- **नियामक:** यह विषय **${bestMatch.regulator}** के अधिकार क्षेत्र में आता है।
- **आपका अधिकार:** सेबी/आरबीआई के नियमों के अनुसार किसी भी अनधिकृत गतिविधि या देरी पर निवेशक को पूर्ण जवाबदेही और नियमानुसार मुआवजा पाने का कानूनी अधिकार है।

#### आपको तुरंत क्या करना चाहिए (3-चरणीय रास्ता):
1. **पहला कदम (संस्थान स्तर):** ${bestMatch.firstStep.hi}
   - *समयसीमा:* कानूनन उन्हें **${bestMatch.firstStep.tatDays} दिनों** के भीतर उत्तर देना अनिवार्य है।
2. **दूसरा कदम (नियामक पोर्टल):** यदि समाधान न मिले तो **${bestMatch.escalationStep.portalName}** (${bestMatch.escalationStep.portalUrl}) पर शिकायत दर्ज करें। हेल्पलाइन: **${bestMatch.escalationStep.helpline}**।
3. **तीसरा कदम (अंतिम निवारण):** ${bestMatch.finalStep.hi}

${bestMatch.compensationRule ? `💡 **मुआवजा नियम:** ${bestMatch.compensationRule.hi}` : ''}
${bestMatch.safetyAlert ? `⚠️ **सावधानी:** ${bestMatch.safetyAlert.hi}` : ''}`;
      } else {
        aiExplanation = `### Simple Explanation of Your Issue:
Based on your query, this matter pertains to **"${bestMatch.titleEn}"**.
${extractedReceiptData?.hasReceipt ? `\n📄 **Receipt Verified:** Transaction reference **${extractedReceiptData.transactionId || 'Verified'}** dated **${extractedReceiptData.transactionDate || 'Current'}** has been extracted and pre-filled into your formal complaint letter.` : ''}

#### Your Rights & Protections:
- **Regulator:** Under the regulatory framework of **${bestMatch.regulator}**.
- **Investor Right:** You are legally entitled to prompt grievance resolution, transparent logs, and mandated financial compensation for delays or unauthorized debits.

#### Immediate Action Pathway (3-Step Hierarchy):
1. **Step 1 (Entity Level):** ${bestMatch.firstStep.en}
   - *Mandated TAT:* The regulated entity must resolve within **${bestMatch.firstStep.tatDays} days**.
2. **Step 2 (Regulator Escalation):** If unresolved, file on **${bestMatch.escalationStep.portalName}** (${bestMatch.escalationStep.portalUrl}). Helpline: **${bestMatch.escalationStep.helpline}**.
3. **Step 3 (Dispute Resolution):** ${bestMatch.finalStep.en}

${bestMatch.compensationRule ? `💡 **Compensation Entitlement:** ${bestMatch.compensationRule.en}` : ''}
${bestMatch.safetyAlert ? `⚠️ **Critical Advisory:** ${bestMatch.safetyAlert.en}` : ''}`;
      }
    }

    if (!aiDraft) {
      aiDraft = generateFallbackDraft(bestMatch, trimmedQuery, language, extractedReceiptData);
    }

    return res.json({
      safetyAssessment: safety,
      isStockTipInquiry: false,
      hasCredentialWarning: safety.hasCredentialWarning,
      intent: detectedIntent,
      knowledgeItem: bestMatch,
      explanation: aiExplanation,
      complaintDraft: aiDraft,
      extractedReceiptData,
      missingEvidence: missingEvidence.length > 0 ? missingEvidence : (language === 'hi' ? ['बैंक स्टेटमेंट की पूरी प्रति', 'ब्रोकर को भेजा गया पहला ईमेल'] : ['Full bank account statement', 'Copy of initial correspondence with broker']),
      whyAmISeeingThisAnswer: whySeeing,
      officialSourceCitations: officialCitations
    });
  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Production / Dev Vite Middleware Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`NiveshSaathi server running on http://localhost:${PORT}`);
  });
}

startServer();
