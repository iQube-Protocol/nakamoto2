
import React from 'react';
import { WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

const ConnectionStatus = ({ status }: ConnectionStatusProps) => {
  if (status === 'connected') return null;
  
  return (
    <div className={`p-2 rounded text-sm flex items-center gap-2 mb-4 ${
      status === 'error' 
        ? 'bg-destructive/10 text-destructive' 
        : status === 'connecting'
          ? 'bg-amber-500/10 text-amber-500'
          : 'bg-slate-500/10 text-slate-500'
    }`}>
      {status === 'connecting' ? (
        <>
          <span className="animate-pulse">●</span>
          <span>Connecting to knowledge base...</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span>Disconnected from knowledge base</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;
