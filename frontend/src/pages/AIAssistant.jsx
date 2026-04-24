import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';

const AI_TOOLS = [
  { id: 'finance', icon: '💰', label: 'Financial Analysis', desc: 'Analyze financial data and trends', action: 'aiAnalyzeFinance' },
  { id: 'hr', icon: '👥', label: 'HR Insights', desc: 'Workforce analytics and recommendations', action: 'aiAnalyzeHR' },
  { id: 'sales', icon: '📈', label: 'Sales Forecast', desc: 'Sales predictions and strategy', action: 'aiForecastSales' },
  { id: 'inventory', icon: '🏭', label: 'Inventory Optimization', desc: 'Stock level recommendations', action: 'aiOptimizeInventory' },
  { id: 'risk', icon: '🛡️', label: 'Risk Assessment', desc: 'Compliance and project risk analysis', action: 'aiAssessRisk' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Welcome to the Oracle ERP AI Assistant. I can help you analyze your business data, generate insights, and provide recommendations. Ask me anything or use the quick analysis tools on the right.',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text, context) => {
    if (!text.trim() && !context) return;

    const userMessage = text || `Run ${context} analysis`;
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setInput('');
    setLoading(true);

    try {
      const result = await api.aiChat(userMessage, context || 'general');
      setMessages(prev => [...prev, {
        role: 'ai',
        content: result.response,
        model: result.model,
        usage: result.usage,
        timestamp: result.timestamp,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `**Error:** ${err.message}\n\nPlease make sure your OpenRouter API key is configured in the .env file.`,
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const runTool = async (tool) => {
    setMessages(prev => [...prev, {
      role: 'user',
      content: `Run ${tool.label}`,
      timestamp: new Date().toISOString(),
    }]);
    setLoading(true);

    try {
      const result = await api[tool.action]();
      setMessages(prev => [...prev, {
        role: 'ai',
        content: result.response,
        model: result.model,
        usage: result.usage,
        timestamp: result.timestamp,
        meta: {
          dataPoints: result.data_points || result.employees_analyzed || result.orders_analyzed || result.items_analyzed,
        },
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `**Error:** ${err.message}\n\nPlease make sure your OpenRouter API key is configured in the .env file.`,
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>AI Assistant</h2>
          <p>AI-powered business intelligence and analysis</p>
        </div>
      </div>

      <div className="ai-container">
        <div className="ai-chat">
          <div className="ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-message ${msg.role}`}>
                <div className="msg-label">{msg.role === 'user' ? 'You' : 'AI Assistant'}</div>
                <div className="msg-content">
                  {msg.role === 'ai' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === 'ai' && (msg.model || msg.usage) && (
                  <div className="msg-meta">
                    {msg.model && <span>Model: {msg.model}</span>}
                    {msg.usage?.total_tokens && <span>Tokens: {msg.usage.total_tokens}</span>}
                    {msg.meta?.dataPoints && <span>Data points: {msg.meta.dataPoints}</span>}
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="ai-message ai">
                <div className="msg-label">AI Assistant</div>
                <div className="msg-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    <span>Analyzing your data...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask about your business data, request analysis, or get recommendations..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button className="btn btn-primary" type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>

        <div className="ai-sidebar-panel">
          <h4 style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Quick Analysis Tools</h4>
          {AI_TOOLS.map(tool => (
            <div key={tool.id} className="ai-tool-card" onClick={() => !loading && runTool(tool)}>
              <h4>{tool.icon} {tool.label}</h4>
              <p>{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
