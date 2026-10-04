export interface ScamAnalysisResult {
  riskLevel: 'CRITICAL_SCAM' | 'HIGH_RISK' | 'CAUTION' | 'LOW_RISK';
  score: number; // 0 - 100
  titleHi: string;
  titleEn: string;
  verdictHi: string;
  verdictEn: string;
  redFlagsHi: string[];
  redFlagsEn: string[];
  regulatoryCheckHi: string;
  regulatoryCheckEn: string;
  safetyActionHi: string[];
  safetyActionEn: string[];
}

export function analyzeScamText(input: string): ScamAnalysisResult {
  const text = input.toLowerCase();
  const redFlagsHi: string[] = [];
  const redFlagsEn: string[] = [];
  let score = 0;

  // 1. Guaranteed returns / doubling claims
  if (/(guarantee|guaranteed|100% profit|300%|500%|2x in|double money|10% daily|monthly 30%|no risk|pakka fayda|guarantee munafa)/i.test(text)) {
    score += 35;
    redFlagsHi.push('अवैध "गारंटीड रिटर्न" का दावा — सेबी पंजीकृत कोई भी संस्था कभी भी शेयर बाजार में निश्चित मुनाफे का वादा नहीं कर सकती।');
    redFlagsEn.push('Illegal "Guaranteed Return" claim — SEBI regulations strictly prohibit promising guaranteed or fixed returns on equities.');
  }

  // 2. Personal Bank Account deposit
  if (/(personal account|savings account|transfer to this upi|individual name|gpay this number|apne khate me bhejo|sharma|kumar|verma|private account)/i.test(text)) {
    score += 30;
    redFlagsHi.push('व्यक्तिगत/अज्ञात बैंक खाते में पैसे जमा करने का अनुरोध — वैध ब्रोकर केवल क्लियरिंग कॉर्पोरेशन के अधिकृत बैंक खाते में फंड लेते हैं।');
    redFlagsEn.push('Request to deposit money into individual savings/UPI accounts — Real stockbrokers accept funds ONLY through recognized clearing corporation client accounts.');
  }

  // 3. Telegram VIP / WhatsApp Secret Group
  if (/(telegram|t\.me|whatsapp group|vip channel|insider tip|upper circuit|operator call|premium group|jackpot call)/i.test(text)) {
    score += 25;
    redFlagsHi.push('अवैध टेलीग्राम/व्हाट्सएप इनसाइडर टिप्स सिंडिकेट — सेबी अपंजीकृत चैनलों पर पेनी स्टॉक्स का भाव कृत्रिम रूप से बढ़ाकर आम निवेशकों को फंसाते हैं।');
    redFlagsEn.push('Unregistered Telegram/WhatsApp VIP channel — Known pump-and-dump syndicates artificially inflate penny stocks before dumping on retail buyers.');
  }

  // 4. Custom APK download / Institutional Account
  if (/(apk|\.apk|download app from link|institutional account|fii quota|hni quota|upper circuit quota|special allocation)/i.test(text)) {
    score += 35;
    redFlagsHi.push('फर्जी संस्थागत ऐप (APK) या विदेशी FII कोटा का झांसा — प्ले स्टोर के बाहर अज्ञात APK डाउनलोड करवाने से फोन और बैंक दोनों हैक हो सकते हैं।');
    redFlagsEn.push('Fake Institutional APK / Foreign FII Quota scam — Installing unknown APKs outside Play Store can compromise banking credentials and simulate fake profits.');
  }

  // 5. Digital Arrest / Police / CBI Threat
  if (/(digital arrest|cbi|police|customs|trai|sim block|money laundering|parcel seized|video call verification|aadhaar illegal)/i.test(text)) {
    score += 40;
    redFlagsHi.push('फर्जी "डिजिटल अरेस्ट" और पुलिस धमकी — भारतीय कानून में वीडियो कॉल पर किसी को अरेस्ट करने या पैसे जांच खाते में डलवाने का कोई प्रावधान नहीं है।');
    redFlagsEn.push('Fraudulent "Digital Arrest" extortion — Indian law has NO provision for digital arrest over Skype/WhatsApp calls. Law enforcement never asks for money transfers.');
  }

  // 6. Tax / Fee to withdraw money
  if (/(withdrawal fee|pay 20% tax|margin money to unlock|processing fee to withdraw|paise nikalne ke liye tax)/i.test(text)) {
    score += 30;
    redFlagsHi.push('पैसे निकालने के लिए अग्रिम "टैक्स/फीस" की मांग — ठग फंसे हुए पैसे वापस करने का झांसा देकर और पैसे ऐंठते हैं। एक बार भी और पैसे न दें।');
    redFlagsEn.push('Demand for upfront "Tax / Clearance Fee" to withdraw funds — Classic recovery extortion trap. Never send additional funds to unlock balance.');
  }

  // 7. Suspicious link shorteners
  if (/(bit\.ly|tinyurl|t\.me|wa\.me|cutt\.ly|drive\.google\.com|download-now)/i.test(text)) {
    score += 15;
    redFlagsHi.push('संदिग्ध शॉर्ट लिंक या अनधिकृत डोमेन — आधिकारिक वित्तीय संस्थाएं हमेशा https:// के साथ अपने पंजीकृत मुख्य डोमेन का ही उपयोग करती हैं।');
    redFlagsEn.push('Shortened or unverified domain link — Regulated entities operate exclusively under official, transparent root domains.');
  }

  let riskLevel: ScamAnalysisResult['riskLevel'] = 'LOW_RISK';
  let titleHi = 'कम जोखिम (सावधानी बरतें)';
  let titleEn = 'Low Direct Risk (Exercise Due Diligence)';
  let verdictHi = 'संदेश में कोई प्रत्यक्ष वित्तीय धोखाधड़ी का संकेत नहीं मिला, लेकिन किसी भी वित्तीय लेन-देन से पूर्व सेबी/आरबीआई पंजीयन अवश्य सत्यापित करें।';
  let verdictEn = 'No prominent scam markers detected in this text. However, always verify credentials on official regulatory portals before investing.';

  if (score >= 60) {
    riskLevel = 'CRITICAL_SCAM';
    titleHi = '🚨 अति गंभीर धोखाधड़ी चेतावनी (Critical Scam Alert)';
    titleEn = '🚨 Critical Scam Alert (Do Not Send Money)';
    verdictHi = 'यह संदेश 100% संगठित वित्तीय साइबर धोखाधड़ी के पैटर्न से मेल खाता है। इस पर 1 रुपया भी न भेजें, यह पूरी तरह अवैध सिंडिकेट है।';
    verdictEn = 'This text exhibits multiple classic signatures of organized financial cybercrime syndicates. Under NO circumstances should you send any money or install any app.';
  } else if (score >= 30) {
    riskLevel = 'HIGH_RISK';
    titleHi = '⚠️ उच्च जोखिम संदेश (High Risk Alert)';
    titleEn = '⚠️ High Risk Suspicion';
    verdictHi = 'इस संदेश में गैर-कानूनी शेयर बाजार गतिविधियों या अवैध रिटर्न के कई संदिग्ध तत्व पाए गए हैं। तुरंत सतर्क हो जाएं।';
    verdictEn = 'Contains significant red flags commonly associated with unregistered operators and financial traps.';
  } else if (score > 0) {
    riskLevel = 'CAUTION';
    titleHi = '⚡ सतर्कता आवश्यक (Proceed with Caution)';
    titleEn = '⚡ Caution Advised';
    verdictHi = 'संदेश में कुछ अस्वाभाविक दावे हैं। बिना आधिकारिक नियामक लाइसेंस देखे कोई निर्णय न लें।';
    verdictEn = 'Some unusual claims detected. Verify the entity on SEBI/RBI registered lists before proceeding.';
  }

  return {
    riskLevel,
    score: Math.min(100, Math.max(score, 5)),
    titleHi,
    titleEn,
    verdictHi,
    verdictEn,
    redFlagsHi: redFlagsHi.length > 0 ? redFlagsHi : ['कोई खुला लाल झंडा नहीं दिखा, लेकिन अज्ञात स्रोतों से आए निवेश लिंक पर कभी क्लिक न करें।'],
    redFlagsEn: redFlagsEn.length > 0 ? redFlagsEn : ['No blatant scam phrases detected, but never click unsolicited investment attachments.'],
    regulatoryCheckHi: 'सेबी अधिनियम 1992 एवं BUDS एक्ट 2019 के अनुसार अपंजीकृत व्यक्तियों द्वारा जनता से निवेश एकत्र करना गैर-जमानती अपराध है।',
    regulatoryCheckEn: 'Under SEBI Act 1992 and BUDS Act 2019, soliciting deposits or offering uncertified investment schemes without registration is a cognizable criminal offense.',
    safetyActionHi: [
      '1. किसी भी अनजान व्यक्ति, चालू खाते या यूपीआई आईडी पर पैसे कभी ट्रांसफर न करें।',
      '2. यदि पहले से पैसे भेज चुके हैं, तो 1 घंटे के अंदर तुरंत 1930 पर कॉल करें या cybercrime.gov.in पर रिपोर्ट दर्ज करें।',
      '3. यदि कोई ऐप APK डाउनलोड किया है, तो उसे तुरंत अनइंस्टॉल करें और अपने नेटबैंकिंग पासवर्ड बदल लें।'
    ],
    safetyActionEn: [
      '1. NEVER transfer funds to individual personal bank accounts or private UPI IDs.',
      '2. If you already deposited funds, IMMEDIATELY dial 1930 to trigger bank lien freezes on recipient accounts.',
      '3. If you installed a custom APK file, uninstall it immediately and reset your mobile banking MPIN and passwords from a clean device.'
    ]
  };
}
