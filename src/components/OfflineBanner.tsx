import React, { useState, useEffect } from 'react';
import { storageSync, SyncState } from '../utils/storageSync';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>(storageSync.getSyncStatus());
  const [queueLength, setQueueLength] = useState<number>(0);
  const [isForceOffline, setIsForceOffline] = useState<boolean>(storageSync.getForceOffline());

  useEffect(() => {
    const unsubscribe = storageSync.subscribe((state, qLen) => {
      setSyncState(state);
      setQueueLength(qLen);
      setIsForceOffline(storageSync.getForceOffline());
    });
    return unsubscribe;
  }, []);

  const handleToggleOffline = () => {
    const nextVal = !isForceOffline;
    setIsForceOffline(nextVal);
    storageSync.setForceOffline(nextVal);
  };

  const handleManualSync = () => {
    storageSync.flushSyncQueue();
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Status Pill */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-colors ${
          syncState === 'synced'
            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
            : syncState === 'syncing'
            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
        }`}
      >
        {syncState === 'synced' && <CheckCircle2 size={12} className="text-emerald-400" />}
        {syncState === 'syncing' && <RefreshCw size={12} className="animate-spin text-amber-400" />}
        {syncState === 'offline' && <WifiOff size={12} className="text-zinc-400" />}

        <span className="text-[11px]">
          {syncState === 'synced'
            ? 'Real-Time Sync Active'
            : syncState === 'syncing'
            ? `Syncing (${queueLength})`
            : 'Offline Mode (Local Storage)'}
        </span>
      </div>

      {/* Manual Offline toggle button */}
      <button
        onClick={handleToggleOffline}
        className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all ${
          isForceOffline
            ? 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
            : 'bg-[#222530] text-gray-400 border-[#2b2f3e] hover:text-white'
        }`}
        title="Toggle simulated offline mode to test offline work"
      >
        {isForceOffline ? 'Go Online' : 'Work Offline'}
      </button>

      {queueLength > 0 && !isForceOffline && (
        <button
          onClick={handleManualSync}
          className="p-1 hover:text-white text-gray-400 transition-colors"
          title="Force flush sync queue"
        >
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  );
};
