export interface KnowledgeItem {
  id: string;
  category: 'stocks_sebi' | 'mutual_funds' | 'banking_rbi' | 'insurance_irdai' | 'cyber_fraud' | 'pension_pfrda';
  titleEn: string;
  titleHi: string;
  shortDescEn: string;
  shortDescHi: string;
  triggers: string[];
  regulator: string;
  firstStep: {
    en: string;
    hi: string;
    tatDays: number;
  };
  escalationStep: {
    portalName: string;
    portalUrl: string;
    helpline: string;
    en: string;
    hi: string;
  };
  finalStep: {
    en: string;
    hi: string;
    mechanism: string;
  };
  requiredDocuments: {
    en: string[];
    hi: string[];
  };
  regulatoryClauses: string[];
  compensationRule?: {
    en: string;
    hi: string;
  };
  sampleDraftTitle: string;
  safetyAlert?: {
    en: string;
    hi: string;
  };
}

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'unauthorized_trading',
    category: 'stocks_sebi',
    titleEn: 'Unauthorized Trading or Share Transfer from Demat',
    titleHi: 'डीमैट से अनधिकृत ट्रेडिंग या शेयरों का ट्रांसफर',
    shortDescEn: 'Trades executed in your brokerage account or shares transferred without your consent or OTP/order authorization.',
    shortDescHi: 'आपकी सहमति, आदेश या ओटीपी के बिना ब्रोकर खाते में शेयर खरीदे-बेचे गए या डीमैट से निकाले गए।',
    triggers: ['unauthorized trade', 'shares sold without permission', 'unauthorized buy', 'demat hack', 'broker traded without consent', 'bina bataye share bech diye', 'galat trade laga diya'],
    regulator: 'SEBI (Securities and Exchange Board of India)',
    firstStep: {
      en: 'Immediately send an email to the Broker’s Grievance Redressal Officer (GRO) and Compliance Officer disputing the trade. Demand call recording / log proof.',
      hi: 'तुरंत अपने ब्रोकर के शिकायत निवारण अधिकारी (GRO) और कम्प्लायंस अधिकारी को ईमेल भेजें और ट्रेड को चुनौती दें। कॉल रिकॉर्डिंग व वॉयस लॉग की मांग करें।',
      tatDays: 30
    },
    escalationStep: {
      portalName: 'SEBI SCORES 2.0 & SMART ODR',
      portalUrl: 'https://scores.sebi.gov.in',
      helpline: '1800 266 7575 / 1800 22 7575 (SEBI Toll Free)',
      en: 'If broker does not resolve within 21 days or rejects your claim, escalate to SEBI SCORES 2.0 portal or initiate SMART ODR conciliation.',
      hi: 'यदि ब्रोकर 21 दिनों में समाधान नहीं करता या शिकायत खारिज करता है, तो SEBI SCORES 2.0 पोर्टल पर शिकायत दर्ज करें या SMART ODR में सुलह शुरू करें।'
    },
    finalStep: {
      en: 'Apply for SMART ODR Arbitration under Exchange rules (NSE/BSE). In case of fraud, also lodge an online complaint at 1930 / cybercrime.gov.in.',
      hi: 'एक्सचेंज (NSE/BSE) के नियमों के तहत SMART ODR आर्बिट्रेशन के लिए आवेदन करें। धोखाधड़ी की स्थिति में 1930 या cybercrime.gov.in पर भी शिकायत करें।',
      mechanism: 'Smart ODR Arbitration / Investor Protection Fund (IPF)'
    },
    requiredDocuments: {
      en: [
        'Contract notes and SMS/Email transaction alerts of the disputed trade',
        'Ledger statement showing unauthorized balance deduction',
        'Written proof that you did not authorize the trade (e.g. absent from city, no voice order)',
        'Copy of initial email sent to broker with timestamp'
      ],
      hi: [
        'विवादित ट्रेड के कॉन्ट्रैक्ट नोट्स और एसएमएस/ईमेल अलर्ट',
        'लेज़र स्टेटमेंट जिसमें पैसे या शेयरों की अनधिकृत कटौती दिख रही हो',
        'लिखित प्रमाण कि आपने ट्रेड का आदेश नहीं दिया था',
        'ब्रोकर को भेजी गई पहली ईमेल और उसकी रसीद'
      ]
    },
    regulatoryClauses: [
      'SEBI Master Circular for Stock Brokers (Voice recording mandatory for order placement)',
      'SEBI SCORES 2.0 Timelines (Resolution within 21 calendar days)'
    ],
    compensationRule: {
      en: 'If broker fails to produce voice recording or authenticated digital token order log, the broker must reverse the unauthorized trade and restore your portfolio.',
      hi: 'यदि ब्रोकर वॉयस रिकॉर्डिंग या डिजिटल सहमति लॉग प्रस्तुत नहीं कर पाता, तो उसे अनधिकृत ट्रेड रद्द करके आपके शेयर/पैसे वापस करने होंगे।'
    },
    sampleDraftTitle: 'Complaint regarding Unauthorized Trades in Demat/Trading Account'
  },
  {
    id: 'uncredited_dividend',
    category: 'stocks_sebi',
    titleEn: 'Uncredited Dividend or Corporate Action (Bonus/Split)',
    titleHi: 'लाभांश (डिविडेंड) या बोनस शेयर खाते में न आना',
    shortDescEn: 'Company declared dividend or bonus shares, but amount not credited to your bank account or shares missing from Demat.',
    shortDescHi: 'कंपनी द्वारा घोषित लाभांश (डिविडेंड) बैंक खाते में नहीं आया या बोनस/स्प्लिट के शेयर डीमैट में नहीं दिखे।',
    triggers: ['dividend not credited', 'dividend nahi aaya', 'bonus shares missing', 'split shares not received', 'r&t agent issue', 'unclaimed dividend'],
    regulator: 'SEBI / MCA (IEPF)',
    firstStep: {
      en: 'Contact the Registrar and Transfer Agent (RTA - e.g. KFintech, Link Intime, Computer Age) and Company Secretary with your Demat Folio/DP ID.',
      hi: 'कंपनी के रजिस्ट्रार (RTA - जैसे KFintech, Link Intime) और कंपनी सेक्रेटरी को अपना DP ID और फोलियो नंबर देकर ईमेल करें।',
      tatDays: 15
    },
    escalationStep: {
      portalName: 'SEBI SCORES 2.0',
      portalUrl: 'https://scores.sebi.gov.in',
      helpline: '1800 266 7575',
      en: 'Lodge grievance on SEBI SCORES under category "Non-receipt of Dividend / Bonus shares".',
      hi: 'SEBI SCORES पर "लाभांश / बोनस शेयर न मिलने" की श्रेणी में शिकायत दर्ज करें।'
    },
    finalStep: {
      en: 'If dividend is older than 7 years, apply to IEPF Authority (Form IEPF-5) on iepf.gov.in for refund from Investor Education and Protection Fund.',
      hi: 'यदि डिविडेंड 7 साल से अधिक पुराना है, तो iepf.gov.in पर IEPF-5 फॉर्म भरकर दावा प्रस्तुत करें।',
      mechanism: 'IEPF Authority Claim / SEBI Adjudication'
    },
    requiredDocuments: {
      en: [
        'Demat Client Master List (CML) showing active holding on Record Date',
        'Bank statement showing no credit around payout date',
        'Copy of PAN and cancelled cheque'
      ],
      hi: [
        'रिकॉर्ड डेट पर शेयर होने का प्रमाण (डीमैट CML/होल्डिंग स्टेटमेंट)',
        'बैंक खाता विवरण (लाभांश भुगतान तिथि का बैंक स्टेटमेंट)',
        'पैन कार्ड और कैंसल्ड चेक की कॉपी'
      ]
    },
    regulatoryClauses: [
      'Companies Act 2013 Section 124 (Payment of Dividend within 30 days of declaration)',
      'SEBI (Listing Obligations and Disclosure Requirements) Regulations 2015'
    ],
    compensationRule: {
      en: 'If company fails to pay dividend within 30 days of declaration, it is liable to pay interest @ 18% per annum for the delayed period.',
      hi: 'घोषणा के 30 दिनों में लाभांश न मिलने पर कंपनी को 18% वार्षिक ब्याज के साथ भुगतान करना होता है।'
    },
    sampleDraftTitle: 'Grievance: Non-Receipt of Declared Dividend for Equity Shares'
  },
  {
    id: 'mutual_fund_delay',
    category: 'mutual_funds',
    titleEn: 'Mutual Fund Redemption Delayed or Incorrect NAV',
    titleHi: 'म्यूचुअल फंड रिडेम्पशन (पैसे निकासी) में देरी या गलत NAV',
    shortDescEn: 'Redemption request submitted on time, but money not credited to bank account within standard T+2 days or incorrect NAV allotted.',
    shortDescHi: 'म्यूचुअल फंड से पैसे निकालने का आवेदन किया, परंतु तय समय (T+2) में पैसे बैंक खाते में नहीं आए या गलत NAV लगाया गया।',
    triggers: ['mutual fund redemption delay', 'sip deduction money not credited', 'mf nav wrong', 'cams dispute', 'kfintech mf delay', 'mf paise nahi aaye'],
    regulator: 'SEBI / AMFI',
    firstStep: {
      en: 'Write to the Mutual Fund AMC Grievance Redressal Officer and CAMS/KFintech with your Folio Number and Transaction Reference.',
      hi: 'अपने फोलियो नंबर और ट्रांजैक्शन आईडी के साथ संबंधित AMC के शिकायत अधिकारी और CAMS/KFintech को लिखें।',
      tatDays: 21
    },
    escalationStep: {
      portalName: 'SEBI SCORES 2.0 & SMART ODR',
      portalUrl: 'https://scores.sebi.gov.in',
      helpline: '1800 266 7575',
      en: 'Escalate to SEBI SCORES under "Mutual Funds - Redemption / Repurchase" category.',
      hi: 'SEBI SCORES पोर्टल पर "म्यूचुअल फंड्स - रिडेम्पशन / रीपरचेज" श्रेणी में शिकायत दर्ज करें।'
    },
    finalStep: {
      en: 'Request penalty interest payment as mandated by SEBI guidelines for delayed redemption.',
      hi: 'SEBI दिशानिर्देशों के तहत देरी के लिए 15% प्रति वर्ष की दर से हर्जाना ब्याज की मांग करें।',
      mechanism: 'SEBI Enforcement & AMC Mandatory Penalty'
    },
    requiredDocuments: {
      en: [
        'Redemption confirmation SMS/Email with time stamp (cut-off proof)',
        'Account statement showing units debited',
        'Bank statement showing no credit'
      ],
      hi: [
        'रिडेम्पशन आवेदन का एसएमएस या ईमेल (समय की पुष्टि)',
        'म्यूचुअल फंड अकाउंट स्टेटमेंट (यूनिट कटने का प्रमाण)',
        'बैंक खाता स्टेटमेंट'
      ]
    },
    regulatoryClauses: [
      'SEBI Master Circular for Mutual Funds (Redemption proceeds within 2 working days for Equity/Debt)',
      'SEBI Regulation: AMC must pay 15% p.a. interest for delay beyond specified payout time'
    ],
    compensationRule: {
      en: 'The AMC is mandated by SEBI to pay interest @ 15% p.a. directly to the investor for every day of delay beyond T+2 working days.',
      hi: 'SEBI नियम के अनुसार T+2 दिनों के बाद हर दिन की देरी के लिए AMC को 15% सालाना ब्याज निवेशक को देना अनिवार्य है।'
    },
    sampleDraftTitle: 'Complaint for Delayed Mutual Fund Redemption and Interest Penalty Claim'
  },
  {
    id: 'bank_upi_failed_debit',
    category: 'banking_rbi',
    titleEn: 'UPI / ATM Failed Transaction: Account Debited but Merchant Not Paid',
    titleHi: 'UPI या ATM लेन-देन विफल: खाते से पैसे कटे पर पहुंचे नहीं',
    shortDescEn: 'Amount deducted from your bank account during UPI/ATM transaction, but cash not dispensed or merchant did not receive payment.',
    shortDescHi: 'UPI या एटीएम लेन-देन के दौरान बैंक खाते से पैसे कट गए, लेकिन कैश नहीं निकला या दुकानदार को पैसे नहीं पहुंचे।',
    triggers: ['upi failed', 'money debited upi', 'atm cash not received', 'auto reversal not happened', 'upi paise kat gaye', 'atm se paise nahi nikle'],
    regulator: 'RBI (Reserve Bank of India)',
    firstStep: {
      en: 'Raise a dispute on your UPI app (GPay/PhonePe/Paytm/BHIM) and register formal grievance with your home bank citing UTR / RRN number.',
      hi: 'अपने UPI ऐप पर विवाद दर्ज करें और UTR / RRN नंबर के साथ अपने बैंक में औपचारिक शिकायत दर्ज कराएं।',
      tatDays: 5
    },
    escalationStep: {
      portalName: 'RBI Complaint Management System (CMS)',
      portalUrl: 'https://cms.rbi.org.in',
      helpline: '14448 (RBI Centralized Helpline)',
      en: 'If bank does not reverse funds within T+5 days, file complaint with the RBI Banking Ombudsman on cms.rbi.org.in.',
      hi: 'यदि बैंक 5 कार्यदिवसों में पैसे वापस नहीं करता, तो RBI CMS (cms.rbi.org.in) पर बैंकिंग लोकपाल के पास शिकायत दर्ज करें।'
    },
    finalStep: {
      en: 'Claim mandatory ₹100 per day compensation under RBI Harmonization of TAT Circular.',
      hi: 'RBI सर्कुलर के अनुसार प्रति दिन ₹100 के अनिवार्य मुआवज़े का दावा करें।',
      mechanism: 'RBI Integrated Ombudsman Scheme 2021'
    },
    requiredDocuments: {
      en: [
        'UPI Transaction ID, UTR (Unique Transaction Reference) or ATM Transaction Slip',
        'Bank Passbook / Account statement highlighting the debit',
        'Screenshot of failed transaction status from payment app'
      ],
      hi: [
        'UPI ट्रांजेक्शन आईडी, UTR नंबर या एटीएम पर्ची',
        'बैंक पासबुक/स्टेटमेंट जिसमें पैसे कटने की एंट्री हो',
        'पेमेंट ऐप में फेल्ड ट्रांजेक्शन का स्क्रीनशॉट'
      ]
    },
    regulatoryClauses: [
      'RBI Harmonisation of Turn Around Time (TAT) and customer compensation for failed transactions (DPSS.CO.PD No.629/02.01.014/2019-20)',
      'RBI Integrated Ombudsman Scheme 2021'
    ],
    compensationRule: {
      en: 'Bank must reverse funds within T+5 calendar days. After T+5, bank must proactively credit ₹100 per day penalty to your account without needing a reminder.',
      hi: 'बैंक को 5 दिनों के भीतर पैसे लौटाने होंगे। 5 दिनों के बाद बैंक को बिना मांगे ₹100 प्रतिदिन हर्जाना आपके खाते में जमा करना होगा।'
    },
    sampleDraftTitle: 'Complaint to Bank Grievance Redressal / RBI CMS for Failed Electronic Transaction TAT Violation'
  },
  {
    id: 'cyber_fake_stock_scam',
    category: 'cyber_fraud',
    titleEn: 'Fake Stock Trading App / Telegram VIP Tips Scam / WhatsApp Institutional Account',
    titleHi: 'फर्जी ट्रेडिंग ऐप / टेलीग्राम टिप्स स्कैम / संस्थागत खाता धोखाधड़ी',
    shortDescEn: 'Lured into fake trading apps, fake IPO upper-circuit quotas, WhatsApp investment groups, or requested to deposit money into random individual bank accounts.',
    shortDescHi: 'व्हाट्सएप या टेलीग्राम ग्रुप में भारी मुनाफे, फर्जी संस्थागत (Institutional) ट्रेडिंग ऐप या फर्जी आईपीओ कोटा के नाम पर पैसे ठग लिए गए।',
    triggers: ['telegram stock tips', 'fake trading app', 'whatsapp stock scam', 'institutional account scam', 'upper circuit trick', 'crypto doubling', 'paise doob gaye scam', 'telegram group fraud'],
    regulator: 'National Cyber Crime Reporting Portal (MHA) & SEBI Enforcement',
    firstStep: {
      en: 'IMMEDIATELY dial 1930 (Golden Hour Helpline) to block/freeze money in the fraudster’s bank accounts, and preserve all chat screenshots & transaction UTRs.',
      hi: 'तुरंत 1930 (साइबर हेल्पलाइन) पर कॉल करें ताकि ठग के बैंक खाते में पैसे फ्रीज किए जा सकें। सभी चैट स्क्रीनशॉट और ट्रांजेक्शन UTR सुरक्षित रखें।',
      tatDays: 1
    },
    escalationStep: {
      portalName: 'National Cyber Crime Reporting Portal (1930)',
      portalUrl: 'https://cybercrime.gov.in',
      helpline: '1930 (24x7 Citizen Financial Cyber Fraud Helpline)',
      en: 'Register formal FIR/acknowledgement on cybercrime.gov.in under "Financial Fraud" with all beneficiary account details and IFSC codes.',
      hi: 'cybercrime.gov.in पर "वित्तीय धोखाधड़ी" के तहत एफआईआर दर्ज करें और सभी लाभार्थी बैंक खातों व IFSC की जानकारी दें।'
    },
    finalStep: {
      en: 'Submit cyber complaint copy to your own bank to request lien marking on recipient accounts, and report the fake entity to SEBI SCORES.',
      hi: 'अपने बैंक में साइबर शिकायत कॉपी देकर लेन-देन को रोकने का अनुरोध करें और SEBI में फर्जी ब्रोकर की सूचना दें।',
      mechanism: 'MHA Indian Cyber Crime Coordination Centre (I4C) & State Police Cyber Cell'
    },
    requiredDocuments: {
      en: [
        'Complete WhatsApp/Telegram chat exports showing promises of guaranteed returns',
        'Bank transfer receipts showing beneficiary account numbers and UTRs',
        'Website/App APK download link or screenshots',
        '1930 Cyber complaint acknowledgement number'
      ],
      hi: [
        'व्हाट्सएप/टेलीग्राम चैट के स्क्रीनशॉट जहाँ गारंटीड मुनाफे का झांसा दिया गया',
        'बैंक ट्रांसफर रसीदें (UTR नंबर और ठग का बैंक खाता नंबर)',
        'फर्जी ऐप या वेबसाइट का लिंक/स्क्रीनशॉट',
        '1930 पर दर्ज शिकायत की पावती संख्या'
      ]
    },
    regulatoryClauses: [
      'Information Technology Act 2000 (Section 66D - Cheating by impersonation using computer resource)',
      'Banning of Unregulated Deposit Schemes (BUDS) Act, 2019',
      'SEBI Prohibition of Fraudulent and Unfair Trade Practices (PFUTP) Regulations'
    ],
    safetyAlert: {
      en: 'CRITICAL: Legitimate SEBI registered brokers NEVER ask you to deposit trading funds into personal individual savings accounts. Real trading money is deposited only into recognized clearing corporation accounts.',
      hi: 'सावधान: कोई भी सेबी-पंजीकृत ब्रोकर कभी भी किसी व्यक्ति के निजी बैंक खाते में पैसे ट्रांसफर करने को नहीं कहता। ब्रोकर केवल आधिकारिक क्लियरिंग खाते में पैसे लेता है।'
    },
    sampleDraftTitle: 'Urgent Cyber Crime & Financial Fraud Complaint against Illegal Trading Syndicate'
  },
  {
    id: 'insurance_misselling',
    category: 'insurance_irdai',
    titleEn: 'Insurance Misselling by Bank / False Return Guarantee',
    titleHi: 'बैंक द्वारा बीमा पॉलिसी का झांसा (मिससेलिंग) या गलत रिटर्न का वादा',
    shortDescEn: 'Bank or agent sold a regular premium ULIP/Traditional policy disguised as "Fixed Deposit", "one-time payment", or tied to loan approval.',
    shortDescHi: 'बैंक या एजेंट ने "फिक्सड डिपॉजिट", "एकमुश्त भुगतान" या लोन मंजूरी के नाम पर धोखे से नियमित प्रीमियम वाली जीवन बीमा पॉलिसी बेच दी।',
    triggers: ['insurance misselling', 'bank sold policy instead of fd', 'ulip fraud', 'wrong policy sold', 'free look cancellation', 'bima me dhokhadhadhi', 'fd bolkar policy di'],
    regulator: 'IRDAI (Insurance Regulatory and Development Authority of India)',
    firstStep: {
      en: 'Invoke Free-Look Period cancellation within 30 days of receiving the policy document (or 15 days if offline) demanding full premium refund.',
      hi: 'पॉलिसी दस्तावेज मिलने के 30 दिनों (या ऑफलाइन में 15 दिनों) के भीतर "फ्री-लुक कैंसिलेशन" का प्रयोग करें और पूरा पैसा वापस मांगें।',
      tatDays: 15
    },
    escalationStep: {
      portalName: 'IRDAI Bima Bharosa Portal',
      portalUrl: 'https://bimabharosa.irdai.gov.in',
      helpline: '155255 / 1800 4254 732 (IRDAI Grievance Call Centre)',
      en: 'Register complaint against the insurance company and corporate agent bank on Bima Bharosa portal for fraudulent misselling.',
      hi: 'धोखाधड़ी और गलत पॉलिसी बेचने के खिलाफ IRDAI के बीमा भरोसा पोर्टल पर बीमा कंपनी व बैंक के खिलाफ शिकायत दर्ज करें।'
    },
    finalStep: {
      en: 'Approach the Insurance Ombudsman for your state jurisdiction. The Ombudsman award is binding on the insurance company.',
      hi: 'अपने राज्य के बीमा लोकपाल (Insurance Ombudsman) के समक्ष शिकायत प्रस्तुत करें। लोकपाल का फैसला बीमा कंपनी के लिए बाध्यकारी होता है।',
      mechanism: 'Insurance Ombudsman Rule 2017'
    },
    requiredDocuments: {
      en: [
        'Policy bond copy and welcome email/dispatch proof with date of receipt',
        'Written proof/audio/WhatsApp messages of agent claiming it was an FD or single pay',
        'Free-look cancellation request submission receipt with date stamp',
        'Original bank account debit proof'
      ],
      hi: [
        'पॉलिसी बॉन्ड की प्रति और पॉलिसी मिलने की तारीख का प्रमाण',
        'एजेंट द्वारा किए गए झूठे वादों के सबूत (व्हाट्सएप चैट या ईमेल)',
        'फ्री-लुक रद्दीकरण आवेदन की पावती/रसीद',
        'बैंक खाते से प्रीमियम कटने का प्रमाण'
      ]
    },
    regulatoryClauses: [
      'IRDAI (Protection of Policyholders’ Interests) Regulations, 2017 (Free-look provisions)',
      'IRDAI Guidelines on Corporate Governance and Code of Conduct for Insurance Intermediaries'
    ],
    compensationRule: {
      en: 'Under Free-Look provision, insurer must refund premium deducted minus only proportionate risk premium and medical/stamp charges.',
      hi: 'फ्री-लुक नियम के तहत बीमा कंपनी को केवल जोखिम और स्टांप शुल्क काटकर शेष पूरी प्रीमियम राशि वापस करनी होगी।'
    },
    sampleDraftTitle: 'Grievance for Misselling of Insurance Policy and Demand for Full Refund under Free-Look Provisions'
  }
];

