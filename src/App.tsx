import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  Mic2, 
  User, 
  ChevronRight, 
  RotateCcw, 
  Trophy,
  Calendar,
  MessageSquare,
  Volume2,
  Trash2,
  Sparkles,
  LogIn,
  UserPlus,
  ArrowRight,
  BrainCircuit,
  Mail,
  Lock
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface UserData {
  todayCount: number;
  streak: number;
  speakingCount: number;
  lastDate: string;
  errors: string[]; // Array of English words
  vocabProgress: Record<string, { level: number; nextReview: number }>;
  learnedToday: string[];
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface SpeakingTask {
  id: number;
  title: string;
  prompt: string;
  ref: string;
  type: 'read' | 'qa' | 'topic';
}

// --- Constants & Mock Data ---
const WORDS_DB = [
  { en: "abandon", cn: "放弃，抛弃" },
  { en: "ability", cn: "能力，才干" },
  { en: "abnormal", cn: "不正常的" },
  { en: "absolute", cn: "绝对的，完全的" },
  { en: "absorb", cn: "吸收，吸引" },
  { en: "abstract", cn: "抽象的" },
  { en: "abundant", cn: "丰富的，充裕的" },
  { en: "academic", cn: "学术的" },
  { en: "accelerate", cn: "加速" },
  { en: "accent", cn: "口音，重音" },
  { en: "accept", cn: "接受" },
  { en: "access", cn: "通道，进入" },
  { en: "accident", cn: "事故，意外" },
  { en: "accommodate", cn: "容纳，适应" },
  { en: "accompany", cn: "陪伴，伴随" },
  { en: "accomplish", cn: "完成，实现" },
  { en: "account", cn: "账目，描述" },
  { en: "accumulate", cn: "积累" },
  { en: "accurate", cn: "准确的" },
  { en: "accuse", cn: "指控" },
  { en: "achieve", cn: "达到，完成" },
  { en: "acknowledge", cn: "承认，告知" },
  { en: "acquire", cn: "获得，学到" },
  { en: "adapt", cn: "适应，改编" },
  { en: "adequate", cn: "充足的" },
  { en: "adjust", cn: "调整，调节" },
  { en: "administration", cn: "管理，行政" },
  { en: "admire", cn: "钦佩，羡慕" },
  { en: "admit", cn: "承认，准许进入" },
  { en: "adopt", cn: "采用，收养" },
  { en: "advance", cn: "前进，提前" },
  { en: "advantage", cn: "优势，好处" },
  { en: "adventure", cn: "冒险" },
  { en: "advocate", cn: "提倡，拥护者" },
  { en: "affect", cn: "影响" },
  { en: "afford", cn: "负担得起" },
  { en: "agency", cn: "代理机构" },
  { en: "agenda", cn: "议程" },
  { en: "aggressive", cn: "侵略性的，进取的" },
  { en: "agreement", cn: "协议，同意" },
  { en: "agriculture", cn: "农业" },
  { en: "alarm", cn: "警报，惊恐" },
  { en: "alcohol", cn: "酒精" },
  { en: "allergic", cn: "过敏的" },
  { en: "allocate", cn: "分配" },
  { en: "allowance", cn: "津贴，零用钱" },
  { en: "alternative", cn: "备选的，供选择的事物" },
  { en: "altitude", cn: "高度，海拔" },
  { en: "amateur", cn: "业余爱好者" },
  { en: "ambition", cn: "雄心，抱负" },
  { en: "ambulance", cn: "救护车" },
  { en: "analyze", cn: "分析" },
  { en: "ancestor", cn: "祖先" },
  { en: "ancient", cn: "古代的" },
  { en: "anniversary", cn: "周年纪念" },
  { en: "announce", cn: "宣布" },
  { en: "annual", cn: "每年的" },
  { en: "anticipate", cn: "预期，期望" },
  { en: "antique", cn: "古董" },
  { en: "anxiety", cn: "焦虑，担心" },
  { en: "apology", cn: "道歉" },
  { en: "apparent", cn: "明显的" },
  { en: "appeal", cn: "呼吁，吸引力" },
  { en: "appetite", cn: "食欲" },
  { en: "applaud", cn: "鼓掌，称赞" },
  { en: "applicant", cn: "申请人" },
  { en: "appoint", cn: "任命，委派" },
  { en: "appreciate", cn: "感激，欣赏" },
  { en: "approach", cn: "靠近，方法" },
  { en: "appropriate", cn: "适当的" },
  { en: "approve", cn: "批准，赞成" },
  { en: "approximate", cn: "大概的" },
  { en: "arbitrary", cn: "随意的，武断的" },
  { en: "architect", cn: "建筑师" },
  { en: "argument", cn: "争论，论点" },
  { en: "arise", cn: "出现，上升" },
  { en: "artificial", cn: "人造的" },
  { en: "aspect", cn: "方面，面貌" },
  { en: "assess", cn: "评估" },
  { en: "assign", cn: "分配，指派" },
  { en: "assist", cn: "协助" },
  { en: "associate", cn: "联系，伙伴" },
  { en: "assume", cn: "假定，承担" },
  { en: "astonish", cn: "使惊讶" },
  { en: "athlete", cn: "运动员" },
  { en: "atmosphere", cn: "大气，气氛" },
  { en: "attach", cn: "系上，贴上" },
  { en: "attain", cn: "达到，获得" },
  { en: "attempt", cn: "尝试" },
  { en: "attitude", cn: "态度" },
  { en: "attract", cn: "吸引" },
  { en: "audience", cn: "观众，听众" },
  { en: "authentic", cn: "真实的，可靠的" },
  { en: "authority", cn: "权威，当局" },
  { en: "available", cn: "可用的，可得到的" },
  { en: "average", cn: "平均的" },
  { en: "avoid", cn: "避免" },
  { en: "award", cn: "奖项" },
  { en: "aware", cn: "意识到的" },
  { en: "awesome", cn: "极好的，令人敬畏的" },
];

const SPEAKING_TASKS: SpeakingTask[] = [
  {
    id: 1,
    title: "短文朗读: 科技与生活",
    type: 'read',
    prompt: "Technology has changed the way we live. From smartphones to artificial intelligence, innovation is everywhere. It makes our lives easier but also brings new challenges.",
    ref: "Technology has changed the way we live. From smartphones to artificial intelligence, innovation is everywhere. It makes our lives easier but also brings new challenges."
  },
  {
    id: 2,
    title: "情景问答: 图书馆借书",
    type: 'qa',
    prompt: "You are at the school library. Ask the librarian: 1. Where can I find books about history? 2. How long can I keep the books?",
    ref: "Excuse me, could you tell me where the history books are? And how long am I allowed to borrow them for?"
  },
  {
    id: 3,
    title: "话题简述: 我的家乡",
    type: 'topic',
    prompt: "Describe your hometown. Mention: Its location, Its famous food, Why you love it.",
    ref: "My hometown is a beautiful city in the south. It is famous for its delicious seafood and friendly people. I love it because it is where my family lives."
  },
  {
    id: 4,
    title: "短文朗读: 环境保护",
    type: 'read',
    prompt: "Protecting the environment is our responsibility. We should reduce waste, recycle materials, and save energy. Every small action counts in making the world a better place.",
    ref: "Protecting the environment is our responsibility. We should reduce waste, recycle materials, and save energy. Every small action counts in making the world a better place."
  },
  {
    id: 5,
    title: "情景问答: 餐厅订位",
    type: 'qa',
    prompt: "You want to book a table at a restaurant. Ask: 1. Do you have a table for four tonight? 2. Is there a window seat available?",
    ref: "Hello, I'd like to book a table for four for tonight. Is there any chance we could have a seat by the window?"
  }
];

const GRAMMAR_TASKS = [
  {
    id: 1,
    question: "I ________ (finish) my homework before my mother came back.",
    answer: "had finished",
    options: ["finished", "have finished", "had finished", "was finishing"],
    explanation: "过去完成时表示在过去某一动作之前已经完成的动作。"
  },
  {
    id: 2,
    question: "The book ________ (write) by a famous author in the 19th century.",
    answer: "was written",
    options: ["wrote", "was written", "has been written", "is written"],
    explanation: "被动语态，且发生在过去，使用一般过去时的被动语态。"
  },
  {
    id: 3,
    question: "If I ________ (be) you, I would take the offer.",
    answer: "were",
    options: ["am", "was", "were", "be"],
    explanation: "虚拟语气中，if从句的谓语动词用were。"
  },
  {
    id: 4,
    question: "He is the person ________ (who/whom) I talked to yesterday.",
    answer: "whom",
    options: ["who", "whom", "whose", "which"],
    explanation: "whom在定语从句中作宾语。"
  },
  {
    id: 5,
    question: "Not only ________ (he/be) interested in music, but also he is good at it.",
    answer: "is he",
    options: ["he is", "is he", "does he", "he does"],
    explanation: "Not only位于句首，主句要部分倒装。"
  }
];

const QUOTES = [
  "凡心所向，素履以往。生如逆旅，一苇以航。",
  "不经一番寒彻骨，怎得梅花扑鼻香。",
  "星光不问赶路人，时光不负有心人。",
  "愿你提笔高考时，如武士收刀入鞘。",
  "The beautiful thing about learning is that no one can take it away from you."
];

// --- Components ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInputs, setAuthInputs] = useState({ username: '', account: '', password: '' });
  const [currentUser, setCurrentUser] = useState<{ username: string; account: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'vocab' | 'grammar' | 'speaking' | 'ai'>('home');
  const [userData, setUserData] = useState<UserData>({
    todayCount: 0,
    streak: 0,
    speakingCount: 0,
    lastDate: new Date().toDateString(),
    errors: [],
    vocabProgress: {},
    learnedToday: []
  });

  // AI State
  const [aiSentence, setAiSentence] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Grammar State
  const [grammarIdx, setGrammarIdx] = useState(0);
  const [grammarScore, setGrammarScore] = useState(0);
  const [grammarFinished, setGrammarFinished] = useState(false);
  const [grammarFeedback, setGrammarFeedback] = useState<string | null>(null);

  // Quiz State
  const [quizMode, setQuizMode] = useState<'none' | 'en-cn' | 'cn-en' | 'spelling'>('none');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizWrongWords, setQuizWrongWords] = useState<any[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [spellingInput, setSpellingInput] = useState('');

  // Speaking State
  const [currentTask, setCurrentTask] = useState<SpeakingTask | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingTranscript, setSpeakingTranscript] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState<any>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('gaokao_sprint_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
      if (parsed.lastDate !== today) {
        const last = new Date(parsed.lastDate);
        const diff = (new Date(today).getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        setUserData({
          ...parsed,
          todayCount: 0,
          speakingCount: 0,
          streak: diff <= 1 ? parsed.streak : 0,
          lastDate: today
        });
      } else {
        setUserData(parsed);
      }
    }

    const savedUser = localStorage.getItem('gaokao_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      localStorage.setItem('gaokao_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gaokao_current_user');
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    localStorage.setItem('gaokao_sprint_data', JSON.stringify(userData));
  }, [userData]);

  // Helpers
  const daysToGaokao = useMemo(() => {
    const now = new Date();
    const gaokao = new Date(now.getFullYear(), 5, 7); // June 7th
    if (now > gaokao) gaokao.setFullYear(gaokao.getFullYear() + 1);
    return Math.ceil((gaokao.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  const reviewCount = useMemo(() => {
    const now = Date.now();
    return Object.values(userData.vocabProgress).filter((p: any) => p.nextReview <= now).length;
  }, [userData.vocabProgress]);

  // Quiz Logic
  const startQuiz = (mode: typeof quizMode) => {
    const shuffled = [...WORDS_DB].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuizQuestions(shuffled);
    setQuizMode(mode);
    setCurrentQIdx(0);
    setQuizScore(0);
    setQuizWrongWords([]);
    setQuizFinished(false);
    setSpellingInput('');
  };

  const handleAnswer = (isCorrect: boolean) => {
    const word = quizQuestions[currentQIdx];
    if (isCorrect) {
      setQuizScore(s => s + 1);
      setUserData(prev => ({
        ...prev,
        learnedToday: Array.from(new Set([...prev.learnedToday, word.en]))
      }));
      updateEbbinghaus(word.en, true);
    } else {
      setQuizWrongWords(prev => [...prev, word]);
      setUserData(prev => ({
        ...prev,
        errors: Array.from(new Set([...prev.errors, word.en]))
      }));
      updateEbbinghaus(word.en, false);
    }

    if (currentQIdx < quizQuestions.length - 1) {
      setCurrentQIdx(i => i + 1);
      setSpellingInput('');
    } else {
      setQuizFinished(true);
      setUserData(prev => ({
        ...prev,
        todayCount: prev.todayCount + quizQuestions.length,
        streak: prev.streak === 0 ? 1 : prev.streak // Simple streak logic
      }));
    }
  };

  const updateEbbinghaus = (wordEn: string, isCorrect: boolean) => {
    const intervals = [0, 1, 2, 4, 7, 15]; // Days
    setUserData(prev => {
      const progress = prev.vocabProgress[wordEn] || { level: 0, nextReview: 0 };
      const newLevel = isCorrect ? Math.min(progress.level + 1, 5) : 0;
      const nextDays = intervals[newLevel];
      return {
        ...prev,
        vocabProgress: {
          ...prev.vocabProgress,
          [wordEn]: {
            level: newLevel,
            nextReview: Date.now() + nextDays * 24 * 60 * 60 * 1000
          }
        }
      };
    });
  };

  // Speaking Logic
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpeakingTranscript(transcript);
      analyzeSpeaking(transcript);
    };
    recognition.start();
  };

  const analyzeSpeaking = (transcript: string) => {
    // Mock analysis
    const accuracy = Math.floor(Math.random() * 3) + 15; // 15-17
    const feedback = {
      total: accuracy,
      fluency: 4,
      accuracy: 4,
      intonation: 4,
      grammar: 4,
      advice: accuracy > 18 ? "发音非常地道，继续保持！" : "注意部分单词的重音，可以尝试多听原声带。"
    };
    setSpeakingFeedback(feedback);
    setUserData(prev => ({ ...prev, speakingCount: prev.speakingCount + 1 }));
  };

  const generateAiSentence = async () => {
    if (userData.learnedToday.length === 0) {
      alert('请先学习一些单词吧');
      return;
    }
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `使用以下高考英语单词编写一个励志的短故事或几个句子（中英文对照）：${userData.learnedToday.join(', ')}。要求：风格温暖治愈，适合高三学生。请直接输出内容，不要使用 ### 或 *** 等复杂的 Markdown 符号，保持排版简洁清晰，可以使用简单的换行。`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setAiSentence(response.text || "AI 正在冥想中，请稍后再试。");
    } catch (error) {
      console.error(error);
      setAiSentence("AI 正在冥想中，请稍后再试。建议：凡心所向，素履以往。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGrammarAnswer = (opt: string) => {
    const current = GRAMMAR_TASKS[grammarIdx];
    if (opt === current.answer) {
      setGrammarScore(s => s + 1);
      setGrammarFeedback("正确！" + current.explanation);
    } else {
      setGrammarFeedback("错误。正确答案是：" + current.answer + "。" + current.explanation);
    }
    
    setTimeout(() => {
      setGrammarFeedback(null);
      if (grammarIdx < GRAMMAR_TASKS.length - 1) {
        setGrammarIdx(i => i + 1);
      } else {
        setGrammarFinished(true);
      }
    }, 3000);
  };

  const sendChatMessage = async (msg?: string) => {
    const text = msg || chatInput;
    if (!text.trim()) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: newHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        config: {
          systemInstruction: "你是一位专业的高考英语私教，名叫'禅意学长'。你的任务是解答学生关于高考英语的任何问题（语法、词汇、作文、听力、口语）。你的语气应该是鼓励性的、专业的、简洁的，并带有一点禅意。如果学生问起这个应用的功能，请告诉他们：本应用包含单词冲刺（遗忘曲线记忆）、口语真题模拟、语法专项突破以及AI语境实验室。你可以根据学生今天学到的单词（" + userData.learnedToday.join(', ') + "）给出学习建议。重要排版要求：请不要使用 ###、*** 或类似的复杂 Markdown 标题和加粗符号。请使用清晰的换行、数字列表或简单的点号（•）来分点阐述，确保在手机端阅读体验良好，界面干净整洁。"
        }
      });
      
      setChatHistory([...newHistory, { role: 'model', text: response.text || "学长正在冥想，请稍后再试。" }]);
    } catch (error) {
      console.error(error);
      setChatHistory([...newHistory, { role: 'model', text: "连接中断，请检查网络或稍后再试。" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAuth = () => {
    const { username, account, password } = authInputs;
    
    if (!account || !password) {
      alert('请填写账号和密码');
      return;
    }

    const users = JSON.parse(localStorage.getItem('gaokao_users') || '[]');

    if (authMode === 'register') {
      if (!username) {
        alert('请填写用户名');
        return;
      }
      if (users.find((u: any) => u.account === account)) {
        alert('该账号已存在');
        return;
      }
      const newUser = { username, account, password };
      users.push(newUser);
      localStorage.setItem('gaokao_users', JSON.stringify(users));
      alert('注册成功，请登录');
      setAuthMode('login');
    } else {
      const user = users.find((u: any) => u.account === account && u.password === password);
      if (user) {
        setCurrentUser({ username: user.username, account: user.account });
        setIsLoggedIn(true);
      } else {
        alert('账号或密码错误');
      }
    }
  };

  // Renderers
  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass rounded-3xl p-6 flex justify-between items-center zen-shadow">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">今日进度</p>
          <h2 className="text-4xl font-bold mt-1 text-white">{userData.todayCount} <span className="text-sm font-normal text-slate-500">词</span></h2>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">连续打卡</p>
          <h2 className="text-4xl font-bold mt-1 text-sunset">{userData.streak} <span className="text-sm font-normal text-slate-500">天</span></h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center space-x-2 text-slate-400 mb-1">
            <Mic2 size={14} />
            <span className="text-xs">口语练习</span>
          </div>
          <p className="text-2xl font-semibold text-white">{userData.speakingCount} <span className="text-xs font-normal text-slate-500">次</span></p>
        </div>
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center space-x-2 text-slate-400 mb-1">
            <RotateCcw size={14} />
            <span className="text-xs">待复习</span>
          </div>
          <p className="text-2xl font-semibold text-sunset">{reviewCount} <span className="text-xs font-normal text-slate-500">词</span></p>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-sunset" />
        <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
          <Calendar size={16} className="mr-2 text-sunset" />
          每日禅语
        </h3>
        <p className="italic text-slate-400 leading-relaxed font-serif text-lg">
          "{QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length]}"
        </p>
      </div>

      <div className="pt-4 space-y-4">
        <button 
          onClick={() => setActiveTab('vocab')}
          className="w-full bg-sunset hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 zen-shadow active:scale-95"
        >
          <span>开始今日冲刺</span>
          <ChevronRight size={20} />
        </button>

        <div className="glass rounded-3xl p-6 space-y-4 border border-sunset/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Sparkles size={16} className="mr-2 text-sunset" />
              AI 禅意学长
            </h3>
            <button 
              onClick={() => setActiveTab('ai')}
              className="text-[10px] bg-sunset/20 text-sunset px-3 py-1 rounded-full font-bold hover:bg-sunset hover:text-white transition-all"
            >
              立即咨询
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            遇到语法难题或单词记不住？点击咨询你的专属 AI 导师，开启 1 对 1 深度辅导。
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderVocab = () => {
    if (quizFinished) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-sunset flex items-center justify-center">
              <Trophy size={48} className="text-sunset" />
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-white text-night px-3 py-1 rounded-full font-bold text-sm"
            >
              {Math.round((quizScore / quizQuestions.length) * 100)}%
            </motion.div>
          </div>
          
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">练习已完成</h2>
            <p className="text-slate-400 mt-2">凡心所向，素履以往。</p>
          </div>

          {quizWrongWords.length > 0 && (
            <div className="w-full glass rounded-3xl p-6 text-left">
              <h3 className="text-sm text-slate-500 mb-3">薄弱词汇</h3>
              <div className="flex flex-wrap gap-2">
                {quizWrongWords.map(w => (
                  <span key={w.en} className="px-3 py-1 bg-sunset/20 text-sunset rounded-full text-xs font-medium border border-sunset/30">
                    {w.en}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => setQuizMode('none')}
            className="w-full glass py-4 rounded-2xl font-bold text-slate-300 hover:bg-white/5 transition-colors"
          >
            返回列表
          </button>
        </motion.div>
      );
    }

    if (quizMode !== 'none') {
      const currentQ = quizQuestions[currentQIdx];
      const options = quizMode === 'en-cn' 
        ? [currentQ.cn, ...WORDS_DB.filter(w => w.cn !== currentQ.cn).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.cn)].sort(() => Math.random() - 0.5)
        : [currentQ.en, ...WORDS_DB.filter(w => w.en !== currentQ.en).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.en)].sort(() => Math.random() - 0.5);

      return (
        <div className="space-y-8">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="font-mono">{currentQIdx + 1} / {quizQuestions.length}</span>
            <button onClick={() => setQuizMode('none')} className="hover:text-white">退出</button>
          </div>

          <motion.div 
            key={currentQIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-[2.5rem] p-12 text-center zen-shadow"
          >
            <h3 className="text-4xl font-bold tracking-tight text-white font-serif">
              {quizMode === 'en-cn' || quizMode === 'spelling' ? currentQ.en : currentQ.cn}
            </h3>
            <button 
              onClick={() => speak(currentQ.en)}
              className="mt-4 p-2 text-slate-500 hover:text-sunset transition-colors"
            >
              <Volume2 size={20} />
            </button>
          </motion.div>

          <div className="space-y-3">
            {quizMode === 'spelling' ? (
              <div className="space-y-4">
                <input 
                  type="text"
                  value={spellingInput}
                  onChange={(e) => setSpellingInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnswer(spellingInput.trim().toLowerCase() === currentQ.en.toLowerCase())}
                  placeholder="输入单词拼写..."
                  className="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-5 text-center text-xl focus:outline-none focus:border-sunset transition-colors"
                  autoFocus
                />
                <button 
                  onClick={() => handleAnswer(spellingInput.trim().toLowerCase() === currentQ.en.toLowerCase())}
                  className="w-full bg-sunset py-4 rounded-2xl font-bold text-white zen-shadow"
                >
                  确认提交
                </button>
              </div>
            ) : (
              options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(opt === (quizMode === 'en-cn' ? currentQ.cn : currentQ.en))}
                  className="w-full glass rounded-2xl p-5 text-left text-slate-300 hover:border-sunset/50 hover:bg-sunset/5 transition-all flex justify-between items-center group"
                >
                  <span>{opt}</span>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-sunset" />
                </motion.button>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <h2 className="text-xl font-bold text-white">选择练习模式</h2>
        <div className="grid gap-4">
          {[
            { id: 'en-cn', title: '看英文选中文', icon: <BookOpen size={20} /> },
            { id: 'cn-en', title: '看中文选英文', icon: <BookOpen size={20} /> },
            { id: 'spelling', title: '拼写填空', icon: <MessageSquare size={20} /> }
          ].map(mode => (
            <button 
              key={mode.id}
              onClick={() => startQuiz(mode.id as any)}
              className="glass rounded-2xl p-6 text-left flex items-center justify-between group hover:border-sunset/50 transition-all active:scale-95"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-sunset/10 rounded-xl text-sunset group-hover:bg-sunset group-hover:text-white transition-colors">
                  {mode.icon}
                </div>
                <span className="font-semibold text-lg">{mode.title}</span>
              </div>
              <ChevronRight size={20} className="text-slate-600 group-hover:text-sunset" />
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderSpeaking = () => {
    if (currentTask) {
      return (
        <div className="space-y-8">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="font-medium">{currentTask.title}</span>
            <button onClick={() => { setCurrentTask(null); setSpeakingFeedback(null); }} className="hover:text-white">返回列表</button>
          </div>

          <div className="glass rounded-[2.5rem] p-8 space-y-6 zen-shadow">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-sunset/10 rounded-2xl text-sunset">
                <Volume2 size={24} onClick={() => speak(currentTask.prompt)} className="cursor-pointer" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">AI 考官读题中</span>
            </div>
            <p className="text-lg text-slate-200 leading-relaxed font-serif">
              {currentTask.prompt}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onMouseDown={startRecording}
              onTouchStart={startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all zen-shadow ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-sunset'}`}
            >
              <Mic2 size={32} />
            </motion.button>
            <p className="text-sm text-slate-500 font-medium tracking-wide">
              {isRecording ? "正在倾听..." : "按住说话"}
            </p>
          </div>

          <AnimatePresence>
            {speakingFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-[2.5rem] p-8 space-y-6 zen-shadow border-sunset/20"
              >
                <div className="flex justify-between items-end">
                  <h4 className="text-xl font-bold text-white">AI 评分报告</h4>
                  <span className="text-4xl font-bold text-sunset">{speakingFeedback.total}<span className="text-sm text-slate-500 font-normal">/20</span></span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '流利度', score: speakingFeedback.fluency },
                    { label: '准确性', score: speakingFeedback.accuracy },
                    { label: '语调', score: speakingFeedback.intonation },
                    { label: '语法', score: speakingFeedback.grammar }
                  ].map(s => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
                      <span className="text-xs text-slate-400">{s.label}</span>
                      <span className="text-sm font-bold text-slate-200">{s.score}/4</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-sunset font-bold mr-2">建议:</span>
                    {speakingFeedback.advice}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2 font-bold">参考回答</p>
                  <p className="text-xs text-slate-500 italic">{currentTask.ref}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <h2 className="text-xl font-bold text-white">口语真题模拟</h2>
        <div className="space-y-4">
          {SPEAKING_TASKS.map(task => (
            <button 
              key={task.id}
              onClick={() => startSpeakingTask(task)}
              className="w-full glass rounded-3xl p-6 text-left group hover:border-sunset/50 transition-all active:scale-95"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white">{task.title}</h3>
                <span className="text-[10px] bg-sunset/10 text-sunset px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
                  {task.type === 'read' ? 'Part A' : task.type === 'qa' ? 'Part B' : 'Part C'}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {task.prompt}
              </p>
              <div className="mt-4 flex items-center text-sunset text-xs font-bold">
                <span>开始练习</span>
                <ChevronRight size={14} className="ml-1" />
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  const startSpeakingTask = (task: SpeakingTask) => {
    setCurrentTask(task);
    setSpeakingFeedback(null);
    setSpeakingTranscript('');
    speak(task.prompt);
  };

  const renderGrammar = () => {
    if (grammarFinished) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
        >
          <div className="w-32 h-32 rounded-full border-4 border-sunset flex items-center justify-center">
            <BrainCircuit size={48} className="text-sunset" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">语法挑战完成</h2>
            <p className="text-slate-400 mt-2">得分：{grammarScore} / {GRAMMAR_TASKS.length}</p>
          </div>
          <button 
            onClick={() => { setGrammarFinished(false); setGrammarIdx(0); setGrammarScore(0); }}
            className="w-full bg-sunset py-4 rounded-2xl font-bold text-white zen-shadow"
          >
            再练一次
          </button>
        </motion.div>
      );
    }

    const current = GRAMMAR_TASKS[grammarIdx];

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span className="font-mono">{grammarIdx + 1} / {GRAMMAR_TASKS.length}</span>
          <span className="font-bold text-sunset">语法填空</span>
        </div>

        <div className="glass rounded-[2.5rem] p-10 text-center zen-shadow min-h-[150px] flex items-center justify-center">
          <p className="text-xl text-slate-200 leading-relaxed font-serif">
            {current.question}
          </p>
        </div>

        <div className="space-y-3">
          {current.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={!!grammarFeedback}
              onClick={() => handleGrammarAnswer(opt)}
              className={`w-full glass rounded-2xl p-5 text-left transition-all flex justify-between items-center group ${grammarFeedback ? 'opacity-50' : 'hover:border-sunset/50'}`}
            >
              <span className="text-slate-300">{opt}</span>
              <ArrowRight size={18} className="text-slate-600 group-hover:text-sunset" />
            </button>
          ))}
        </div>

        <AnimatePresence>
          {grammarFeedback && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-6 rounded-3xl text-sm leading-relaxed zen-shadow ${grammarFeedback.startsWith('正确') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
            >
              {grammarFeedback}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderAuth = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[90vh] px-8 text-center py-12"
    >
      <div className="mb-10">
        <div className="w-20 h-20 bg-sunset rounded-[2rem] flex items-center justify-center mx-auto mb-6 zen-shadow rotate-12">
          <Sparkles size={40} className="text-white -rotate-12" />
        </div>
        <h1 className="text-3xl font-bold text-white font-serif tracking-tight">高考英语冲刺</h1>
        <p className="text-slate-500 mt-2 tracking-widest uppercase text-[10px] font-bold">单词口语 · 禅意双杀</p>
      </div>

      <div className="w-full space-y-4 glass p-8 rounded-[2.5rem] border border-white/5">
        <h2 className="text-xl font-bold text-white mb-6 font-serif">
          {authMode === 'login' ? '欢迎归位' : '开启修行'}
        </h2>
        
        <div className="space-y-4">
          {authMode === 'register' && (
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text"
                placeholder="用户名 (如: 提分小能手)"
                value={authInputs.username}
                onChange={(e) => setAuthInputs({ ...authInputs, username: e.target.value })}
                className="w-full bg-night/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-sunset transition-colors"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="账号 (手机号/邮箱)"
              value={authInputs.account}
              onChange={(e) => setAuthInputs({ ...authInputs, account: e.target.value })}
              className="w-full bg-night/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-sunset transition-colors"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="password"
              placeholder="密码"
              value={authInputs.password}
              onChange={(e) => setAuthInputs({ ...authInputs, password: e.target.value })}
              className="w-full bg-night/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-sunset transition-colors"
            />
          </div>
        </div>

        <button 
          onClick={handleAuth}
          className="w-full bg-sunset text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 zen-shadow active:scale-95 transition-all mt-4"
        >
          {authMode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
          <span>{authMode === 'login' ? '立即登录' : '注册并开启'}</span>
        </button>

        <div className="pt-4">
          <button 
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-xs text-slate-500 hover:text-sunset transition-colors font-medium"
          >
            {authMode === 'login' ? '还没有账号？去注册' : '已有账号？去登录'}
          </button>
        </div>
      </div>

      <p className="mt-10 text-[10px] text-slate-700 leading-relaxed max-w-[220px]">
        登录即代表您同意《用户协议》与《隐私政策》，数据将加密存储于本地。
      </p>
    </motion.div>
  );

  const renderAI = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full space-y-4"
    >
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {chatHistory.length === 0 && (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-sunset/10 rounded-full flex items-center justify-center mx-auto text-sunset">
              <Sparkles size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">我是你的 AI 禅意学长</h3>
              <p className="text-sm text-slate-500 mt-2">关于高考英语，任何疑惑都可以问我</p>
            </div>
            <div className="grid grid-cols-1 gap-2 max-w-[280px] mx-auto">
              {[
                "这个应用有哪些核心功能？",
                "如何利用遗忘曲线背单词？",
                "帮我分析一下'虚拟语气'的考点",
                "给我一个今天所学单词的例句"
              ].map(q => (
                <button 
                  key={q}
                  onClick={() => sendChatMessage(q)}
                  className="text-xs text-slate-400 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-sunset/10 hover:border-sunset/30 transition-all text-left flex items-center justify-between group"
                >
                  <span>{q}</span>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-sunset" />
                </button>
              ))}
            </div>
          </div>
        )}
        
        {chatHistory.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-sunset text-white rounded-tr-none' 
                : 'glass text-slate-200 rounded-tl-none border-white/5'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass p-4 rounded-2xl rounded-tl-none border-white/5 flex space-x-1">
              <div className="w-1.5 h-1.5 bg-sunset rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-sunset rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-sunset rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <div className="relative">
          <input 
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder="输入你的问题..."
            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 pr-12 text-sm focus:outline-none focus:border-sunset transition-colors"
          />
          <button 
            onClick={() => sendChatMessage()}
            disabled={!chatInput.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-sunset hover:scale-110 transition-transform disabled:opacity-50"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-6 py-4">
        <div className="w-20 h-20 rounded-full bg-sunset flex items-center justify-center text-3xl font-bold text-white zen-shadow ring-4 ring-sunset/20">
          {currentUser?.username.charAt(0) || '学'}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{currentUser?.username || '高考战士'}</h2>
          <p className="text-sm text-slate-500 mt-1">不经一番寒彻骨，怎得梅花扑鼻香</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-6">
          <p className="text-sunset font-bold text-2xl">{userData.errors.length}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">错题本词数</p>
        </div>
        <div className="glass rounded-3xl p-6">
          <p className="text-blue-400 font-bold text-2xl">A+</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">综合评价</p>
        </div>
      </div>

      <div className="glass rounded-[2rem] overflow-hidden">
        {[
          { label: '词库选择', value: '高考核心3500词', icon: <BookOpen size={18} /> },
          { label: '复习提醒', value: '已开启', icon: <Calendar size={18} /> },
          { label: '退出登录', value: '切换账号', icon: <LogIn size={18} />, action: () => {
            setIsLoggedIn(false);
            setCurrentUser(null);
          }},
          { label: '清空数据', value: '危险操作', icon: <Trash2 size={18} />, color: 'text-red-400', action: () => {
            if (confirm('确定要清空所有数据吗？')) {
              localStorage.removeItem('gaokao_sprint_data');
              window.location.reload();
            }
          }}
        ].map((item, idx) => (
          <button 
            key={idx}
            onClick={item.action}
            className="w-full p-5 flex justify-between items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center space-x-3 text-slate-300">
              <span className="text-slate-500">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className={`text-xs font-bold ${item.color || 'text-slate-500'}`}>{item.value}</span>
          </button>
        ))}
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] text-slate-700 uppercase tracking-[0.2em] font-bold">
          Version 1.0.0 · 禅意冲刺
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-night relative overflow-hidden">
      {!isLoggedIn ? renderAuth() : (
        <>
          {/* Background Glow */}
          <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-sunset/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Header */}
          <header className="p-8 pt-12 flex justify-between items-end z-10">
            <div>
              <h1 className="text-2xl font-bold text-sunset tracking-tight font-serif">
                {activeTab === 'home' ? '静心 · 冲刺' : 
                 activeTab === 'vocab' ? '单词 · 攻坚' : 
                 activeTab === 'grammar' ? '语法 · 磨砺' :
                 activeTab === 'speaking' ? '口语 · 突破' :
                 activeTab === 'ai' ? 'AI · 导师' : '我的 · 禅境'}
              </h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1 font-bold">
                距离高考还有 <span className="text-sunset">{daysToGaokao}</span> 天
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('profile' as any)}
              className="w-10 h-10 rounded-full bg-sunset flex items-center justify-center text-sm font-bold text-white zen-shadow ring-2 ring-sunset/20 active:scale-95 transition-transform"
            >
              学
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 px-8 pb-32 z-10 overflow-y-auto">
            {activeTab === 'home' && renderHome()}
            {activeTab === 'vocab' && renderVocab()}
            {activeTab === 'grammar' && renderGrammar()}
            {activeTab === 'speaking' && renderSpeaking()}
            {activeTab === 'ai' && renderAI()}
            {(activeTab as any) === 'profile' && renderProfile()}
          </main>

          {/* Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-white/5 px-6 py-6 flex justify-between items-center z-50 rounded-t-[2.5rem] zen-shadow">
            {[
              { id: 'home', icon: <Home size={20} />, label: '首页' },
              { id: 'vocab', icon: <BookOpen size={20} />, label: '单词' },
              { id: 'grammar', icon: <BrainCircuit size={20} />, label: '语法' },
              { id: 'speaking', icon: <Mic2 size={20} />, label: '口语' },
              { id: 'ai', icon: <Sparkles size={20} />, label: 'AI导师' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center space-y-1.5 transition-all ${activeTab === tab.id ? 'text-sunset scale-110' : 'text-slate-600 hover:text-slate-400'}`}
              >
                {tab.icon}
                <span className="text-[8px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
