/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Scale,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  PhoneCall,
  Lock,
  Sparkles,
  Clock,
  Building2,
  RefreshCw,
  Search,
  BookOpen,
  Send,
  Eye,
  Zap,
  Globe,
  Image as ImageIcon,
  FileCheck,
  Calendar,
  Hash,
  IndianRupee,
  UploadCloud,
  X,
  FolderOpen,
  PlusCircle,
  Trash2,
  Award,
  HelpCircle,
  CheckSquare,
  AlertOctagon,
  ChevronRight,
  Compass,
  Link as LinkIcon,
  MessageSquare,
  BookMarked,
  Layers,
  ArrowUpRight,
  Lightbulb
} from 'lucide-react';
import { KNOWLEDGE_BASE, REGULATORY_HELPLINES, KnowledgeItem } from './data/knowledgeBase';
import { TRANSLATIONS, SAMPLE_QUERIES, SUPPORTED_LANGUAGES, Language } from './data/translations';
import { LEARNING_MODULES, LearningModule } from './data/learningModules';
import { analyzeScamText, ScamAnalysisResult } from './data/scamRules';
import { FINANCIAL_GLOSSARY, GlossaryTerm } from './data/glossary';

interface ExtractedReceiptData {
  hasReceipt: boolean;
  transactionId: string | null;
  transactionDate: string | null;
  disputedAmount: string | null;
  entityName: string | null;
  keyObservations: string | null;
  missingEvidence?: string[];
}

interface SafetyAssessment {
  indicator: 'LOW_CONCERN' | 'NEEDS_VERIFICATION' | 'SUSPICIOUS' | 'HIGH_RISK';
  badge: string;
  score: number;
  risks: string[];
  isStockTipInquiry: boolean;
  hasCredentialWarning: boolean;
}

interface AnalysisResult {
  safetyAssessment?: SafetyAssessment;
  isStockTipInquiry: boolean;
  hasCredentialWarning: boolean;
  intent: string;
  knowledgeItem: KnowledgeItem | null;
  explanation: string;
  complaintDraft: string | null;
  message?: string;
  extractedReceiptData?: ExtractedReceiptData | null;
  missingEvidence?: string[];
  whyAmISeeingThisAnswer?: string;
  officialSourceCitations?: Array<{ title: string; regulator: string; url: string; clause: string }>;
}

interface TrackedCase {
  id: string;
  title: string;
  entity: string;
  refNumber: string;
  dateFiled: string;
  followUpDate: string;
  tatDays: number;
  status: 'GRO_FILED' | 'REGULATOR_ESCALATED' | 'ODR_ARBITRATION' | 'RESOLVED';
  notes: string;
}

