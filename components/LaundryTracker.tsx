import React from 'react';
import { AppState, LaundryStatus, TransactionType } from '../types';
import { Shirt, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface LaundryTrackerProps {
  state: AppState;
  onUpdateStatus: (id: string, status: LaundryStatus) => void;
}

const STATUS_COLS = [
  { id: LaundryStatus.RECEIVED, label: 'Received', color: 'bg-slate-700' },
  { id: LaundryStatus.WASHING, label: 'Washing', color: 'bg-blue-900/40' },
  { id: LaundryStatus.DRYING, label: 'Drying', color: 'bg-amber-900/40' },
  { id: LaundryStatus.READY, label: 'Ready', color: 'bg-emerald-900/40' },
];

export const LaundryTracker: React.FC<LaundryTrackerProps> = ({ state, onUpdateStatus }) => {
  const orders = state.transactions
    .filter(t => t.branch === state.currentBranch && t.type === TransactionType.LAUNDRY);

  const getNextStatus = (current: LaundryStatus): LaundryStatus | null => {
    const sequence = [
      LaundryStatus.RECEIVED,
      LaundryStatus.WASHING,
      LaundryStatus.DRYING,
      LaundryStatus.READY,
      LaundryStatus.DELIVERED
    ];
    const idx = sequence.indexOf(current);
    return idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : null;
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shirt className="text-amber-500" /> Laundry Service Tracking
            </h2>
            <div className="text-sm text-slate-400">
                Drag and drop functionality simulated by clicking 'Next'
            </div>
        </div>

        <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 h-full min-w-[1000px] pb-4">
                {STATUS_COLS.map(col => (
                    <div key={col.id} className="flex-1 flex flex-col bg-slate-800/50 rounded-xl border border-slate-700/50 min-w-[250px]">
                        <div className={`p-3 rounded-t-xl font-bold text-white text-center border-b border-slate-700 ${col.color}`}>
                            {col.label}
                        </div>
                        <div className="p-3 space-y-3 overflow-y-auto flex-1">
                            {orders.filter(o => o.details.status === col.id).map(order => (
                                <div key={order.id} className="bg-slate-800 p-4 rounded-lg border border-slate-600 shadow-md group hover:border-amber-500/50 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-white text-sm">{order.customerName}</span>
                                        <span className="text-xs text-slate-500 font-mono">#{order.id.slice(-4)}</span>
                                    </div>
                                    <div className="space-y-1 mb-3">
                                        {order.details.items.map((item: any, idx: number) => (
                                            <div key={idx} className="text-xs text-slate-300 flex justify-between">
                                                <span>{item.quantity}x {item.itemName}</span>
                                                <span className="text-slate-500">{item.serviceType}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                                        <div className="text-amber-500 text-xs font-mono font-bold">
                                            {new Date(order.details.estimatedReady).toLocaleDateString()}
                                        </div>
                                        {getNextStatus(order.details.status) && (
                                            <button 
                                                onClick={() => onUpdateStatus(order.id, getNextStatus(order.details.status)!)}
                                                className="bg-slate-700 hover:bg-slate-600 text-white p-1 rounded transition-colors"
                                                title="Move to next stage"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {orders.filter(o => o.details.status === col.id).length === 0 && (
                                <div className="text-center text-slate-600 text-sm py-4 italic">No orders</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};