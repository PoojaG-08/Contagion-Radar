import type { LanguageCode } from '../types/contagion';

export interface TranslationPack {
  brand: string;
  liveDemoLabel: string;
  msmeMode: string;
  commandCenter: string;
  judgeTour: string;
  resetDemo: string;
  simulatedBanner: string;
  nav: {
    landing: string;
    dashboard: string;
    invoices: string;
    networkGraph: string;
    contagion: string;
    shockSim: string;
    earlyWarning: string;
    preventiveActions: string;
    aiExplanation: string;
    commandView: string;
    architecture: string;
    stakeholders: string;
    feasibility: string;
    riskMetrics: string;
    roadmap: string;
  };
  kpis: {
    healthScore: string;
    moneyWaiting: string;
    overdueAmount: string;
    daysOverdue: string;
    opexRunway: string;
    buyerConcentration: string;
    supplierDependency: string;
  };
  actions: {
    simulateShock: string;
    explainRisk: string;
    addInvoice: string;
    resetSimulation: string;
    getStarted: string;
    exploreDemo: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationPack> = {
  en: {
    brand: 'Contagion Radar',
    liveDemoLabel: 'Live Demo Environment',
    msmeMode: 'MSME Mode',
    commandCenter: 'Command Center',
    judgeTour: 'Judge Demo Tour',
    resetDemo: 'Reset Demo',
    simulatedBanner:
      'SIMULATED / MODEL OUTPUT – Results are based on configured assumptions and should not be interpreted as guaranteed financial forecasts.',
    nav: {
      landing: 'Overview',
      dashboard: 'MSME Dashboard',
      invoices: 'Invoice Ledger',
      networkGraph: 'Supply Chain Graph',
      contagion: 'Contagion Analysis',
      shockSim: 'Shock Simulation',
      earlyWarning: 'Early Warnings',
      preventiveActions: 'Preventive Actions',
      aiExplanation: 'AI Risk Explanation',
      commandView: 'Command Center',
      architecture: 'System Architecture',
      stakeholders: 'Stakeholder Value',
      feasibility: 'Feasibility & Scope',
      riskMetrics: 'Risk Metrics',
      roadmap: 'Strategic Roadmap',
    },
    kpis: {
      healthScore: 'Business Health Score',
      moneyWaiting: 'Money Waiting to Be Received',
      overdueAmount: 'Overdue Payment Amount',
      daysOverdue: 'Days Overdue',
      opexRunway: 'Operating Expense Runway',
      buyerConcentration: 'Buyer Concentration',
      supplierDependency: 'Supplier Dependency',
    },
    actions: {
      simulateShock: 'SIMULATE PAYMENT SHOCK',
      explainRisk: 'EXPLAIN MY RISK',
      addInvoice: 'Add Invoice',
      resetSimulation: 'Reset Simulation',
      getStarted: 'Get Started',
      exploreDemo: 'Explore Demo',
    },
  },
  hi: {
    brand: 'कॉन्टेजियन रडार',
    liveDemoLabel: 'लाइव डेमो वातावरण',
    msmeMode: 'MSME सरल पोर्टल',
    commandCenter: 'कमांड सेंटर',
    judgeTour: 'जज डेमो टूर',
    resetDemo: 'डेमो रीसेट करें',
    simulatedBanner:
      'सिम्युलेटेड / मॉडल आउटपुट – परिणाम निर्धारित मान्यताओं पर आधारित हैं और इन्हें सुनिश्चित वित्तीय पूर्वानुमान नहीं माना जाना चाहिए।',
    nav: {
      landing: 'मुख्य पृष्ठ',
      dashboard: 'MSME डैशबोर्ड',
      invoices: 'इनवॉइस प्रबंधन',
      networkGraph: 'सप्लाई चेन नेटवर्क',
      contagion: 'प्रभाव विश्लेषण',
      shockSim: 'भुगतान शॉक सिमुलेशन',
      earlyWarning: 'प्रारंभिक चेतावनी',
      preventiveActions: 'निवारक उपाय',
      aiExplanation: 'AI जोखिम व्याख्या',
      commandView: 'कमांड सेंटर',
      architecture: 'सिस्टम आर्किटेक्चर',
      stakeholders: 'हितधारक प्रभाव',
      feasibility: 'व्यवहार्यता और दायरा',
      riskMetrics: 'जोखिम मेट्रिक्स',
      roadmap: 'रणनीतिक रोडमैप',
    },
    kpis: {
      healthScore: 'व्यवसाय स्वास्थ्य स्कोर',
      moneyWaiting: 'प्राप्त होने वाली बकाया राशि',
      overdueAmount: 'अतिदेय भुगतान राशि',
      daysOverdue: 'अतिदेय दिन',
      opexRunway: 'परिचालन व्यय रनवे',
      buyerConcentration: 'खरीदार निर्भरता',
      supplierDependency: 'आपूर्तिकर्ता निर्भरता',
    },
    actions: {
      simulateShock: 'भुगतान शॉक सिमुलेट करें',
      explainRisk: 'मेरा जोखिम समझाएं',
      addInvoice: 'इनवॉइस जोड़ें',
      resetSimulation: 'सिमुलेशन रीसेट करें',
      getStarted: 'शुरू करें',
      exploreDemo: 'डेमो देखें',
    },
  },
  mr: {
    brand: 'कॉन्टेजियन रडार',
    liveDemoLabel: 'थेट डेमो प्रणाली',
    msmeMode: 'MSME सोपे पोर्टल',
    commandCenter: 'कमांड सेंटर',
    judgeTour: 'जज डेमो टूर',
    resetDemo: 'डेमो रीसेट करा',
    simulatedBanner:
      'सिम्युलेटेड / मॉडेल आउटपुट – निकाल निर्धारित गृहीतकांवर आधारित आहेत आणि त्यांची खात्रीशीर आर्थिक भाकीत म्हणून गणना करू नये.',
    nav: {
      landing: 'मुख्य पान',
      dashboard: 'MSME डॅशबोर्ड',
      invoices: 'बीजक व्यवस्थापन',
      networkGraph: 'पुरवठा साखळी आलेख',
      contagion: 'संसर्ग विश्लेषण',
      shockSim: 'पेमेंट शॉक सिम्युलेशन',
      earlyWarning: 'पूर्वसूचना प्रणाली',
      preventiveActions: 'प्रतिबंधात्मक उपाय',
      aiExplanation: 'AI जोखीम स्पष्टीकरण',
      commandView: 'कमांड सेंटर',
      architecture: 'सिस्टम आर्किटेक्चर',
      stakeholders: 'भागधारक मूल्य',
      feasibility: 'व्यवहार्यता आणि व्याप्ती',
      riskMetrics: 'जोखीम निर्देशांक',
      roadmap: 'धोरणात्मक रोडमॅप',
    },
    kpis: {
      healthScore: 'व्यवसाय आरोग्य गुणांक',
      moneyWaiting: 'येणे बाकी असलेली रक्कम',
      overdueAmount: 'थकित देयक रक्कम',
      daysOverdue: 'थकबाकीचे दिवस',
      opexRunway: 'दैनिक खर्च कालावधी',
      buyerConcentration: 'खरेदीदार केंद्रीकरण',
      supplierDependency: 'पुरवठादार अवलंबित्व',
    },
    actions: {
      simulateShock: 'पेमेंट शॉक सिम्युलेट करा',
      explainRisk: 'माझी जोखीम स्पष्ट करा',
      addInvoice: 'नवीन बीजक जोडा',
      resetSimulation: 'सिम्युलेशन रीसेट करा',
      getStarted: 'सुरुवात करा',
      exploreDemo: 'डेमो पहा',
    },
  },
  ta: {
    brand: 'கன்டேஜியன் ரேடார்',
    liveDemoLabel: 'நேரடி டெமோ சூழல்',
    msmeMode: 'MSME எளிய தளம்',
    commandCenter: 'கட்டளை மையம்',
    judgeTour: 'நடுவர் டெமோ சுற்றுலா',
    resetDemo: 'டெமோவை மீட்டமை',
    simulatedBanner:
      'உருவகப்படுத்தப்பட்ட / மாதிரி வெளியீடு – முடிவுகள் கட்டமைக்கப்பட்ட அனுமானங்களை அடிப்படையாகக் கொண்டவை; இவை உறுதியான நிதி கணிப்புகள் அல்ல.',
    nav: {
      landing: 'முகப்பு',
      dashboard: 'MSME டாஷ்போர்டு',
      invoices: 'விலைப்பட்டியல் நிர்வாகம்',
      networkGraph: 'விநியோகச் சங்கிலி வரைபடம்',
      contagion: 'பரவல் பகுப்பாய்வு',
      shockSim: 'கட்டண அதிர்ச்சி உருவகப்படுத்துதல்',
      earlyWarning: 'முன்கூட்டிய எச்சரிக்கை',
      preventiveActions: 'தடுப்பு நடவடிக்கைகள்',
      aiExplanation: 'AI இடர் விளக்கம்',
      commandView: 'கட்டளை மையம்',
      architecture: 'அமைப்பு கட்டமைப்பு',
      stakeholders: 'பங்குதாரர் மதிப்பு',
      feasibility: 'சாத்தியக்கூறு மற்றும் வரம்பு',
      riskMetrics: 'இடர் அளவீடுகள்',
      roadmap: 'செயல் திட்டம்',
    },
    kpis: {
      healthScore: 'வணிக ஆரோக்கிய மதிப்பெண்',
      moneyWaiting: 'வரவேண்டிய நிலுவைத் தொகை',
      overdueAmount: 'தாமதமான தொகை',
      daysOverdue: 'தாமதமான நாட்கள்',
      opexRunway: 'செயல்பாட்டுச் செலவு காலம்',
      buyerConcentration: 'வாங்குபவர் செறிவு',
      supplierDependency: 'சப்ளையர் சார்பு',
    },
    actions: {
      simulateShock: 'கட்டண அதிர்ச்சியை உருவகப்படுத்து',
      explainRisk: 'எனது இடரை விளக்குக',
      addInvoice: 'விலைப்பட்டியல் சேர்',
      resetSimulation: 'உருவகப்படுத்துதலை மீட்டமை',
      getStarted: 'தொடங்கவும்',
      exploreDemo: 'டெமோவைப் பார்க்கவும்',
    },
  },
};

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिन्दी (HI)',
  mr: 'मराठी (MR)',
  ta: 'தமிழ் (TA)',
};
