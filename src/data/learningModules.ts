export interface LearningModule {
  id: string;
  category: string;
  titleHi: string;
  titleEn: string;
  duration: string;
  badge: string;
  officialSource: string;
  summaryHi: string;
  summaryEn: string;
  keyPointsHi: string[];
  keyPointsEn: string[];
  quickQuiz: {
    questionHi: string;
    questionEn: string;
    optionsHi: string[];
    optionsEn: string[];
    correctIndex: number;
    explanationHi: string;
    explanationEn: string;
  };
}

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'stock_voice_mandate',
    category: 'Stocks & Demat',
    titleHi: 'स्टॉक मार्केट: वॉयस रिकॉर्डिंग और अनधिकृत ट्रेड से सुरक्षा',
    titleEn: 'Stock Market: Voice Recording Mandate & Unauthorized Trades',
    duration: '3 min read',
    badge: 'SEBI Mandatory Rule',
    officialSource: 'SEBI Master Circular for Stock Brokers 2023',
    summaryHi: 'सेबी के नियम के अनुसार फोन पर शेयर खरीदने-बेचने का कोई भी आदेश ब्रोकर केवल रिकॉर्डेड लाइन पर ही ले सकता है। बिना रिकॉर्डिंग किया गया ट्रेड अमान्य माना जा सकता है।',
    summaryEn: 'Under SEBI regulations, stockbrokers can execute telephonic orders ONLY if received on a recorded telephone line. Any trade without voice or digital audit trail is unauthorized.',
    keyPointsHi: [
      'ब्रोकर को हर ट्रेड के 24 घंटे के भीतर कॉन्ट्रैक्ट नोट (Contract Note) ईमेल पर भेजना अनिवार्य है।',
      'यदि ब्रोकर ने आपकी बिना सहमति के शेयर बेचे हैं, तो वॉयस लॉग या ओटीपी ऑडिट ट्रेल दिखाने का दायित्व ब्रोकर का है।',
      'विवाद की स्थिति में आप SMART ODR (smartodr.in) पर निःशुल्क सुलह (Conciliation) शुरू कर सकते हैं।'
    ],
    keyPointsEn: [
      'Brokers are legally obligated to issue digital Contract Notes within 24 hours of trade execution.',
      'If unauthorized trades occur, the broker bears the legal burden of proof to produce recorded consent logs.',
      'Investors can initiate free Online Dispute Resolution via SMART ODR (smartodr.in) under Exchange bylaws.'
    ],
    quickQuiz: {
      questionHi: 'यदि आपके डीमैट खाते में बिना आपकी सहमति के ट्रेड होता है, तो आदेश की पुष्टि का सबूत किसे देना होगा?',
      questionEn: 'If an unauthorized trade is executed in your account, who has the legal burden of proof?',
      optionsHi: [
        'निवेशक को सिद्ध करना होगा कि उसने फोन नहीं किया था',
        'ब्रोकर को रिकॉर्डेड वॉयस कॉल या डिजिटल टोकन लॉग प्रस्तुत करना होगा',
        'पुलिस स्टेशन जाकर गवाही देनी होगी',
        'कोई सबूत आवश्यक नहीं है'
      ],
      optionsEn: [
        'The investor must prove they were not calling',
        'The broker must produce the recorded voice call or digital auth log',
        'A court summons is required first',
        'No proof is legally needed'
      ],
      correctIndex: 1,
      explanationHi: 'बिल्कुल सही! सेबी मास्टर सर्कुलर के अनुसार वॉयस लॉग या प्रमाणित डिजिटल लॉग प्रस्तुत करने की कानूनी जिम्मेदारी स्टॉक ब्रोकर की होती है।',
      explanationEn: 'Correct! Under SEBI Master Circular, the broker is legally required to maintain and furnish verifiable voice recordings or digital 2FA logs.'
    }
  },
  {
    id: 'mutual_fund_redemption',
    category: 'Mutual Funds',
    titleHi: 'म्यूचुअल फंड: रिडेम्पशन समयसीमा और 15% हर्जाना ब्याज नियम',
    titleEn: 'Mutual Funds: Payout Timelines & 15% Interest Penalty Rule',
    duration: '2 min read',
    badge: 'SEBI Regulation 53',
    officialSource: 'SEBI (Mutual Funds) Regulations, 1996 - Regulation 53(c)',
    summaryHi: 'म्यूचुअल फंड में पैसे निकासी (Redemption) का पैसा तय समय (T+2 दिन) में न मिलने पर फंड हाउस (AMC) को निवेशक को 15% सालाना ब्याज देना अनिवार्य है।',
    summaryEn: 'If an AMC delays dispatching mutual fund redemption proceeds beyond T+2 working days, it is mandated by SEBI to pay 15% p.a. interest penalty directly to the investor.',
    keyPointsHi: [
      'इक्विटी और डेट म्यूचुअल फंड में रिडेम्पशन कट-ऑफ समय दोपहर 3:00 बजे (लिक्विड में 1:30 बजे) होता है।',
      'T+2 कार्यदिवस के बाद हर दिन की देरी के लिए 15% प्रति वर्ष की दर से ब्याज आपके बैंक खाते में स्वतः क्रेडिट होना चाहिए।',
      'यदि AMC ब्याज नहीं देता, तो SEBI SCORES 2.0 पर शिकायत दर्ज कर तुरंत हर्जाना मांगा जा सकता है।'
    ],
    keyPointsEn: [
      'Cut-off time for same-day NAV is generally 3:00 PM for equity/debt funds.',
      'For every day of delay beyond T+2, 15% p.a. interest must be credited proactively to the investor.',
      'Grievance can be escalated to SEBI SCORES 2.0 to enforce statutory penalty payment.'
    ],
    quickQuiz: {
      questionHi: 'म्यूचुअल फंड से पैसे निकासी में अनावश्यक देरी होने पर AMC को कितना सालाना ब्याज देना होता है?',
      questionEn: 'What annual interest rate must an AMC pay to investors for delayed redemption payouts?',
      optionsHi: ['4% साधारण बचत दर', '8% बैंक एफडी दर', '15% वार्षिक दंडात्मक ब्याज', 'कोई ब्याज नहीं मिलता'],
      optionsEn: ['4% Savings Rate', '8% Fixed Deposit Rate', '15% per annum mandatory penalty interest', 'No penalty applicable'],
      correctIndex: 2,
      explanationHi: 'सही उत्तर! सेबी विनियम 53(c) के तहत AMC को देरी के लिए 15% प्रति वर्ष की दर से ब्याज निवेशक को देना अनिवार्य है।',
      explanationEn: 'Spot on! Under SEBI Regulation 53(c), the AMC must pay interest at 15% p.a. for the delayed payout duration.'
    }
  },
  {
    id: 'upi_failed_compensation',
    category: 'Banking & UPI',
    titleHi: 'UPI एवं एटीएम: विफल लेन-देन पर ₹100 प्रतिदिन मुआवजा',
    titleEn: 'UPI & ATM: Failed Debit & ₹100/Day Delay Compensation',
    duration: '3 min read',
    badge: 'RBI Harmonised TAT',
    officialSource: 'RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20',
    summaryHi: 'UPI या एटीएम में पैसे कट जाएं लेकिन दुकानदार या कैश न निकले, तो बैंक को T+5 दिनों में पैसे लौटाने होते हैं। इसके बाद बैंक को ₹100 प्रतिदिन हर्जाना देना होगा।',
    summaryEn: 'If account is debited during a failed UPI/ATM transaction, bank must auto-reverse within T+5 days. Post T+5, bank is liable to pay ₹100 per day compensation.',
    keyPointsHi: [
      'UPI ऑटो-रिवर्सल समयसीमा T+1 दिन (अधिकतम T+5 कार्यदिवस) है।',
      'T+5 दिन बीतने के बाद ₹100 प्रतिदिन हर्जाना बैंक को बिना मांगे आपके खाते में जमा करना होता है।',
      'यदि बैंक 30 दिन में समाधान न करे, तो RBI Banking Ombudsman (cms.rbi.org.in या 14448) पर शिकायत करें।'
    ],
    keyPointsEn: [
      'Standard TAT for failed electronic transactions is T+1 day (maximum T+5 days).',
      'Beyond T+5, bank must credit ₹100/day compensation to customer account without requiring a separate request.',
      'File on RBI CMS (cms.rbi.org.in or 14448) if bank fails to compensate.'
    ],
    quickQuiz: {
      questionHi: 'विफल UPI लेन-देन में T+5 दिनों के बाद बैंक को प्रतिदिन कितना मुआवजा देना अनिवार्य है?',
      questionEn: 'How much compensation per day must a bank pay for failed electronic transactions after T+5 days?',
      optionsHi: ['₹10 प्रतिदिन', '₹50 प्रतिदिन', '₹100 प्रतिदिन', 'केवल मूल राशि वापस होती है'],
      optionsEn: ['₹10 per day', '₹50 per day', '₹100 per day', 'Only original amount without compensation'],
      correctIndex: 2,
      explanationHi: 'बिल्कुल सही! आरबीआई के हार्मोनाइज्ड टीएटी सर्कुलर के अनुसार बैंक को ₹100 प्रतिदिन का मुआवजा देना होता है।',
      explanationEn: 'Exactly right! Under RBI guidelines, the bank must auto-credit ₹100 per day compensation for the delay period.'
    }
  },
  {
    id: 'cyber_golden_hour',
    category: 'Cyber Fraud',
    titleHi: 'साइबर ठगी: "गोल्डन ऑवर" और 1930 हेल्पलाइन कैसे काम करती है',
    titleEn: 'Cyber Fraud: The "Golden Hour" & How Helpline 1930 Works',
    duration: '3 min read',
    badge: 'MHA National Portal',
    officialSource: 'Citizen Financial Cyber Fraud Reporting System (CFCFRS)',
    summaryHi: 'धोखाधड़ी होने के पहले 2-4 घंटों को "गोल्डन ऑवर" कहा जाता है। 1930 पर तुरंत कॉल करने से ठग के बैंक खाते में पैसे ब्लॉक किए जा सकते हैं।',
    summaryEn: 'The first 2–4 hours after a financial scam are known as the "Golden Hour". Calling 1930 immediately can freeze funds in the fraudster’s mule accounts.',
    keyPointsHi: [
      '1930 पर कॉल करते समय अपना बैंक खाता नंबर, ठग का खाता/UPI आईडी और UTR नंबर साथ रखें।',
      'साइबर सेल तुरंत संबंधित बैंकों के नोडल अधिकारियों को अलर्ट भेजकर राशि पर लीन (Lien / Freeze) लगा देता है।',
      'कॉल के बाद cybercrime.gov.in पर 24 घंटे के अंदर औपचारिक शिकायत पावती अवश्य प्राप्त करें।'
    ],
    keyPointsEn: [
      'Keep your bank account, transaction UTR, and fraudster account/UPI ID ready when dialing 1930.',
      '1930 triggers automated API alerts to recipient bank nodal desks to mark liens on recipient accounts.',
      'Follow up on cybercrime.gov.in within 24 hours to secure official formal FIR/acknowledgement.'
    ],
    quickQuiz: {
      questionHi: 'ऑनलाइन वित्तीय धोखाधड़ी होने पर सबसे पहला और सबसे महत्वपूर्ण कदम क्या है?',
      questionEn: 'What is the most critical first step immediately following an online financial scam?',
      optionsHi: [
        'अगले दिन बैंक शाखा खुलने का इंतजार करना',
        'गोल्डन ऑवर में तुरंत 1930 डायल करके बैंक खाते में पैसे फ्रीज करवाना',
        'व्हाट्सएप पर ठग से बात करके पैसे वापस मांगना',
        'सोशल मीडिया पर पोस्ट डालना'
      ],
      optionsEn: [
        'Wait for the bank branch to open next morning',
        'Immediately dial 1930 during the Golden Hour to freeze mule accounts',
        'Plead with the scammer on WhatsApp',
        'Post on social media'
      ],
      correctIndex: 1,
      explanationHi: 'उत्कृष्ट! 1930 पर तुरंत सूचना देने से पैसे ठग द्वारा एटीएम से निकाले जाने से पहले ही बैंक द्वारा फ्रीज कर लिए जाते हैं।',
      explanationEn: 'Excellent! Dialing 1930 immediately alerts bank nodal officers to place liens before cash is withdrawn at ATMs.'
    }
  }
];