export default function App() {
  const [lang, setLang] = useState<Language>('hi');
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(false);
  const [explainLikeImNew, setExplainLikeImNew] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'grievance' | 'navigator' | 'builder' | 'scamChecker' | 'glossary' | 'caseTracker' | 'learning' | 'helplines'>('grievance');

  // Grievance Desk State
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [editableDraft, setEditableDraft] = useState<string>('');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [caseSavedBanner, setCaseSavedBanner] = useState<boolean>(false);
  const [showWhyAnswer, setShowWhyAnswer] = useState<boolean>(false);

  // Attached Image state
  const [attachedImage, setAttachedImage] = useState<{
    base64: string;
    mimeType: string;
    name: string;
    sizeKb: number;
  } | null>(null);

  // 🧭 Smart Grievance Navigator State
  const [navCategory, setNavCategory] = useState<string>('stocks');
  const [navAlreadyComplained, setNavAlreadyComplained] = useState<'no' | 'yes_less_30' | 'yes_more_30'>('no');
  const [navHasEvidence, setNavHasEvidence] = useState<boolean>(true);

  // 📝 6-Step Structured Complaint Builder State
  const [builderStep, setBuilderStep] = useState<number>(1);
  const [builderData, setBuilderData] = useState({
    whatHappened: '',
    whenDate: new Date().toISOString().slice(0, 10),
    entityName: '',
    alreadyContacted: 'yes',
    evidenceHeld: 'Bank statement & email receipt',
    requestedRelief: 'Immediate refund/reversal with statutory delay interest'
  });

  // 🚨 Scam & Link Checker State
  const [scamInput, setScamInput] = useState<string>('');
  const [scamResult, setScamResult] = useState<ScamAnalysisResult | null>(null);
  const [linkInput, setLinkInput] = useState<string>('');
  const [linkAnalysis, setLinkAnalysis] = useState<{ isRisky: boolean; message: string; safeSteps: string[] } | null>(null);

  // 📚 Financial Jargon Translator Search
  const [glossarySearch, setGlossarySearch] = useState<string>('');

  // 📂 Local Case Tracker State
  const [cases, setCases] = useState<TrackedCase[]>(() => {
    try {
      const saved = localStorage.getItem('nivesh_saathi_cases');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved cases:', e);
    }
    return [
      {
        id: 'case-demo-1',
        title: 'Delayed Mutual Fund Payout',
        entity: 'Axis Mutual Fund / CAMS',
        refNumber: 'TXN-8839219',
        dateFiled: '28 Sep 2026',
        followUpDate: '12 Oct 2026',
        tatDays: 21,
        status: 'GRO_FILED',
        notes: 'Submitted formal redemption delay grievance with 15% statutory interest claim.'
      }
    ];
  });

  // Learning Module Quiz State
  const [activeLesson, setActiveLesson] = useState<LearningModule>(LEARNING_MODULES[0]);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const recognitionRef = useRef<any>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nivesh_saathi_cases', JSON.stringify(cases));
    } catch (e) {
      console.warn('Could not save cases to localStorage:', e);
    }
  }, [cases]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-IN' : lang === 'ta' ? 'ta-IN' : lang === 'te' ? 'te-IN' : lang === 'mr' ? 'mr-IN' : lang === 'gu' ? 'gu-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lang]);

  // Image Selection Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'hi' ? 'कृपया केवल छवि (JPG, PNG, WebP) फ़ाइल चुनें।' : 'Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert(lang === 'hi' ? 'फ़ाइल का आकार 8MB से कम होना चाहिए।' : 'File size must be under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64String = uploadEvent.target?.result as string;
      setAttachedImage({
        base64: base64String,
        mimeType: file.type,
        name: file.name,
        sizeKb: Math.round(file.size / 1024)
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Voice Speech toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(lang === 'hi' ? 'आपके ब्राउज़र में वॉयस इनपुट समर्थित नहीं है।' : 'Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  // Text-To-Speech Reader
  const handleReadAloud = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*_`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = seniorMode ? 0.85 : 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Analyze Grievance Query
  const handleAnalyze = async (customQuery?: string) => {
    const textToSubmit = customQuery !== undefined ? customQuery : query;
    if (!textToSubmit.trim() && !attachedImage) return;

    setLoading(true);
    setActiveStep(2);
    setCopied(false);
    setCaseSavedBanner(false);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    try {
      setTimeout(() => setActiveStep(3), 300);
      setTimeout(() => setActiveStep(4), 600);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSubmit,
          language: lang,
          explainLikeImNew,
          imageBase64: attachedImage?.base64,
          imageMimeType: attachedImage?.mimeType
        })
      });

      const data: AnalysisResult = await response.json();
      setResult(data);
      if (data.complaintDraft) {
        setEditableDraft(data.complaintDraft);
      }
      setActiveStep(8);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDraft = () => {
    if (!editableDraft) return;
    navigator.clipboard.writeText(editableDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadDraft = () => {
    if (!editableDraft) return;
    const blob = new Blob([editableDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NiveshSaathi_Grievance_Draft_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintDraft = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>NiveshSaathi Formal Grievance</title>
            <style>
              body { font-family: sans-serif; padding: 40px; line-height: 1.6; font-size: 13pt; }
              pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; }
            </style>
          </head>
          <body>
            <pre>${editableDraft}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSaveToCaseTracker = () => {
    if (!result || !result.knowledgeItem) return;

    const followUp = new Date();
    followUp.setDate(followUp.getDate() + (result.knowledgeItem.firstStep.tatDays || 21));

    const newCase: TrackedCase = {
      id: 'case-' + Date.now(),
      title: lang === 'hi' ? result.knowledgeItem.titleHi : result.knowledgeItem.titleEn,
      entity: result.extractedReceiptData?.entityName || result.knowledgeItem.regulator,
      refNumber: result.extractedReceiptData?.transactionId || 'PENDING-FILING',
      dateFiled: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      followUpDate: followUp.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      tatDays: result.knowledgeItem.firstStep.tatDays,
      status: 'GRO_FILED',
      notes: `Resolution expected in ${result.knowledgeItem.firstStep.tatDays} days. Escalate to ${result.knowledgeItem.escalationStep.portalName} if unresolved.`
    };

    setCases(prev => [newCase, ...prev]);
    setCaseSavedBanner(true);
    setTimeout(() => setCaseSavedBanner(false), 4000);
  };

  const toggleDoc = (doc: string) => {
    setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  const handleRunScamCheck = () => {
    if (!scamInput.trim()) return;
    const res = analyzeScamText(scamInput);
    setScamResult(res);
  };

  const handleCheckLink = () => {
    if (!linkInput.trim()) return;
    const url = linkInput.toLowerCase();
    const isRisky = /(bit\.ly|tinyurl|t\.me|wa\.me|cutt\.ly|\.apk|download|secure-login|kyc-update|bank-portal)/i.test(url) || !url.startsWith('https://');

    setLinkAnalysis({
      isRisky,
      message: isRisky
        ? 'This link has indicators that warrant verification. Unofficial shorteners, missing HTTPS, or APK downloads are frequently leveraged by fraudsters.'
        : 'This link uses a standard web format. However, always independently verify that the domain matches the financial institution’s official registered website.',
      safeSteps: [
        'Do not click directly or enter banking credentials/PAN.',
        'Search the institution by name directly on Google or visit the official SEBI/RBI portal to find their verified root domain.',
        'Official Indian regulatory sites end in .gov.in (e.g. scores.sebi.gov.in, cms.rbi.org.in).'
      ]
    });
  };

  const handleGenerateFromBuilder = () => {
    const text = `Incident Details: ${builderData.whatHappened}. Happened on date: ${builderData.whenDate}. Entity involved: ${builderData.entityName}. Already contacted entity: ${builderData.alreadyContacted}. Evidence held: ${builderData.evidenceHeld}. Requested resolution: ${builderData.requestedRelief}.`;
    setQuery(text);
    setActiveTab('grievance');
    handleAnalyze(text);
  };

  const filteredGlossary = FINANCIAL_GLOSSARY.filter(g =>
    g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    g.hindiTerm.includes(glossarySearch) ||
    g.plainEnglish.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${seniorMode ? 'text-lg md:text-xl' : 'text-base'} ${lowBandwidthMode ? 'bg-white' : 'bg-stone-50'}`}>
      {/* Top Banner: Regional & Accessibility Controls */}
      <div className="bg-emerald-950 text-emerald-100 text-xs md:text-sm px-4 py-2 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">
              {lang === 'hi' ? 'राष्ट्रीय निवेशक सुरक्षा एवं शिकायत डेस्क' : 'National Investor Protection & Grievance Portal'}
            </span>
            <span className="hidden sm:inline text-emerald-500">|</span>
            <span className="hidden sm:inline text-xs text-emerald-300">SEBI SCORES 2.0 • SMART ODR • RBI CMS • 1930 Cyber Fraud</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Explain Like I'm New Toggle */}
            <button
              onClick={() => setExplainLikeImNew(!explainLikeImNew)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                explainLikeImNew ? 'bg-purple-400 text-purple-950 ring-2 ring-purple-300' : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-200'
              }`}
              title="Explain Like I'm New to Investing (Zero Jargon)"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Explain Like I'm New</span>
              <span className="sm:hidden">ELINI</span>
            </button>

            {/* Senior Mode Toggle */}
            <button
              onClick={() => setSeniorMode(!seniorMode)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                seniorMode ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300' : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-200'
              }`}
              title="Toggle Large Fonts for Elderly Citizens"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.seniorMode}</span>
            </button>

            {/* Bharat Mode Toggle */}
            <button
              onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                lowBandwidthMode ? 'bg-blue-400 text-blue-950 ring-2 ring-blue-300' : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-200'
              }`}
              title="Toggle Low Bandwidth Mode"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t.lowBandwidthMode}</span>
            </button>

            {/* Regional Language Selector */}
            <div className="flex items-center gap-1 bg-emerald-900 px-2 py-0.5 rounded border border-emerald-800">
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <select
                value={lang}
                onChange={e => setLang(e.target.value as Language)}
                aria-label="Select Language"
                className="bg-transparent text-xs font-bold text-emerald-200 focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map(sl => (
                  <option key={sl.code} value={sl.code} className="bg-emerald-950 text-white">
                    {sl.nativeName} ({sl.label})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Header with Tabbed Navigation */}
      <header className="bg-white border-b border-stone-200 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-600/20 font-serif font-black text-2xl border-2 border-amber-300 shrink-0">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight text-xl sm:text-2xl text-stone-900">
                  {t.appName}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  {t.sourceConfidenceBadge}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium line-clamp-1">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('grievance')}
              className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'grievance'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t.tabGrievance}</span>
            </button>

            <button
              onClick={() => setActiveTab('navigator')}
              className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'navigator'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Grievance Navigator</span>
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'builder'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Complaint Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('scamChecker')}
              className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'scamChecker'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>{t.tabScamChecker}</span>
            </button>

            <button
              onClick={() => setActiveTab('glossary')}
              className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'glossary'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <BookMarked className="w-4 h-4 text-purple-600" />
              <span>Jargon Buster</span>
            </button>

            <button
              onClick={() => setActiveTab('caseTracker')}
              className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all relative ${
                activeTab === 'caseTracker'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>{t.tabCaseTracker}</span>
              {cases.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {cases.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('learning')}
              className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'learning'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>{t.tabLearning}</span>
            </button>

            <button
              onClick={() => setActiveTab('helplines')}
              className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === 'helplines'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>{t.tabHelplines}</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        {/* Elder Mode 5 Big Touch Cards (when Senior Mode is ON) */}
        {seniorMode && (
          <div className="bg-amber-100/70 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <span>👴 वरिष्ठ नागरिक त्वरित सहायता (Elder Mode Quick Actions)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <button
                onClick={() => {
                  setActiveTab('grievance');
                  toggleListening();
                }}
                className="p-4 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-300 font-extrabold text-stone-900 text-base sm:text-lg flex flex-col items-center justify-center gap-2 shadow-xs"
              >
                <span className="text-3xl">🎙️</span>
                <span>बोलकर पूछें</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('grievance');
                  fileInputRef.current?.click();
                }}
                className="p-4 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-300 font-extrabold text-stone-900 text-base sm:text-lg flex flex-col items-center justify-center gap-2 shadow-xs"
              >
                <span className="text-3xl">📄</span>
                <span>मेरा पत्र समझाएं</span>
              </button>

              <button
                onClick={() => setActiveTab('scamChecker')}
                className="p-4 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-300 font-extrabold text-stone-900 text-base sm:text-lg flex flex-col items-center justify-center gap-2 shadow-xs"
              >
                <span className="text-3xl">🚨</span>
                <span>यह संदेश सुरक्षित है?</span>
              </button>

              <button
                onClick={() => setActiveTab('navigator')}
                className="p-4 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-300 font-extrabold text-stone-900 text-base sm:text-lg flex flex-col items-center justify-center gap-2 shadow-xs"
              >
                <span className="text-3xl">🧭</span>
                <span>शिकायत कहाँ करें?</span>
              </button>

              <button
                onClick={() => setActiveTab('builder')}
                className="p-4 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-300 font-extrabold text-stone-900 text-base sm:text-lg flex flex-col items-center justify-center gap-2 shadow-xs"
              >
                <span className="text-3xl">📝</span>
                <span>शिकायत लिखें</span>
              </button>
            </div>
          </div>
        )}

        {/* Safety & Anti-Slop Banner */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-800 shrink-0">
            <Lock className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-bold text-amber-950">{t.safetyBannerTitle}: </span>
            <span className="text-amber-900">{t.safetyBannerDesc}</span>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-amber-800/80 font-medium text-[11px]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t.privacyBadge}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero Commercial Stock Tips
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Grounded in Verified SEBI/RBI Acts
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: GRIEVANCE DESK (Core Redressal & Evidence Assistant) */}
        {/* ========================================================= */}
        {activeTab === 'grievance' && (
          <div className="space-y-6">
            {/* Input Card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="investor-query" className="font-bold text-stone-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <span>{lang === 'hi' ? 'अपनी वित्तीय समस्या बताएं या रसीद/दस्तावेज संलग्न करें' : 'Describe Problem or Attach Notice / Receipt Image'}</span>
                </label>
                <div className="text-xs text-stone-500 font-medium">
                  {explainLikeImNew ? '💡 ELINI Mode Active (Zero Jargon)' : 'Hindi, English & Regional'}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  id="investor-query"
                  rows={seniorMode ? 5 : 4}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t.queryPlaceholder}
                  className={`w-full p-4 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-100 transition-all outline-none resize-none leading-relaxed ${
                    seniorMode ? 'text-lg' : 'text-base'
                  } bg-stone-50/50`}
                />

                {/* Voice Input Button */}
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                    }`}
                    title="Speak Query in Your Language"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-stone-700" />}
                    <span>{isListening ? t.listening : t.voiceButton}</span>
                  </button>
                </div>
              </div>

              {/* File Attachment Area (🔥 6 Evidence Assistant) */}
              <div className="mt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {!attachedImage ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span>{t.ocrNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-amber-50 text-stone-800 border border-stone-300 flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <UploadCloud className="w-4 h-4 text-amber-600" />
                      <span>{t.attachReceipt}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={attachedImage.base64}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-amber-400 shadow-2xs"
                      />
                      <div>
                        <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{t.receiptAttached}</span>
                          <span className="text-[10px] text-stone-500">({attachedImage.sizeKb} KB)</span>
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium">
                          {lang === 'hi' ? 'AI स्वतः तारीख, राशि व UTR निकालकर शिकायत पत्र में भर देगा' : 'AI will OCR dates, amounts, and transaction IDs to pre-fill the complaint draft.'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-stone-300 transition-all"
                      title={t.removeImage}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'hi' ? 'बिना पासवर्ड/ओटीपी सुरक्षित जांच' : 'Zero logs of credentials / PII'}</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {(query || attachedImage) && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        handleRemoveImage();
                        setResult(null);
                        setActiveStep(1);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 font-semibold text-xs sm:text-sm transition-all"
                    >
                      {lang === 'hi' ? 'साफ़ करें' : 'Clear'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAnalyze()}
                    disabled={loading || (!query.trim() && !attachedImage)}
                    className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                      loading || (!query.trim() && !attachedImage)
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20 active:scale-[0.98]'
                    }`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>{lang === 'hi' ? 'नियामक जांच व शिकायत पत्र तैयार हो रहा है...' : 'Retrieving Regulations & Generating Draft...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t.analyzeButton}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sample Queries Carousel */}
              <div className="mt-5 pt-4 border-t border-stone-200">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
                  {t.sampleQuestionsTitle}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {SAMPLE_QUERIES.map((sq, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const text = lang === 'hi' ? sq.queryHi : sq.queryEn;
                        setQuery(text);
                        handleAnalyze(text);
                      }}
                      className="p-3 text-left rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all group bg-white shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-stone-900 group-hover:text-amber-800 mb-1">
                        <span>{lang === 'hi' ? sq.titleHi : sq.titleEn}</span>
                        <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                          {sq.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {lang === 'hi' ? sq.queryHi : sq.queryEn}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div ref={resultsRef} className="space-y-6">
                {/* AI Safety Indicator Badge */}
                {result.safetyAssessment && (
                  <div className="p-3 rounded-xl bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border">
                        Safety Awareness Indicator: {result.safetyAssessment.badge}
                      </span>
                      <span className="text-xs text-stone-500">
                        (Risk & Safety Awareness assessment, not a legal verdict)
                      </span>
                    </div>

                    <button
                      onClick={() => setShowWhyAnswer(!showWhyAnswer)}
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Why am I seeing this answer?</span>
                    </button>
                  </div>
                )}

                {/* "Why am I seeing this answer?" Accordion */}
                {showWhyAnswer && result.whyAmISeeingThisAnswer && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-xs sm:text-sm text-emerald-950 space-y-2">
                    <div className="font-bold flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-700" />
                      <span>Official Regulatory Grounding:</span>
                    </div>
                    <p className="leading-relaxed">{result.whyAmISeeingThisAnswer}</p>
                    {result.officialSourceCitations && result.officialSourceCitations.length > 0 && (
                      <div className="pt-2 border-t border-emerald-200">
                        <span className="font-semibold block mb-1">Official Reference:</span>
                        {result.officialSourceCitations.map((c, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 bg-white/80 p-2 rounded border border-emerald-200">
                            <div>
                              <div className="font-bold text-stone-900">{c.title}</div>
                              <div className="text-[11px] text-stone-600">{c.clause} ({c.regulator})</div>
                            </div>
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Tip / Price Prediction Guardrail Rejection Card */}
                {result.isStockTipInquiry && (
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-rose-900 text-lg">
                          {result.intent}
                        </h3>
                        <p className="mt-2 text-sm sm:text-base text-rose-800 leading-relaxed font-medium">
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legitimate Grievance Pathway & Advice */}
                {!result.isStockTipInquiry && result.knowledgeItem && (
                  <>
                    {/* Header Summary Card */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {result.knowledgeItem.regulator}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              TAT: {result.knowledgeItem.firstStep.tatDays} {lang === 'hi' ? 'दिन' : 'Days'}
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
                            {lang === 'hi' ? result.knowledgeItem.titleHi : result.knowledgeItem.titleEn}
                          </h2>
                        </div>

                        {/* Top Utility Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReadAloud(result.explanation)}
                            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                              isPlayingAudio
                                ? 'bg-rose-600 text-white'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                            }`}
                          >
                            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
                            <span>{isPlayingAudio ? t.stopAudio : t.readAloud}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleSaveToCaseTracker}
                            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <FolderOpen className="w-4 h-4 text-blue-600" />
                            <span>{lang === 'hi' ? 'केस ट्रैक करें' : 'Track Case'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Explanation Content */}
                      <div className="mt-5 prose prose-stone max-w-none">
                        <div
                          className={`space-y-3 leading-relaxed ${seniorMode ? 'text-lg' : 'text-base'} text-stone-800 whitespace-pre-line`}
                        >
                          {result.explanation}
                        </div>
                      </div>
                    </div>

                    {/* Missing Evidence Warning Alert (🔥 6 Evidence Assistant) */}
                    {result.missingEvidence && result.missingEvidence.length > 0 && (
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div className="text-xs sm:text-sm text-amber-950">
                          <span className="font-bold">⚠️ साक्ष्य सहायक सूचना (Missing Evidence Checklist): </span>
                          <span>मजबूत शिकायत के लिए आपको यह दस्तावेज भी साथ रखने की सलाह दी जाती है:</span>
                          <ul className="list-disc list-inside mt-1.5 font-medium text-amber-900 space-y-0.5">
                            {result.missingEvidence.map((m, idx) => (
                              <li key={idx}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* 3-Step Escalation Hierarchy Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Step 1: Entity */}
                      <div className="bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              {lang === 'hi' ? 'चरण 1: संस्थान स्तर' : 'Step 1: Entity GRO'}
                            </span>
                            <Clock className="w-4 h-4 text-stone-400" />
                          </div>
                          <h3 className="font-bold text-stone-900 text-base mb-2">
                            {lang === 'hi' ? 'ब्रोकर / बैंक / एएमसी शिकायत अधिकारी' : 'Grievance Redressal Officer (GRO)'}
                          </h3>
                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                            {lang === 'hi' ? result.knowledgeItem.firstStep.hi : result.knowledgeItem.firstStep.en}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-stone-100 text-xs font-semibold text-emerald-700">
                          ⏳ {t.tatTime}: {result.knowledgeItem.firstStep.tatDays} {lang === 'hi' ? 'दिन' : 'Days'}
                        </div>
                      </div>

                      {/* Step 2: Regulatory Portal */}
                      <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              {lang === 'hi' ? 'चरण 2: नियामक पोर्टल' : 'Step 2: Regulatory Portal'}
                            </span>
                            <Building2 className="w-4 h-4 text-emerald-700" />
                          </div>
                          <h3 className="font-bold text-emerald-950 text-base mb-2">
                            {result.knowledgeItem.escalationStep.portalName}
                          </h3>
                          <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                            {lang === 'hi' ? result.knowledgeItem.escalationStep.hi : result.knowledgeItem.escalationStep.en}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-emerald-200">
                          <a
                            href={result.knowledgeItem.escalationStep.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                          >
                            <span>{t.officialPortal}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <div className="text-[11px] text-emerald-800 font-medium mt-1">
                            📞 {result.knowledgeItem.escalationStep.helpline}
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Legal / Dispute / Cyber */}
                      <div className="bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                              {lang === 'hi' ? 'चरण 3: अंतिम निवारण' : 'Step 3: Dispute Resolution'}
                            </span>
                            <Scale className="w-4 h-4 text-stone-500" />
                          </div>
                          <h3 className="font-bold text-stone-900 text-base mb-2">
                            {result.knowledgeItem.finalStep.mechanism}
                          </h3>
                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                            {lang === 'hi' ? result.knowledgeItem.finalStep.hi : result.knowledgeItem.finalStep.en}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500 font-semibold">
                          🛡️ {lang === 'hi' ? 'बाध्यकारी कानूनी आदेश' : 'Legally Binding Outcome'}
                        </div>
                      </div>
                    </div>

                    {/* Pre-Filled Structured Complaint Draft */}
                    {editableDraft && (
                      <div className="bg-white border-2 border-amber-300 rounded-2xl p-5 sm:p-6 shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div>
                            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded">
                              {lang === 'hi' ? 'कानूनी रूप से मान्य शिकायत पत्र' : 'Regulatory Structured Complaint'}
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
                              {t.draftComplaint}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCopyDraft}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                                copied
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                              }`}
                            >
                              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copied ? t.copied : t.copyDraft}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleDownloadDraft}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 flex items-center gap-1.5 transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t.downloadDraft}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handlePrintDraft}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 flex items-center gap-1.5 transition-all"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t.printDraft}</span>
                            </button>
                          </div>
                        </div>

                        {/* Editable Draft Textarea */}
                        <div className="relative">
                          <textarea
                            rows={16}
                            value={editableDraft}
                            onChange={e => setEditableDraft(e.target.value)}
                            className={`w-full p-4 font-mono ${
                              seniorMode ? 'text-base' : 'text-xs sm:text-sm'
                            } bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 leading-relaxed outline-none`}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: 🧭 SMART GRIEVANCE NAVIGATOR (Diagnostic Flow) */}
        {/* ========================================================= */}
        {activeTab === 'navigator' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5 border-b border-stone-200 pb-4">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Compass className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Smart Grievance Navigator (शिकायत दिशा-निर्देशक)
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500">
                    Step-by-step diagnostic to determine exact escalation eligibility, mandatory turnaround time, and next actions.
                  </p>
                </div>
              </div>

              {/* Diagnostic Stepper */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Question 1: Category */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Step 1: Category</span>
                  <label className="block text-sm font-bold text-stone-900">Which entity is your dispute with?</label>
                  <select
                    value={navCategory}
                    onChange={e => setNavCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs font-semibold bg-white"
                  >
                    <option value="stocks">Stock Broker / Demat (SEBI)</option>
                    <option value="mf">Mutual Fund AMC / Registrar (SEBI)</option>
                    <option value="banking">Bank / UPI / ATM (RBI)</option>
                    <option value="insurance">Insurance Policy / Bank RM (IRDAI)</option>
                    <option value="cyber">Telegram Scam / Fake App / Cyber Fraud</option>
                  </select>
                </div>

                {/* Question 2: Prior complaint status */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Step 2: Prior Grievance</span>
                  <label className="block text-sm font-bold text-stone-900">Have you complained to the entity's GRO?</label>
                  <select
                    value={navAlreadyComplained}
                    onChange={e => setNavAlreadyComplained(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs font-semibold bg-white"
                  >
                    <option value="no">No, I haven't contacted their GRO yet</option>
                    <option value="yes_less_30">Yes, but less than 30 days elapsed</option>
                    <option value="yes_more_30">Yes, over 30 days or rejected</option>
                  </select>
                </div>

                {/* Question 3: Evidence check */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Step 3: Evidence Held</span>
                  <label className="block text-sm font-bold text-stone-900">Do you have reference IDs / statements?</label>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setNavHasEvidence(true)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        navHasEvidence ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white border-stone-300'
                      }`}
                    >
                      ✓ Yes, Have Records
                    </button>
                    <button
                      onClick={() => setNavHasEvidence(false)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        !navHasEvidence ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-stone-300'
                      }`}
                    >
                      Missing Records
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigator Guidance Output Card */}
              <div className="mt-6 p-5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-200 px-2.5 py-0.5 rounded">
                    Diagnostic Outcome & Next Mandatory Action
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    {navAlreadyComplained === 'yes_more_30' ? '🟢 Ready for Regulatory Escalation' : '🟡 Entity Stage Mandated'}
                  </span>
                </div>

                <div className="text-sm text-emerald-950 font-bold">
                  {navAlreadyComplained === 'yes_more_30'
                    ? 'You have satisfied the statutory 30-day resolution window. You are immediately eligible to escalate to the Regulatory Portal (SEBI SCORES 2.0 / RBI CMS).'
                    : 'Under regulatory due process, you MUST first lodge a formal written dispute with the entity’s Grievance Redressal Officer (GRO) before escalating to the regulator.'}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs text-stone-800 space-y-1.5">
                  <div className="font-bold text-emerald-900">Action Checklist:</div>
                  <div>1. {navAlreadyComplained === 'yes_more_30' ? 'File on official portal: scores.sebi.gov.in or cms.rbi.org.in citing your initial ticket number.' : 'Send formal letter to Broker/Bank GRO. Request Action Taken Report.'}</div>
                  <div>2. Prescribed resolution TAT: {navCategory === 'banking' ? 'T+5 to 30 days' : '21 to 30 days'}.</div>
                  <div>3. {navHasEvidence ? 'Attach your statements and UTR receipts.' : 'Download your bank passbook/CML statement first before filing.'}</div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('builder');
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <span>Build Formal Complaint Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: 📝 AI STRUCTURED COMPLAINT BUILDER (6 Steps) */}
        {/* ========================================================= */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5 border-b border-stone-200 pb-4">
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Guided 6-Step Formal Complaint Builder
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500">
                    Step-by-step interview to build a legally precise complaint with timeline, relevant facts, and requested relief.
                  </p>
                </div>
              </div>

              {/* 6-Step Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step 1: What happened */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase">Step 1: What Happened?</label>
                    <textarea
                      rows={2}
                      value={builderData.whatHappened}
                      onChange={e => setBuilderData({ ...builderData, whatHappened: e.target.value })}
                      placeholder="e.g. 200 shares were sold without my consent or OTP..."
                      className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white outline-none"
                    />
                  </div>

                  {/* Step 2: When did it happen */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase">Step 2: When Did It Happen?</label>
                    <input
                      type="date"
                      value={builderData.whenDate}
                      onChange={e => setBuilderData({ ...builderData, whenDate: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white outline-none font-bold"
                    />
                  </div>

                  {/* Step 3: Entity name */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase">Step 3: Which Entity is Involved?</label>
                    <input
                      type="text"
                      value={builderData.entityName}
                      onChange={e => setBuilderData({ ...builderData, entityName: e.target.value })}
                      placeholder="e.g. Zerodha / HDFC Bank / Axis Mutual Fund"
                      className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white outline-none"
                    />
                  </div>

                  {/* Step 4: Previous communication */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase">Step 4: Have you already contacted them?</label>
                    <select
                      value={builderData.alreadyContacted}
                      onChange={e => setBuilderData({ ...builderData, alreadyContacted: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white outline-none font-medium"
                    >
                      <option value="yes">Yes, emailed customer support with ticket number</option>
                      <option value="called">Called helpline but no resolution provided</option>
                      <option value="no">No, this is my first formal letter to GRO</option>
                    </select>
                  </div>

                  {/* Step 5: Evidence held */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase">Step 5: Evidence You Have</label>
                    <input
                      type="text"
                      value={builderData.evidenceHeld}
                      onChange={e => setBuilderData({ ...builderData, evidenceHeld: e.target.value })}
                      placeholder="e.g. Bank statement, contract note, email screenshots"
                      className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white outline-none"
                    />
                  </div>

                  {/* Step 6: Requested resolution */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase">Step 6: Requested Relief / Remedy</label>
                    <input
                      type="text"
                      value={builderData.requestedRelief}
                      onChange={e => setBuilderData({ ...builderData, requestedRelief: e.target.value })}
                      placeholder="e.g. Full reversal of trade, ₹100/day penalty credit, 15% interest"
                      className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleGenerateFromBuilder}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Structured Complaint Letter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: 🚨 SCAM & LINK CHECKER (🔥 7 & 8) */}
        {/* ========================================================= */}
        {activeTab === 'scamChecker' && (
          <div className="space-y-6">
            {/* Sub-section 1: Message / SMS / WhatsApp Checker */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl">
                  <AlertOctagon className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {lang === 'hi' ? 'संदिग्ध संदेश या प्रस्ताव की जांच करें' : 'Scam & Phishing Message Checker'}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500">
                    Check suspicious messages for urgency, impersonation, payment requests, or fake returns without collecting personal data.
                  </p>
                </div>
              </div>

              <textarea
                rows={4}
                value={scamInput}
                onChange={e => setScamInput(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'संदिग्ध संदेश यहाँ पेस्ट करें (उदा: "VIP Telegram group guaranteed 500% profit, download institutional trading apk from bit.ly/xxx and transfer 50k to sharma savings account")...'
                    : 'Paste the suspicious SMS, WhatsApp message, or investment offer here...'
                }
                className="w-full p-4 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm bg-stone-50 outline-none leading-relaxed"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="font-semibold text-stone-500">Quick Test:</span>
                  <button
                    onClick={() => setScamInput('Join our VIP Telegram group. 300% upper circuit guaranteed profit! Transfer money to personal UPI id 9876543210@paytm and install our custom APK.')}
                    className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 font-medium"
                  >
                    Telegram Tip Scam
                  </button>
                  <button
                    onClick={() => setScamInput('Urgent: Your parcel with illegal narcotics has been seized by Customs. Digital arrest order issued by CBI. Join Skype call immediately.')}
                    className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 font-medium"
                  >
                    Digital Arrest Threat
                  </button>
                </div>

                <button
                  onClick={handleRunScamCheck}
                  disabled={!scamInput.trim()}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                    scamInput.trim()
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-95'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Analyze Message Safety</span>
                </button>
              </div>

              {/* Scam Analysis Result */}
              {scamResult && (
                <div className="mt-6 pt-6 border-t border-stone-200 space-y-4">
                  <div
                    className={`p-5 rounded-2xl border-2 ${
                      scamResult.riskLevel === 'CRITICAL_SCAM'
                        ? 'bg-rose-50 border-rose-400 text-rose-950'
                        : scamResult.riskLevel === 'HIGH_RISK'
                        ? 'bg-amber-50 border-amber-400 text-amber-950'
                        : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-rose-600" />
                        <h3 className="font-extrabold text-lg sm:text-xl">
                          {lang === 'hi' ? scamResult.titleHi : scamResult.titleEn}
                        </h3>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/90 font-extrabold text-sm border shadow-2xs">
                        Risk Indicator Score: {scamResult.score}/100
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed font-semibold">
                      {lang === 'hi' ? scamResult.verdictHi : scamResult.verdictEn}
                    </p>
                  </div>

                  {/* Red Flags List */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
                    <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2 mb-3">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span>{lang === 'hi' ? 'पहचाने गए खतरे (Red Flags)' : 'Identified Red Flags'}</span>
                    </h4>
                    <ul className="space-y-2">
                      {(lang === 'hi' ? scamResult.redFlagsHi : scamResult.redFlagsEn).map((flag, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-stone-700 flex items-start gap-2.5 p-2 bg-stone-50 rounded-lg">
                          <span className="text-rose-600 font-bold">⚠️</span>
                          <span className="leading-relaxed">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Regulatory Reality Check */}
                  <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-5">
                    <h4 className="font-bold text-emerald-950 text-sm sm:text-base flex items-center gap-2 mb-1">
                      <Scale className="w-4 h-4 text-emerald-700" />
                      <span>{lang === 'hi' ? 'कानूनी व नियामक वास्तविकता' : 'Regulatory Reality Check'}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
                      {lang === 'hi' ? scamResult.regulatoryCheckHi : scamResult.regulatoryCheckEn}
                    </p>
                  </div>

                  {/* Immediate Safety Action */}
                  <div className="bg-stone-900 text-stone-200 rounded-2xl p-5">
                    <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'hi' ? 'तुरंत क्या करें (Action Plan)' : 'Immediate Protective Action'}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-stone-300">
                      {(lang === 'hi' ? scamResult.safetyActionHi : scamResult.safetyActionEn).map((act, idx) => (
                        <li key={idx} className="leading-relaxed">{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Sub-section 2: Link Safety Assistant (🔥 8) */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Link Safety Assistant (वेबसाइट लिंक जांच)
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500">
                    Paste a website URL to inspect warning signs like unverified domains or unofficial shorteners.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  placeholder="e.g. http://bit.ly/sebi-bonus-claim or https://fake-trading.apk"
                  className="flex-1 p-3 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50 outline-none"
                />
                <button
                  onClick={handleCheckLink}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm"
                >
                  Verify Link
                </button>
              </div>

              {linkAnalysis && (
                <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-xs sm:text-sm text-blue-950 space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    {linkAnalysis.isRisky ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    <span>{linkAnalysis.message}</span>
                  </div>
                  <div className="text-stone-700 font-medium">
                    <span className="font-bold block mb-1">Recommended Verification Steps:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {linkAnalysis.safeSteps.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: 📚 JARGON BUSTER / FINANCIAL TERMINOLOGY TRANSLATOR */}
        {/* ========================================================= */}
        {activeTab === 'glossary' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-stone-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl">
                    <BookMarked className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">
                      Financial Jargon Buster (वित्तीय शब्दावली अनुवादक)
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500">
                      Complex financial terms explained in everyday plain language with Hindi and English analogies.
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={glossarySearch}
                    onChange={e => setGlossarySearch(e.target.value)}
                    placeholder="Search Demat, UTR, NAV..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGlossary.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-stone-200 hover:border-purple-300 bg-stone-50/40 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-stone-900 text-base">{item.term}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {item.category}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-purple-900">
                      {item.hindiTerm}
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {lang === 'hi' ? item.plainHindi : item.plainEnglish}
                    </p>

                    <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-xs text-stone-600">
                      <strong>💡 {lang === 'hi' ? 'उदाहरण:' : 'Real Example:'}</strong>{' '}
                      {lang === 'hi' ? item.exampleHi : item.exampleEn}
                    </div>

                    {item.officialRef && (
                      <div className="text-[10px] text-stone-400 font-mono">
                        Ref: {item.officialRef}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: 📂 LOCAL CASE TRACKER */}
        {/* ========================================================= */}
        {activeTab === 'caseTracker' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-stone-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    <span>{lang === 'hi' ? 'मेरा व्यक्तिगत केस ट्रैकर' : 'My Local Grievance Case Tracker'}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500">
                    Stored on your device via LocalStorage. Zero cloud retention for complete privacy.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('builder')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 flex items-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Draft New Grievance</span>
                </button>
              </div>

              {cases.length === 0 ? (
                <div className="text-center py-12 text-stone-400 space-y-3">
                  <FolderOpen className="w-12 h-12 mx-auto text-stone-300" />
                  <p className="text-sm font-medium">No active cases being tracked.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cases.map((c) => (
                    <div key={c.id} className="p-4 sm:p-5 rounded-2xl border-2 border-stone-200 bg-stone-50/40 hover:border-blue-300 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                              {c.entity}
                            </span>
                            <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                              Ref: {c.refNumber}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
                            {c.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={c.status}
                            onChange={e => setCases(prev => prev.map(item => item.id === c.id ? { ...item, status: e.target.value as any } : item))}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-300 bg-white cursor-pointer"
                          >
                            <option value="GRO_FILED">Step 1: GRO Filed (30 Days)</option>
                            <option value="REGULATOR_ESCALATED">Step 2: Escalated to SCORES/CMS</option>
                            <option value="ODR_ARBITRATION">Step 3: SMART ODR / Arbitration</option>
                            <option value="RESOLVED">✓ Case Resolved</option>
                          </select>

                          <button
                            onClick={() => setCases(prev => prev.filter(item => item.id !== c.id))}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Delete case record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                          <span className="text-stone-400 font-semibold block text-[10px]">DATE FILED</span>
                          <span className="font-bold text-stone-800">{c.dateFiled}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                          <span className="text-stone-400 font-semibold block text-[10px]">MANDATED TAT</span>
                          <span className="font-bold text-stone-800">{c.tatDays} Days</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                          <span className="text-amber-700 font-semibold block text-[10px]">FOLLOW-UP DUE</span>
                          <span className="font-bold text-amber-900">{c.followUpDate}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                          <span className="text-emerald-700 font-semibold block text-[10px]">CURRENT STAGE</span>
                          <span className="font-bold text-emerald-900">
                            {c.status === 'RESOLVED' ? '✓ Resolved' : c.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: 📚 PERSONAL INVESTOR LEARNING PATH */}
        {/* ========================================================= */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5 border-b border-stone-200 pb-4">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <BookOpen className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Personal Investor Learning Path (निवेशक शिक्षा यात्रा)
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500">
                    Beginner to advanced modules on Demat accounts, dividends, investor rights, and scam recognition.
                  </p>
                </div>
              </div>

              {/* Module Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-5">
                {LEARNING_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setActiveLesson(mod);
                      setSelectedQuizOption(null);
                      setShowQuizResult(false);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      activeLesson.id === mod.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <span>{lang === 'hi' ? mod.titleHi.split(':')[0] : mod.titleEn.split(':')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Active Lesson Display */}
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-amber-50/60 border-2 border-amber-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                      {activeLesson.badge}
                    </span>
                    <span className="text-xs text-amber-800 font-medium">⏱️ {activeLesson.duration}</span>
                  </div>
                  <h3 className="font-extrabold text-stone-900 text-lg sm:text-xl">
                    {lang === 'hi' ? activeLesson.titleHi : activeLesson.titleEn}
                  </h3>
                  <div className="text-xs text-amber-900 font-medium mt-1">
                    📖 <strong>Official Source:</strong> {activeLesson.officialSource}
                  </div>
                  <p className="mt-3 text-sm text-stone-700 leading-relaxed font-medium">
                    {lang === 'hi' ? activeLesson.summaryHi : activeLesson.summaryEn}
                  </p>
                </div>

                {/* Key Points */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
                  <h4 className="font-bold text-stone-900 text-sm sm:text-base mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Statutory Rights Checklist</span>
                  </h4>
                  <ul className="space-y-2">
                    {(lang === 'hi' ? activeLesson.keyPointsHi : activeLesson.keyPointsEn).map((pt, i) => (
                      <li key={i} className="text-xs sm:text-sm text-stone-700 flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-xl">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interactive Quiz Checkpoint */}
                <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>Quick Knowledge Checkpoint</span>
                  </div>
                  <p className="font-bold text-stone-900 text-sm sm:text-base mb-4">
                    {lang === 'hi' ? activeLesson.quickQuiz.questionHi : activeLesson.quickQuiz.questionEn}
                  </p>

                  <div className="space-y-2">
                    {(lang === 'hi' ? activeLesson.quickQuiz.optionsHi : activeLesson.quickQuiz.optionsEn).map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedQuizOption(idx);
                          setShowQuizResult(true);
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                          showQuizResult && idx === activeLesson.quickQuiz.correctIndex
                            ? 'bg-emerald-200 border-emerald-600 text-emerald-950 font-bold'
                            : showQuizResult && selectedQuizOption === idx && idx !== activeLesson.quickQuiz.correctIndex
                            ? 'bg-rose-100 border-rose-400 text-rose-950'
                            : selectedQuizOption === idx
                            ? 'bg-amber-100 border-amber-400'
                            : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                        }`}
                      >
                        <span className="font-mono mr-2">{String.fromCharCode(65 + idx)}.</span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>

                  {showQuizResult && (
                    <div className="mt-4 p-3.5 bg-white rounded-xl border border-emerald-300 text-xs sm:text-sm text-stone-800 leading-relaxed">
                      <strong>{selectedQuizOption === activeLesson.quickQuiz.correctIndex ? '🎉 Correct!' : 'ℹ️ Explanation:'}</strong>{' '}
                      {lang === 'hi' ? activeLesson.quickQuiz.explanationHi : activeLesson.quickQuiz.explanationEn}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: REGULATORY HELPLINES DIRECTORY */}
        {/* ========================================================= */}
        {activeTab === 'helplines' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-xl font-bold text-stone-900 mb-2">
                {t.helplineTitle}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mb-5">
                Official, verified toll-free helplines and dispute escalation web portals recognized across India.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REGULATORY_HELPLINES.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-stone-200 hover:border-emerald-400 bg-stone-50/50 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-stone-900 text-base">{item.authority}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-emerald-700 font-extrabold text-lg sm:text-xl my-1 flex items-center gap-2">
                      <PhoneCall className="w-4 h-4" />
                      <span>{item.phone}</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-2">⏰ {item.timing}</div>
                    <a
                      href={item.portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-emerald-700 underline"
                    >
                      <span>{item.portal}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-stone-900 text-stone-400 text-xs py-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="text-amber-500 font-serif text-lg font-black">₹</span>
              <span>{t.appName}</span>
              <span className="text-stone-500 font-normal">| {t.tagline}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-emerald-400">SEBI SCORES 2.0</span>
              <span>•</span>
              <span className="text-emerald-400">RBI CMS</span>
              <span>•</span>
              <span className="text-emerald-400">IRDAI Bima Bharosa</span>
              <span>•</span>
              <span className="text-emerald-400">MHA Cyber 1930</span>
            </div>
          </div>

          <p className="leading-relaxed text-stone-500 text-[11px]">
            {t.disclaimer}
          </p>

          <div className="text-[10px] text-stone-600 flex flex-wrap justify-between items-center gap-2">
            <span>Built for retail & elderly investors across Bharat • Zero PII retention • Local Storage Privacy</span>
            <span>Helpline: 1800 266 7575 (SEBI) | 1930 (Cyber Crime) | 14448 (RBI)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
