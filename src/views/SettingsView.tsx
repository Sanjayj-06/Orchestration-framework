import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, XCircle, Save, Settings } from 'lucide-react';
import { testProviderConnection } from '../services/api';

interface AIProvider {
  id: string;
  name: string;
  models: string[];
}

const PROVIDERS: AIProvider[] = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { id: 'gemini', name: 'Google Gemini', models: ['gemini-3.8-flash', 'gemini-flash-latest'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet', 'claude-3-opus'] }
];

export const SettingsView: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(PROVIDERS[0].models[0]);
  
  const [savedKeys, setSavedKeys] = useState<Record<string, string>>({});
  const [savedModels, setSavedModels] = useState<Record<string, string>>({});
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load from local storage
    const stored = localStorage.getItem('agentcraft_api_keys');
    if (stored) {
      try {
        const keys = JSON.parse(stored);
        setSavedKeys(keys);
      } catch {
        // ignore
      }
    }

    const storedModels = localStorage.getItem('agentcraft_models');
    if (storedModels) {
      try {
        const models = JSON.parse(storedModels);
        const obsolete = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];
        if (models['gemini'] && obsolete.includes(models['gemini'])) {
          models['gemini'] = 'gemini-3.8-flash';
          localStorage.setItem('agentcraft_models', JSON.stringify(models));
        }
        setSavedModels(models);
        if (models[selectedProvider]) {
          setSelectedModel(models[selectedProvider]);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setApiKey(''); // never show the saved key in the input field!
    setTestStatus('idle');
    const provider = PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setSelectedModel(savedModels[providerId] || provider.models[0]);
    }
  };

  const isConfigured = Boolean(savedKeys[selectedProvider]);
  const hasValidKey = Boolean(apiKey.trim() || isConfigured);
  const isFormValid = Boolean(selectedProvider && selectedModel && hasValidKey);
  const isSaveDisabled = !isFormValid || testStatus === 'testing';

  const handleSave = () => {
    const keyToSave = apiKey.trim() || savedKeys[selectedProvider];
    if (!keyToSave) return;

    if (apiKey.trim()) {
      const newKeys = { ...savedKeys, [selectedProvider]: apiKey.trim() };
      setSavedKeys(newKeys);
      localStorage.setItem('agentcraft_api_keys', JSON.stringify(newKeys));
      setApiKey(''); // clear it
    }

    if (selectedModel) {
      const newModels = { ...savedModels, [selectedProvider]: selectedModel };
      setSavedModels(newModels);
      localStorage.setItem('agentcraft_models', JSON.stringify(newModels));
    }

    alert(`${PROVIDERS.find(p => p.id === selectedProvider)?.name} Configuration Saved.`);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    
    const keyToTest = apiKey.trim() || savedKeys[selectedProvider];
    if (!keyToTest) {
      setTestStatus('error');
      return;
    }

    try {
      const success = await testProviderConnection(selectedProvider, keyToTest);
      if (success) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch {
      setTestStatus('error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 flex justify-center">
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Providers</h1>
            <p className="text-sm text-slate-500">Configure your AI Runtime connections</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800">AI Provider Configuration</h2>
            <p className="text-xs text-slate-500 mt-1">Select an AI provider and enter your API key to enable AI Runtime.</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Provider</label>
              <div className="flex gap-3">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProviderChange(p.id)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-semibold text-sm ${
                      selectedProvider === p.id 
                        ? 'border-blue-500 bg-blue-50/50 text-blue-700' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {p.name}
                    {savedKeys[p.id] && (
                      <span className="block text-[10px] text-emerald-600 font-normal mt-1">Configured</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Default Model</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {PROVIDERS.find(p => p.id === selectedProvider)?.models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">API Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    if (testStatus !== 'idle') setTestStatus('idle');
                  }}
                  placeholder={isConfigured ? "•••••••••••••••• (Key Saved)" : "Enter your API key..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Your key is stored securely in your browser's local storage and is never exposed or logged.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleTestConnection}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
              >
                Test Connection
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaveDisabled}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Save Configuration
              </button>
              
              <div className="ml-auto">
                {testStatus === 'testing' && <span className="text-sm font-semibold text-slate-400 flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"/> Testing...</span>}
                {testStatus === 'success' && <span className="text-sm font-semibold text-emerald-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Connection Successful</span>}
                {testStatus === 'error' && <span className="text-sm font-semibold text-red-600 flex items-center gap-2"><XCircle className="w-4 h-4" /> Connection Failed</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
