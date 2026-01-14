import React, { useState } from 'react';
import BrandLogo from './BrandLogo';
import { Sparkles, MessageSquare, Target, ArrowRight, CheckCircle2 } from 'lucide-react';

const LandingPage = ({ onStart, initialLang }) => {
  const [targetRole, setTargetRole] = useState('');
  const [selectedLang, setSelectedLang] = useState(initialLang || 'zh-CN');

  const handleStart = () => {
    if (targetRole.trim()) {
      onStart(targetRole, selectedLang);
    } else {
      // Modern toast could be better, but keeping alert for simplicity
      alert(selectedLang === 'zh-CN' ? "请输入目标岗位" : "Please enter your target role.");
    }
  };

  const texts = {
    'zh-CN': {
      brand: 'DeepInterview.ai',
      heroTitle: '让简历不仅仅是经历，',
      heroTitleHighlight: '更是影响力的证明。',
      heroDesc: '利用 AI 深度挖掘你的职业生涯，将琐碎的日常工作转化为结果导向、数据驱动的专业履历。',
      inputLabel: '你的目标岗位是？',
      inputPlaceholder: '例如：高级产品经理',
      cta: '开始构建简历',
      features: [
        { title: '结果导向', desc: '从“做了什么”转变为“达成了什么”。' },
        { title: '数据驱动', desc: '量化成果，让每一项成就都有据可依。' },
        { title: '精准匹配', desc: '针对目标岗位定制内容，直击痛点。' }
      ]
    },
    'en-US': {
      brand: 'DeepInterview.ai',
      heroTitle: 'Turn Experience into',
      heroTitleHighlight: 'Proven Impact.',
      heroDesc: 'Leverage AI to deeply analyze your career, transforming daily tasks into result-oriented, data-driven professional narratives.',
      inputLabel: 'Target Role',
      inputPlaceholder: 'e.g. Senior Product Manager',
      cta: 'Build My Resume',
      features: [
        { title: 'Result Oriented', desc: 'Shift from "what you did" to "what you achieved".' },
        { title: 'Data Driven', desc: 'Quantify success to make every achievement verifiable.' },
        { title: 'Precision Fit', desc: 'Tailored content that hits the target role requirements.' }
      ]
    }
  };

  const t = texts[selectedLang];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-slate-900 selection:bg-primary-100 selection:text-primary-900">
      
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <span className="text-xl font-bold tracking-tight text-slate-900">{t.brand}</span>
        </div>
        <div className="flex bg-white rounded-full p-1 border border-slate-200 shadow-sm">
          <button 
            onClick={() => setSelectedLang('zh-CN')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${selectedLang === 'zh-CN' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
          >
            CN
          </button>
          <button 
            onClick={() => setSelectedLang('en-US')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${selectedLang === 'en-US' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
          >
            EN
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 mt-10 md:mt-20 mb-20">
        <div className="max-w-4xl w-full text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium border border-primary-100 mb-4 animate-fade-in-up">
            <Sparkles size={16} />
            <span>AI-Powered Resume Architect</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
            {t.heroTitle} <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">
              {t.heroTitleHighlight}
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>

          {/* Input Card */}
          <div className="max-w-xl mx-auto mt-12 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white p-2 rounded-2xl shadow-xl border border-slate-100 flex items-center p-2">
              <div className="flex-grow px-4 py-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {t.inputLabel}
                </label>
                <input 
                  type="text" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  placeholder={t.inputPlaceholder}
                  className="w-full text-lg font-medium text-slate-900 placeholder-slate-300 focus:outline-none bg-transparent"
                />
              </div>
              <button 
                onClick={handleStart}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-4 font-semibold transition-all flex items-center gap-2 hover:shadow-lg active:scale-95"
              >
                {t.cta} <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 pt-16 border-t border-slate-200">
            {t.features.map((feature, idx) => (
              <div key={idx} className="text-left space-y-3 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300 border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 mb-2">
                  {idx === 0 ? <Target size={20}/> : idx === 1 ? <CheckCircle2 size={20}/> : <MessageSquare size={20}/>}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} DeepInterview.ai. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
