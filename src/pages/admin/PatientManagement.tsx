import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, ChevronRight, Baby, Calendar, Weight, X } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { useApi } from '../../hooks/useApi';
import { getAdminPatients } from '../../api/endpoints';
import { api } from '../../api/client';

export default function PatientManagement() {
  const { data: patients, refetch } = useApi(() => getAdminPatients(), []);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">환자 관리</h2>
            <p className="text-sm text-slate-500 mt-1">NICU 환자 정보를 관리합니다.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="size-4" /> 환자 등록
          </button>
        </div>

        {/* Patient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(patients || []).map((patient: any, i: number) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedPatient(patient)}
              className="bg-white rounded-xl p-6 shadow-sm border border-primary/5 hover:border-primary/20 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Baby className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{patient.name}</h3>
                    <p className="text-xs text-slate-500">{patient.chart_number}</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar className="size-3.5" />
                  <span>GA {patient.gestational_weeks}주</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Weight className="size-3.5" />
                  <span>{patient.birth_weight}g</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-primary/5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  patient.discharge_date ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {patient.discharge_date ? '퇴원' : '입원 중'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <PatientDetailModal
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            onUpdated={() => { setSelectedPatient(null); refetch(); }}
          />
        )}

        {/* Create Patient Modal */}
        {showCreate && (
          <CreatePatientModal
            onClose={() => setShowCreate(false)}
            onCreated={() => { setShowCreate(false); refetch(); }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function PatientDetailModal({ patient, onClose, onUpdated }: { patient: any; onClose: () => void; onUpdated: () => void }) {
  const { data: journey, refetch: refetchJourney } = useApi(
    () => api.get<any[]>(`/patients/${patient.id}/journey`),
    [patient.id]
  );

  async function handleJourneyUpdate(stepId: number, status: string) {
    try {
      await api.put(`/admin/patients/${patient.id}/journey/${stepId}`, { status });
      refetchJourney();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    active: 'bg-blue-100 text-blue-700',
    pending: 'bg-slate-100 text-slate-500',
  };

  const statusLabels: Record<string, string> = {
    completed: '완료',
    active: '진행 중',
    pending: '대기',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">{patient.name} - 상세 정보</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="size-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><span className="text-slate-500">차트번호:</span> <strong>{patient.chart_number}</strong></div>
          <div><span className="text-slate-500">재태주수:</span> <strong>{patient.gestational_weeks}주</strong></div>
          <div><span className="text-slate-500">출생체중:</span> <strong>{patient.birth_weight}g</strong></div>
          <div><span className="text-slate-500">출생일:</span> <strong>{patient.birth_date}</strong></div>
          <div><span className="text-slate-500">입원일:</span> <strong>{patient.admission_date}</strong></div>
          <div><span className="text-slate-500">퇴원일:</span> <strong>{patient.discharge_date || '-'}</strong></div>
        </div>

        <h4 className="font-bold text-sm mb-3">치료 여정</h4>
        <div className="space-y-2">
          {(journey || []).map((step: any) => (
            <div key={step.template_id} className="flex items-center justify-between p-3 rounded-lg border border-primary/5">
              <div>
                <p className="text-sm font-semibold">{step.label}</p>
                <p className="text-xs text-slate-500">{step.sub_label}</p>
              </div>
              <select
                value={step.status}
                onChange={(e) => handleJourneyUpdate(step.template_id, e.target.value)}
                className={`text-xs font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[step.status]}`}
              >
                <option value="pending">대기</option>
                <option value="active">진행 중</option>
                <option value="completed">완료</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreatePatientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    chart_number: '',
    name: '',
    gestational_weeks: '',
    birth_weight: '',
    birth_date: '',
    admission_date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/patients', {
        ...form,
        gestational_weeks: Number(form.gestational_weeks),
        birth_weight: Number(form.birth_weight),
      });
      onCreated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">환자 등록</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="size-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'chart_number', label: '차트번호', type: 'text', placeholder: 'NICU-2024-002' },
            { key: 'name', label: '이름', type: 'text', placeholder: '홍길동' },
            { key: 'gestational_weeks', label: '재태주수', type: 'number', placeholder: '32' },
            { key: 'birth_weight', label: '출생체중 (g)', type: 'number', placeholder: '1850' },
            { key: 'birth_date', label: '출생일', type: 'date', placeholder: '' },
            { key: 'admission_date', label: '입원일', type: 'date', placeholder: '' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                value={(form as any)[field.key]}
                onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder={field.placeholder}
                required
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? '등록 중...' : '환자 등록'}
          </button>
        </form>
      </div>
    </div>
  );
}
