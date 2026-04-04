-- Departments
INSERT INTO departments (slug, name, icon_name, description, theme_color, sort_order) VALUES
  ('nicu', '신생아집중치료실 (NICU)', 'Baby', '미숙아 및 고위험 신생아를 위한 집중치료실', '#1e40af', 1);

-- Users (password: 'password123' hashed with bcryptjs)
INSERT INTO users (email, password_hash, name, role, department_id) VALUES
  ('parent@test.com', '$2b$10$nMXhqrb8d.0V9XRvs.V5aOFyxeOztLdyzac9pTqy4frTPx0zC8ZS6', 'Lee Ji-won', 'parent', NULL),
  ('admin-nicu@severance.com', '$2b$10$nMXhqrb8d.0V9XRvs.V5aOFyxeOztLdyzac9pTqy4frTPx0zC8ZS6', 'NICU 관리자', 'admin', 1);

-- Patients
INSERT INTO patients (chart_number, name, gestational_weeks, birth_weight, birth_date, admission_date, department_id) VALUES
  ('0561528', '이하은', 32, 1850, '2024-10-15', '2024-10-15', 1);

-- Parent-Patient relationship
INSERT INTO parent_patient (user_id, patient_id, relationship) VALUES
  (1, 1, 'parent');

-- Care journey templates (from ParentDashboard.tsx:24-30)
INSERT INTO care_journey_templates (step_order, label, sub_label, icon_name) VALUES
  (1, '입원 안내', '초기 적응 단계', 'Stethoscope'),
  (2, '검사 프로세스', '정밀 진단 및 모니터링', 'Microscope'),
  (3, '수술 전후 주의사항', '집중 케어 단계', 'ActivitySquare'),
  (4, '퇴원 준비', '교육 및 자가 간호', 'Home'),
  (5, '퇴원 후 관리', '외래 및 추적 관찰', 'Heart');

-- Patient care journey (patient 1: step 1 completed, step 2 active)
INSERT INTO patient_care_journey (patient_id, template_id, status) VALUES
  (1, 1, 'completed'),
  (1, 2, 'active'),
  (1, 3, 'pending'),
  (1, 4, 'pending'),
  (1, 5, 'pending');

-- Content categories
INSERT INTO content_categories (name, slug, icon_name, sort_order, is_journey_step, journey_step_order) VALUES
  ('입원', 'admission', 'Hospital', 1, 1, 1),
  ('치료', 'treatment', 'HeartPulse', 2, 1, 2),
  ('퇴원준비', 'discharge', 'Home', 3, 1, 3),
  ('퇴원후', 'outpatient', 'ClipboardList', 4, 1, 4),
  ('영상', 'video', 'QrCode', 5, 0, NULL),
  ('Q&A', 'qna', 'MessageCircleQuestion', 6, 0, NULL);

-- Discharge categories (from DischargeManual.tsx:20-62)
INSERT INTO discharge_categories (title, subtitle, icon_name, is_emergency, sort_order) VALUES
  ('수유 및 영양', '적정 수유량 및 영양 공급법', 'Baby', 0, 1),
  ('위생 및 목욕', '피부 관리 및 청결 유지', 'Bath', 0, 2),
  ('예방접종 및 외래', '정기 검진 및 예방접종 일정', 'Syringe', 0, 3),
  ('응급상황 대처', '즉시 병원 방문이 필요한 경우', 'AlertCircle', 1, 4);

-- Discharge items
INSERT INTO discharge_items (category_id, content, sort_order) VALUES
  (1, '교정 연령에 맞춘 수유량 유지 (하루 8~12회)', 1),
  (1, '모유 수유 시 강화제 사용 여부 의료진 확인', 2),
  (1, '수유 후 충분한 트림으로 구토 예방', 3),
  (2, '실내 온도 24~26도, 습도 40~60% 유지', 1),
  (2, '목욕은 5~10분 내외로 신속하게 진행', 2),
  (2, '기저귀 발진 예방을 위한 잦은 환기', 3),
  (3, '출생 시 체중이 아닌 ''실제 생년월일'' 기준 접종', 1),
  (3, 'RSV 예방접종(시나지스) 시즌 확인 필수', 2),
  (3, '외래 방문 시 아기 수첩 및 기저귀 가방 준비', 3),
  (4, '38도 이상의 고열 혹은 36도 이하의 저체온', 1),
  (4, '피부나 입술이 푸르게 변하는 청색증', 2),
  (4, '수유 거부 및 평소보다 심하게 처지는 현상', 3);

-- Notices (from ParentDashboard.tsx:189-191)
INSERT INTO notices (title, description, date) VALUES
  ('신생아 중환자실 면회 규정 안내', '안전한 면회를 위한 수칙을 확인해 주세요.', '2024-11-07'),
  ('모유 수유 및 보관 가이드', '가정 내 유축 및 전달 방법 안내', '2024-11-06'),
  ('NICU 소독 절차 강화 안내', '겨울철 감염 예방을 위한 추가 소독 조치', '2024-11-05'),
  ('보호자 심리 상담 프로그램 안내', '매주 수요일 오후 2시 상담 가능', '2024-11-04'),
  ('퇴원 교육 일정 공지', '매월 첫째, 셋째 주 금요일 진행', '2024-11-01');

-- Examinations (from ParentDashboard.tsx:158-165)
INSERT INTO examinations (name, description) VALUES
  ('청력 선별 검사', '퇴원 전 시행되는 필수 검사입니다.'),
  ('뇌 초음파 검사', '정기적인 신경학적 발달 체크입니다.'),
  ('안과 검사 (미숙아 망막증)', '미숙아 망막증 선별 검사입니다.'),
  ('신생아 대사 이상 검사', '선천성 대사 이상 선별 검사입니다.');

-- Patient examinations
INSERT INTO patient_examinations (patient_id, examination_id, scheduled_date, status) VALUES
  (1, 1, '2024-11-20', 'scheduled'),
  (1, 2, '2024-11-15', 'completed'),
  (1, 3, '2024-11-25', 'scheduled'),
  (1, 4, '2024-10-20', 'completed');

-- Sample vital signs for patient 1
INSERT INTO vital_signs (patient_id, heart_rate, respiratory_rate, oxygen_saturation, temperature, recorded_at) VALUES
  (1, 145, 42, 97.5, 36.8, datetime('now', '-2 hours')),
  (1, 142, 40, 98.0, 36.7, datetime('now', '-1.5 hours')),
  (1, 148, 44, 96.8, 36.9, datetime('now', '-1 hour')),
  (1, 140, 41, 97.2, 36.7, datetime('now', '-30 minutes')),
  (1, 143, 43, 97.8, 36.8, datetime('now'));

-- Sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
  (1, '면회 시간 변경 안내', '내일부터 면회 시간이 오후 2시~4시로 변경됩니다.', 'info'),
  (1, '검사 일정 알림', '청력 선별 검사가 11/20에 예정되어 있습니다.', 'info'),
  (1, '주치의 회진 안내', '오늘 오전 10시 주치의 회진이 예정되어 있습니다.', 'info');
