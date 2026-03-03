import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { ClipboardList, CheckCircle, Trash2, RefreshCw } from 'lucide-react';

const ADMISSION_CONFIRM_KEY = 'nicu-admission-confirmation-v1';

interface AdmissionConfirmRecord {
  userId: number;
  userName: string;
  userEmail: string;
  confirmedAt: string;
}

export default function AdmissionConfirmations() {
  const [records, setRecords] = useState<AdmissionConfirmRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(ADMISSION_CONFIRM_KEY) || '[]');
    } catch { return []; }
  });

  const refresh = () => {
    try {
      setRecords(JSON.parse(localStorage.getItem(ADMISSION_CONFIRM_KEY) || '[]'));
    } catch {}
  };

  const deleteRecord = (userId: number) => {
    try {
      const updated = records.filter(r => r.userId !== userId);
      localStorage.setItem(ADMISSION_CONFIRM_KEY, JSON.stringify(updated));
      setRecords(updated);
    } catch {}
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">입원 안내 숙지 확인 목록</h1>
              <p className="text-sm text-slate-500 mt-0.5">보호자의 입원 안내 숙지 확인 기록</p>
            </div>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <RefreshCw className="size-4" />
            새로고침
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-6 flex items-center gap-4">
          <CheckCircle className="size-8 text-green-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-slate-800">{records.length}명</p>
            <p className="text-sm text-slate-500">확인 완료한 보호자</p>
          </div>
        </div>

        {/* Table */}
        {records.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
            <ClipboardList className="size-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">아직 확인 완료한 보호자가 없습니다</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">보호자 이름</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">이메일 (계정)</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">확인 일시</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600">상태</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600">삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[...records].sort((a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime()).map(r => (
                    <tr key={r.userId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{r.userName}</td>
                      <td className="px-4 py-3 text-slate-500">{r.userEmail}</td>
                      <td className="px-4 py-3 text-slate-600">{fmt(r.confirmedAt)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <CheckCircle className="size-3.5" />
                          확인됨
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteRecord(r.userId)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-4 text-center">
          * 확인 기록은 각 보호자의 기기 로컬 저장소에 저장됩니다.
        </p>
      </div>
    </AdminLayout>
  );
}
