import React from 'react';
import { X, Copy, Check, FileJson } from 'lucide-react';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphJson: object;
}

export const JsonModal: React.FC<JsonModalProps> = ({ isOpen, onClose, graphJson }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(graphJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Compiled Agent JSON DAG Specification
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-purple-300 custom-scrollbar">
          <pre>{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span>This DAG schema is ingested directly by the Temporal workflow runtime engine.</span>
          <span className="font-mono text-slate-500">{jsonString.length} bytes</span>
        </div>
      </div>
    </div>
  );
};
