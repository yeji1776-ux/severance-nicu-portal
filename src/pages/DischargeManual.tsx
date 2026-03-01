import { motion } from 'motion/react';
import {
  ArrowLeft,
  ChevronDown,
  Phone,
  Home,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getDischargeCategories } from '../api/endpoints';
import { iconMap } from '../lib/iconMap';

export default function DischargeManual() {
  const navigate = useNavigate();
  const { data: categories, loading } = useApi(() => getDischargeCategories(), []);

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-white shadow-xl overflow-x-hidden pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-white/90 backdrop-blur-md p-4 border-b border-slate-200 justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-primary flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          퇴원 후 관리 매뉴얼
        </h1>
      </div>

      {/* Hero */}
      <div className="p-4">
        <div className="relative bg-primary rounded-xl overflow-hidden min-h-[180px] flex flex-col justify-end p-6 shadow-lg">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
          ></div>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-2">NICU 가이드</span>
            <h2 className="text-white text-2xl font-bold leading-tight">우리 아이 건강을 위한<br/>안전한 퇴원 후 생활</h2>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-slate-600 text-sm leading-relaxed">
          신생아 중환자실 퇴원 후, 가정에서의 세심한 보살핌은 아이의 성장에 매우 중요합니다. 항목별 가이드를 확인해 주세요.
        </p>
      </div>

      {/* Categories */}
      <div className="px-4 pb-4 pt-4">
        <h3 className="text-slate-900 text-lg font-bold mb-4">주요 관리 카테고리</h3>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {(categories || []).map((cat: any, i: number) => {
              const IconComponent = iconMap[cat.icon_name] || BookOpen;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col gap-3 rounded-xl border p-5 shadow-sm ${cat.is_emergency ? 'border-red-100 bg-red-50/50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${cat.is_emergency ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                      <IconComponent className="size-6" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-slate-900 text-base font-bold">{cat.title}</h4>
                      <p className={`${cat.is_emergency ? 'text-red-600' : 'text-slate-500'} text-xs tracking-tight`}>{cat.subtitle}</p>
                    </div>
                    <ChevronDown className="ml-auto text-slate-400 size-5" />
                  </div>
                  <div className="mt-2 pl-1">
                    <ul className="space-y-2">
                      {cat.items.map((item: string, j: number) => (
                        <li key={j} className="flex gap-2 text-sm text-slate-700">
                          <span className={`${cat.is_emergency ? 'text-red-500' : 'text-primary'} font-bold`}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="p-4">
        <div className="bg-slate-100 rounded-xl p-4 flex items-start gap-3">
          <Phone className="size-5 text-primary" />
          <div>
            <p className="text-xs text-slate-500">문의 사항이 있으신가요?</p>
            <p className="text-sm font-bold text-slate-900">신생아 중환자실: 02-2228-0000</p>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 max-w-md mx-auto">
        <div className="flex gap-2 border-t border-slate-200 bg-white/90 backdrop-blur-md px-4 pb-6 pt-2">
          <button className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-400" onClick={() => navigate('/dashboard')}>
            <Home className="size-5" />
            <p className="text-[10px] font-medium">홈</p>
          </button>
          <button className="flex flex-1 flex-col items-center justify-end gap-1 text-primary">
            <BookOpen className="size-5 fill-primary" />
            <p className="text-[10px] font-bold">매뉴얼</p>
          </button>
        </div>
      </div>
    </div>
  );
}
