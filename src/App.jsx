import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  CheckCircle, 
  BarChart2, 
  Settings, 
  Bot, 
  User, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Save,
  LayoutTemplate,
  AlertCircle,
  Cpu,
  Zap,
  MessageSquare, // 新增图标: 用于 Prompt 按钮
  X 
} from 'lucide-react';

// --- 1. 模拟数据与配置 ---

const AVAILABLE_MODELS = [
  { id: 'deepseek-v2', name: 'DeepSeek V2', provider: 'DeepSeek', icon: '🐳', type: 'open-weight' },
  { id: 'doubao-pro', name: '豆包 Pro (Doubao)', provider: 'ByteDance', icon: '🥟', type: 'cloud' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: '🧠', type: 'cloud' },
  { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: '🤖', type: 'cloud' }
];

const MOCK_PRD_TEMPLATE = `## 功能模块：用户登录与注册

### 1. 登录功能
用户可以使用手机号或邮箱进行登录。
- 如果输入手机号，需校验格式并发送验证码。
- 如果输入邮箱，需校验邮箱格式并输入密码。
- 支持 "忘记密码" 流程。

### 2. 注册功能
- 新用户需填写昵称、密码（包含大小写字母和数字，至少8位）。
- 注册成功后自动跳转至首页。
- 若用户已存在，提示"该账号已注册"。

### 3. 异常处理
- 连续输错5次密码，锁定账号30分钟。
- 网络超时需提示 "请检查网络连接"。`;

const DEFAULT_SYSTEM_PROMPT = `你是一个资深的 QA 测试专家。请根据用户提供的产品需求文档 (PRD)，设计一套覆盖全面、逻辑严密的测试用例。

要求：
1. 包含前置条件、操作步骤、预期结果。
2. 覆盖正常路径（Happy Path）和常见的异常路径（Exception Path）。
3. 步骤描述清晰，预期结果明确。
4. 尽量考虑到边界值测试。`;

// --- 2. 主组件实现 ---