export const REGULATORY_HELPLINES = [
  {
    authority: 'SEBI (Securities Market)',
    phone: '1800 266 7575 / 1800 22 7575',
    timing: '9:00 AM to 6:00 PM (Mon-Fri) in 14 Indian languages',
    portal: 'https://scores.sebi.gov.in',
    badge: 'Stock, Demat, Mutual Funds'
  },
  {
    authority: 'Cyber Crime Helpline (MHA)',
    phone: '1930',
    timing: '24x7 Immediate Golden Hour Assistance',
    portal: 'https://cybercrime.gov.in',
    badge: 'Financial Cyber Fraud, Fake Apps'
  },
  {
    authority: 'RBI CMS (Banking Ombudsman)',
    phone: '14448',
    timing: '9:30 AM to 5:15 PM (Mon-Fri)',
    portal: 'https://cms.rbi.org.in',
    badge: 'Bank, UPI, Cards, Loans'
  },
  {
    authority: 'IRDAI Bima Bharosa',
    phone: '155255 / 1800 4254 732',
    timing: '8:00 AM to 8:00 PM (Mon-Sat)',
    portal: 'https://bimabharosa.irdai.gov.in',
    badge: 'Life, Health, Motor Insurance'
  },
  {
    authority: 'SMART ODR (Market Dispute)',
    phone: 'Online Conciliation & Arbitration',
    timing: '24x7 Digital Filing',
    portal: 'https://smartodr.in',
    badge: 'NSE, BSE, MCX, NSDL, CDSL'
  }
];
