import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Heart,
  Wind,
  Droplets,
  Thermometer,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { getPatientVitalsLatest, getPatientVitalsHistory } from '../api/endpoints';

interface VitalData {
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  temperature: number;
  recorded_at: string;
}

export default function VitalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const patientId = user?.patients?.[0]?.id;
  const patientName = user?.patients?.[0]?.name || '아기';

  const { data: latest, refetch: refetchLatest } = useApi(
    () => patientId ? getPatientVitalsLatest(patientId) : Promise.resolve(null),
    [patientId]
  );

  const { data: history } = useApi(
    () => patientId ? getPatientVitalsHistory(patientId, 24) : Promise.resolve([]),
    [patientId]
  );

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchLatest();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchLatest]);

  const vitals = [
    {
      label: '심박수',
      value: latest?.heart_rate,
      unit: 'bpm',
      icon: Heart,
      color: 'bg-red-50 text-red-500 border-red-100',
      iconBg: 'bg-red-100',
      normal: '120-160 bpm',
    },
    {
      label: '호흡수',
      value: latest?.respiratory_rate,
      unit: '/min',
      icon: Wind,
      color: 'bg-blue-50 text-blue-500 border-blue-100',
      iconBg: 'bg-blue-100',
      normal: '30-60 /min',
    },
    {
      label: '산소포화도',
      value: latest?.oxygen_saturation,
      unit: '%',
      icon: Droplets,
      color: 'bg-emerald-50 text-emerald-500 border-emerald-100',
      iconBg: 'bg-emerald-100',
      normal: '95-100%',
    },
    {
      label: '체온',
      value: latest?.temperature,
      unit: '°C',
      icon: Thermometer,
      color: 'bg-amber-50 text-amber-500 border-amber-100',
      iconBg: 'bg-amber-100',
      normal: '36.5-37.5°C',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center bg-white/90 backdrop-blur-md p-4 border-b border-primary/10 gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-primary flex size-10 shrink-0 items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-slate-900 font-bold">실시간 생체신호</h1>
          <p className="text-xs text-slate-500">{patientName} - 30초마다 자동 갱신</p>
        </div>
        <button
          onClick={refetchLatest}
          className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          <RefreshCw className="size-5" />
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Last updated */}
        {latest && (
          <div className="text-xs text-slate-500 text-center">
            마지막 측정: {new Date(latest.recorded_at).toLocaleString('ko-KR')}
          </div>
        )}

        {/* Vital Cards */}
        <div className="grid grid-cols-2 gap-4">
          {vitals.map((v, i) => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-5 ${v.color}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`size-8 rounded-lg ${v.iconBg} flex items-center justify-center`}>
                  <v.icon className="size-4" />
                </div>
                <span className="text-xs font-semibold text-slate-600">{v.label}</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black">
                  {v.value != null ? v.value : '--'}
                </span>
                <span className="text-sm font-medium text-slate-500 mb-1">{v.unit}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">정상 범위: {v.normal}</p>
            </motion.div>
          ))}
        </div>

        {/* History Chart (simplified bar visualization) */}
        <div className="bg-white rounded-xl border border-primary/5 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="size-5 text-primary" />
            <h3 className="font-bold text-primary">24시간 추이</h3>
          </div>

          {(history && history.length > 0) ? (
            <div className="space-y-6">
              {/* Heart Rate Mini Chart */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">심박수 (bpm)</p>
                <div className="flex items-end gap-1 h-20">
                  {history.map((v: VitalData, i: number) => {
                    const min = 100, max = 180;
                    const pct = Math.min(100, Math.max(5, ((v.heart_rate - min) / (max - min)) * 100));
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-red-200 rounded-t-sm hover:bg-red-400 transition-colors"
                        style={{ height: `${pct}%` }}
                        title={`${v.heart_rate} bpm @ ${new Date(v.recorded_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* SpO2 Mini Chart */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">산소포화도 (%)</p>
                <div className="flex items-end gap-1 h-20">
                  {history.map((v: VitalData, i: number) => {
                    const min = 85, max = 100;
                    const pct = Math.min(100, Math.max(5, ((v.oxygen_saturation - min) / (max - min)) * 100));
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-emerald-200 rounded-t-sm hover:bg-emerald-400 transition-colors"
                        style={{ height: `${pct}%` }}
                        title={`${v.oxygen_saturation}% @ ${new Date(v.recorded_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">데이터가 없습니다.</p>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-700">
            생체신호 데이터는 병동 모니터링 장비에서 자동으로 수집됩니다. 수치 이상 시 의료진에게 즉시 알림이 전달됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