export default function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [prdContent, setPrdContent] = useState(MOCK_PRD_TEMPLATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCases, setGeneratedCases] = useState([]);
  
  // ★★★ 新增：Prompt 配置相关状态 ★★★
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [showPromptConfig, setShowPromptConfig] = useState(false);
  
  // 评测相关状态
  const [humanCases, setHumanCases] = useState(''); 
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // --- 核心逻辑 ---

  const handleGenerate = async () => {
    if (!prdContent.trim()) return;
    setIsGenerating(true);
    
    // --- 这里是模拟生成逻辑 (为了让你现在就能看到效果) ---
    // 将来有了后端，把下面这段 setTimeout 删掉，用 fetch 替换
    
    // --- 将来连接真实后端时，请解开这段注释 ---
    try {
      const response = await fetch('https://auto-test-backend-production.up.railway.app/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prd_content: prdContent,
          model_id: selectedModel.id,
          system_prompt: systemPrompt // 把你修改的 Prompt 传给后端
        })
      });
      const data = await response.json();
      setGeneratedCases(data.cases);
    } catch (e) {
      console.error(e);
      alert("连接失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setEvalResult({
        score: 88,
        metrics: { coverage: 92, accuracy: 85, redundancy: 10, formatCompliance: 100 },
        analysis: `模型 ${selectedModel.name} 生成的用例在边界条件覆盖上表现良好。`,
        comparison: [
          { aspect: '异常场景覆盖', aiScore: 9, humanScore: 8, comment: 'AI 能够联想到更多边缘场景' },
          { aspect: '业务逻辑深度', aiScore: 7, humanScore: 9, comment: '人工用例更符合隐性规则' },
          { aspect: '描述清晰度', aiScore: 9, humanScore: 7, comment: 'AI 步骤描述更加标准化' }
        ]
      });
      setIsEvaluating(false);
    }, 2000);
  };

  // --- 3. 界面渲染 ---

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden selection:bg-blue-100">
      {/* 左侧导航栏 */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Bot size={20} />
          </div>
          <h1 className="font-bold text-lg text-slate-800 tracking-tight">AutoTest Agent</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            active={activeTab === 'generate'} 
            onClick={() => setActiveTab('generate')}
            icon={<FileText size={18} />} 
            label="用例生成" 
            desc="PRD 转测试用例"
          />
          <NavItem 
            active={activeTab === 'evaluate'} 
            onClick={() => setActiveTab('evaluate')}
            icon={<BarChart2 size={18} />} 
            label="自动评测" 
            desc="AI vs 人工质量对比"
          />
          <NavItem 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            icon={<Settings size={18} />} 
            label="模型配置" 
            desc="接入 DeepSeek/豆包"
          />
        </nav>

        <div className="p-4 bg-slate-50 m-4 rounded-xl border border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">当前模型</div>
          <div className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200 shadow-sm">
            <span className="text-xl">{selectedModel.icon}</span>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium truncate">{selectedModel.name}</div>
              <div className="text-xs text-slate-400">{selectedModel.provider}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部 Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>工作台</span>
            <ChevronRight size={14} />
            <span className="text-slate-800 font-medium">
              {activeTab === 'generate' ? '用例生成' : activeTab === 'evaluate' ? '效能评测' : '系统配置'}
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                <Zap size={12} />
                <span>Token 充足</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-200 border border-white shadow-sm flex items-center justify-center text-slate-500">
                <User size={16} />
             </div>
          </div>
        </header>

        {/* 内容视窗 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full">
            
            {activeTab === 'generate' && (
              <div className="grid grid-cols-12 gap-6 h-full">
                {/* 输入区域 */}
                <div className="col-span-5 flex flex-col gap-4 h-full">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                      <div className="flex items-center gap-2">
                        <LayoutTemplate size={16} className="text-blue-600" />
                        <h3 className="font-semibold text-slate-700">PRD 需求文档</h3>
                      </div>
                      <div className="flex gap-2">
                        {/* ★★★ 这里是修改 Prompt 的按钮 ★★★ */}
                        <button 
                          onClick={() => setShowPromptConfig(!showPromptConfig)}
                          className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${showPromptConfig ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'}`}
                          title="自定义 System Prompt"
                        >
                          <MessageSquare size={12} />
                          {showPromptConfig ? '收起 Prompt' : '修改 Prompt'}
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1 self-center"></div>
                        <button 
                          onClick={() => setPrdContent(MOCK_PRD_TEMPLATE)}
                          className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          <RefreshCw size={12} /> 重置
                        </button>
                      </div>
                    </div>
                    
                    {/* ★★★ Prompt 配置面板 (可折叠区域) ★★★ */}
                    {showPromptConfig && (
                      <div className="bg-blue-50/50 border-b border-slate-100 p-3 shrink-0 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                             <Settings size={10} /> System Prompt (系统提示词)
                          </span>
                        </div>
                        <textarea 
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          className="w-full h-24 text-xs bg-white border border-blue-100 rounded-lg p-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono resize-none"
                          placeholder="在此输入系统级提示词..."
                        />
                        <div className="text-[10px] text-blue-400 mt-1 text-right">
                          此提示词将决定 AI 生成用例的风格与规范
                        </div>
                      </div>
                    )}

                    <textarea 
                      className="flex-1 w-full p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm leading-relaxed text-slate-700 font-mono bg-transparent"
                      placeholder="在此粘贴 PRD 文本，或输入需求描述..."
                      value={prdContent}
                      onChange={(e) => setPrdContent(e.target.value)}
                    />
                    <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                          isGenerating 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98]'
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            正在思考中...
                          </>
                        ) : (
                          <>
                            <Cpu size={18} />
                            开始生成测试用例
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs text-slate-400 mt-2">
                        当前使用模型: {selectedModel.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 输出区域 */}
                <div className="col-span-7 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-500" />
                      生成结果
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-normal">
                        {generatedCases.length} 条用例
                      </span>
                    </h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded shadow-sm hover:bg-slate-50 flex items-center gap-1">
                         <Copy size={12} /> 复制
                      </button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded shadow-sm hover:bg-slate-50 flex items-center gap-1">
                         <Save size={12} /> 导出
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {generatedCases.length === 0 ? (
                      <EmptyState 
                        icon={<Bot size={48} className="text-slate-200" />}
                        title="等待生成"
                        desc="在左侧输入 PRD 并点击生成按钮，AI 将自动拆解测试点。"
                      />
                    ) : (
                      generatedCases.map((tc, index) => (
                        <TestCaseCard key={tc.id} data={tc} index={index} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'evaluate' && (
              <div className="h-full flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-6 h-[40%]">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-700 text-sm">1. 待评测用例 (AI)</h4>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        已加载 {generatedCases.length} 条
                      </span>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded border border-slate-100 p-3 overflow-hidden text-xs text-slate-500 font-mono relative">
                       {generatedCases.length > 0 ? JSON.stringify(generatedCases.map(c => ({title: c.title, steps: c.steps})), null, 2) : '暂无数据，请先去生成用例...'}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="font-semibold text-slate-700 text-sm">2. 基准用例 (人工/Golden Set)</h4>
                    </div>
                    <textarea 
                      className="flex-1 w-full bg-white border border-slate-200 rounded p-3 text-xs font-mono resize-none focus:outline-blue-500"
                      placeholder="在此粘贴人工编写的高质量用例..."
                      value={humanCases}
                      onChange={(e) => setHumanCases(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <BarChart2 size={20} className="text-purple-600" />
                      评测报告
                    </h3>
                    <button 
                      onClick={handleEvaluate}
                      disabled={isEvaluating || generatedCases.length === 0}
                      className={`px-6 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                        isEvaluating 
                        ? 'bg-slate-100 text-slate-400' 
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20'
                      }`}
                    >
                      {isEvaluating ? '正在分析差异...' : '开始自动评测'}
                    </button>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto">
                    {!evalResult ? (
                       <EmptyState 
                         icon={<AlertCircle size={48} className="text-slate-200" />}
                         title="暂无评测数据"
                         desc="输入人工基准用例并点击评测按钮，查看 AI 生成质量报告。"
                       />
                    ) : (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-4 gap-4">
                           <MetricCard label="综合得分" value={evalResult.score} color="text-purple-600" sub="优于 80% 历史记录" />
                           <MetricCard label="需求覆盖率" value={`${evalResult.metrics.coverage}%`} color="text-blue-600" sub="漏测风险低" />
                           <MetricCard label="逻辑准确性" value={`${evalResult.metrics.accuracy}%`} color="text-green-600" sub="关键路径正确" />
                           <MetricCard label="格式合规度" value={`${evalResult.metrics.formatCompliance}%`} color="text-orange-600" sub="完全符合模板" />
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="col-span-2 space-y-4">
                             <h4 className="font-bold text-slate-800">AI vs 人工 维度对比</h4>
                             <div className="space-y-3">
                               {evalResult.comparison.map((comp, i) => (
                                 <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex justify-between mb-2">
                                      <span className="font-medium text-sm text-slate-700">{comp.aspect}</span>
                                      <span className="text-xs text-slate-400">{comp.comment}</span>
                                    </div>
                                    <div className="h-2 flex rounded-full overflow-hidden">
                                       <div style={{width: `${comp.aiScore * 10}%`}} className="bg-blue-500 h-full"></div>
                                       <div style={{width: `${comp.humanScore * 10}%`}} className="bg-green-500 h-full"></div>
                                    </div>
                                 </div>
                               ))}
                             </div>
                          </div>
                          <div className="col-span-1 bg-blue-50 rounded-xl p-5 border border-blue-100">
                             <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                               <Bot size={16} /> 模型建议
                             </h4>
                             <p className="text-sm text-blue-700 leading-relaxed">{evalResult.analysis}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 配置页面略 (Settings) */}
            {activeTab === 'settings' && (
               <div className="h-full flex items-center justify-center text-slate-400">
                 这里可以放置模型 API Key 配置表单
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- 4. 子组件 ---

function NavItem({ active, icon, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
        active 
          ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <div className={`mt-0.5 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
        {icon}
      </div>
      <div>
        <div className="font-semibold text-sm">{label}</div>
        <div className={`text-xs mt-0.5 ${active ? 'text-blue-500' : 'text-slate-400'}`}>{desc}</div>
      </div>
    </button>
  );
}

function TestCaseCard({ data, index }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 bg-slate-50/50 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {data.id}
          </span>
          <h4 className="font-semibold text-sm text-slate-700">{data.title}</h4>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium border border-blue-100">
             {data.type}
           </span>
           <ChevronDown size={14} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 border-t border-slate-100 text-sm space-y-3">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">前置条件</span>
            <p className="mt-1 text-slate-700 bg-slate-50 p-2 rounded border border-slate-100/50">{data.precondition}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">操作步骤</span>
              <ul className="mt-1 space-y-1 text-slate-700">
                {data.steps.map((step, i) => (
                  <li key={i} className="flex gap-2">
                     <span className="text-slate-400 shrink-0">•</span>
                     <span>{step.replace(/^\d+\.\s/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">预期结果</span>
               <div className="mt-1 text-green-700 bg-green-50 p-2 rounded border border-green-100/50 flex gap-2 items-start">
                  <CheckCircle size={14} className="mt-0.5 shrink-0" />
                  {data.expected}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color, sub }) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
       <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</div>
       <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
       <div className="text-[10px] text-slate-400">{sub}</div>
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
      <div className="mb-4 animate-bounce-slow">{icon}</div>
      <h4 className="font-semibold text-slate-700 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-xs">{desc}</p>
    </div>
  );
}