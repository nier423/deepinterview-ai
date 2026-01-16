import React, { useState, useEffect, useRef } from 'react';
import BrandLogo from './BrandLogo';
import ReactMarkdown from 'react-markdown';
import { 
  Send, ArrowLeft, FileText, CheckCircle, AlertCircle, RefreshCw, 
  Mic, MicOff, Copy, Download, Check, Sparkles, User
} from 'lucide-react';

const ChatInterface = ({ targetRole, language, onBack }) => {
  
  // 1. 配置参数
  const API_KEY = "sk-748e50d5490447cb822d78932389bf5e"; 
  const API_URL = "https://api.deepseek.com/chat/completions";
  const MODEL_ID = "deepseek-chat"; 

  // 2. 动态生成 System Prompt
  const langPrompt = language === 'zh-CN' 
    ? `请务必使用中文回复。` 
    : `Please reply in English.`;

  const SYSTEM_PROMPT = `
    你是一个大厂级别的简历优化专家 "DeepInterview AI"。
    你的核心目标是帮助用户将经历转化为符合【大厂 6 大原则】的简历 Bullet Points。
    ${langPrompt}

    【必须严格遵守的 6 大原则】：
    1. 结果导向 (Result First)：生成的简历内容必须【先写结果，再写过程】。
    2. 可量化 (Quantitative)：疯狂挖掘数字。
    3. 可验证 (Credible)：内容要真实合理。
    4. 岗位相关 (Relevant)：只保留与 "${targetRole}" 强相关的内容。
    5. 简洁 (Concise)：一句话表达一个点。
    6. 突出能力 (Skills-backed)：强调核心能力。

    【重要指令】：
    每次回复，你必须严格只输出一个标准的 JSON 对象，不要包含 Markdown 标记。
    JSON 格式：
    {
      "reply": "简短追问，语气专业。",
      "resumeMarkdown": "实时更新的简历内容 (Markdown格式)。",
      "progress": 0-100 (整数),
      "missingInfo": ["字符串数组", "列出缺失要素"]
    }
    
    当前上下文：用户目标岗位 "${targetRole}"。
  `;

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: language === 'zh-CN' 
        ? `你好！我是你的智能简历顾问。\n\n为了拿下 **${targetRole}** 这个岗位，我们需要打造一份【结果导向】且【数据驱动】的简历。\n\n请告诉我您最近负责的一个核心项目。它最终产出了什么结果？（请尽量提供数据，如收益、效率提升等）`
        : `Hello! I am your AI Resume Consultant.\n\nTo land the **${targetRole}** role, we need to craft a **Result-First** & **Data-Driven** resume.\n\nTell me about a core project you recently led. What was the ultimate OUTCOME? (Think metrics: Revenue, Efficiency, CTR).` 
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const initialResume = language === 'zh-CN' 
    ? `# ${targetRole}\n\n## 核心成就 (Result First)\n*等待数据输入... (例如：实现营收增长 30%...)*` 
    : `# ${targetRole}\n\n## Key Achievements (Result First)\n*Waiting for metrics... (e.g., Increased revenue by 30%...)*`;

  const [resumeContent, setResumeContent] = useState(initialResume);
  const [progress, setProgress] = useState(5);
  const [missingInfo, setMissingInfo] = useState(language === 'zh-CN' 
    ? ['量化结果', '核心能力', '产出'] 
    : ['Quantifiable Results', 'Core Skills', 'Outcome']);
  
  const [isCopied, setIsCopied] = useState(false);
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- 语音逻辑 ---
  const handleVoiceInput = () => {
     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
     if (!SpeechRecognition) { alert("Browser not supported."); return; }
     if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
     const recognition = new SpeechRecognition();
     recognition.lang = language;
     recognition.interimResults = true;
     recognition.continuous = true;
     let finalTranscript = '';
     recognition.onstart = () => setIsListening(true);
     recognition.onresult = (e) => {
        let interimTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
           if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
           else interimTranscript += e.results[i][0].transcript;
        }
        setInput(prev => finalTranscript + interimTranscript);
     };
     recognition.onerror = (e) => { console.error(e); setIsListening(false); };
     recognition.onend = () => setIsListening(false);
     recognitionRef.current = recognition;
     recognition.start();
  };

  // --- AI 发送逻辑 ---
  const handleSend = async () => {
    if (!input.trim()) return;

    if (isListening) {
      recognitionRef.current?.abort(); 
      setIsListening(false);
    }

    const userText = input;
    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    
    setInput('');
    setIsTyping(true);

    try {
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(m => ({ 
          role: m.sender === 'ai' ? 'assistant' : 'user', 
          content: m.text 
        })),
        { role: "user", content: userText }
      ];

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: apiMessages,
          temperature: 0.7,
          response_format: { type: "json_object" } 
        })
      });

      const data = await response.json();
      if (!data.choices || !data.choices[0]) throw new Error("API Error");

      const aiRawContent = data.choices[0].message.content;
      const cleanJsonString = aiRawContent.replace(/```json/g, "").replace(/```/g, "").trim();

      let parsedData;
      try {
        parsedData = JSON.parse(cleanJsonString);
      } catch (e) {
        parsedData = {
          reply: aiRawContent,
          resumeMarkdown: resumeContent,
          progress: progress,
          missingInfo: missingInfo
        };
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: parsedData.reply }]);
      if (parsedData.resumeMarkdown) setResumeContent(parsedData.resumeMarkdown);
      if (parsedData.progress !== undefined) setProgress(parsedData.progress);
      if (parsedData.missingInfo) setMissingInfo(parsedData.missingInfo);

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: "⚠️ Network Error." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([resumeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetRole.replace(/\s+/g, '_')}_Resume.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Left Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between z-10 sticky top-0">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} />
            <span className="font-semibold text-sm">Back</span>
          </button>
          
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Sparkles size={14} className="text-primary-500"/>
                {targetRole}
             </div>
          </div>
          
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {msg.sender === 'ai' ? (
                    <div className="bg-white p-1 rounded-full shadow-sm border border-slate-100">
                      <BrandLogo size="sm" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-md">
                      <User size={14} />
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.sender === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex w-full justify-start pl-12">
               <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                 <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                 <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                 <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-slate-50 to-transparent">
          <div className="max-w-3xl mx-auto relative bg-white rounded-2xl shadow-lg border border-slate-200 p-2 flex items-end gap-2 transition-shadow focus-within:shadow-xl focus-within:border-primary-200">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              placeholder={isListening ? "Listening..." : "Type your response..."}
              className={`w-full bg-transparent border-none p-3 resize-none focus:ring-0 max-h-32 min-h-[56px] text-sm text-slate-800 placeholder-slate-400 ${isListening ? 'animate-pulse text-primary-600' : ''}`}
              rows={1}
            />
            
            <div className="flex items-center gap-1 pb-2 pr-2">
              <button 
                onClick={handleVoiceInput} 
                className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-50 text-red-500' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                title="Voice Input"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              
              <button 
                onClick={handleSend} 
                disabled={!input.trim() || isTyping} 
                className="p-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-all shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <div className="text-center mt-2">
             <span className="text-[10px] text-slate-400">AI can make mistakes. Please review generated content.</span>
          </div>
        </div>
      </div>

      {/* Right: Resume Preview Area */}
      <div className="w-[500px] bg-slate-900 hidden md:flex flex-col border-l border-slate-800 shadow-2xl z-20">
        
        {/* Progress Header */}
        <div className="p-6 bg-slate-800/50 border-b border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-300 font-medium text-sm flex items-center gap-2">
              <RefreshCw size={14}/> {language === 'zh-CN' ? '完整度' : 'Completeness'}
            </h3>
            <span className="text-xl font-bold text-primary-400">{progress}%</span>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary-500 to-accent-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(56,189,248,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="space-y-2">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{language === 'zh-CN' ? '待优化' : 'To Improve'}</p>
             {missingInfo.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {missingInfo.map((tag, idx) => (
                   <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                     <AlertCircle size={10} /> {tag}
                   </span>
                 ))}
               </div>
             ) : (
               <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                 <CheckCircle size={14} /> All Set!
               </div>
             )}
          </div>
        </div>

        {/* ✨ 简历预览主体 ✨ */}
        <div className="flex-grow overflow-y-auto p-6 bg-slate-900 custom-scrollbar">
          <div className="bg-white min-h-[600px] p-8 shadow-2xl rounded-sm text-slate-800 text-sm leading-relaxed relative">
            
            {/* 模拟 A4 纸张顶部装饰 */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 opacity-50"></div>

            {/* Toolbar */}
            <div className="absolute top-4 right-4 flex items-center gap-1 print:hidden">
              <button 
                onClick={handleCopy} 
                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                title="Copy Markdown"
              >
                {isCopied ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
              </button>
              <button 
                onClick={handleDownload} 
                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                title="Download .md File"
              >
                <Download size={14}/>
              </button>
            </div>

            {/* 标题: Live Preview */}
            <div className="mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
               <FileText size={14} className="text-slate-300"/>
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Markdown Preview</span>
            </div>

            {/* 内容渲染 */}
            <div className="prose prose-sm prose-slate max-w-none font-serif">
              <ReactMarkdown>{resumeContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
