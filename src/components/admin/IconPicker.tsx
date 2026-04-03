import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { iconMap, iconNames, getIcon } from '../../lib/iconMap';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
}

export default function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? iconNames.filter(n => n.toLowerCase().includes(search.toLowerCase()))
    : iconNames;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-bold text-sm">아이콘 선택</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="size-5" />
          </button>
        </div>
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="아이콘 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-6 gap-2">
          {filtered.map(name => {
            const Icon = getIcon(name);
            const isSelected = value === name;
            return (
              <button
                key={name}
                onClick={() => { onChange(name); onClose(); }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50 text-slate-600'
                }`}
                title={name}
              >
                <Icon className="size-5" />
                <span className="text-[8px] mt-1 truncate w-full text-center">{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
