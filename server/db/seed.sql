-- Departments
INSERT INTO departments (slug, name, icon_name, description, theme_color, sort_order) VALUES
  ('nicu', '신생아집중치료실 (NICU)', 'Baby', '미숙아 및 고위험 신생아를 위한 집중치료실', '#1e40af', 1),
  ('ortho-ward', '정형외과 병동', 'Bone', '관절·척추 수술 환자를 위한 입원 병동', '#16a34a', 2),
  ('ccu', '심혈관 중환자실 (CCU)', 'HeartPulse', '급성 심혈관 질환 환자를 위한 중환자실', '#dc2626', 3),
  ('ped-er', '소아응급실', 'Siren', '소아 응급 환자를 위한 응급진료실', '#ea580c', 4);

-- Users (password: 'password123' hashed with bcryptjs)
INSERT INTO users (email, password_hash, name, role, department_id) VALUES
  ('parent@test.com', '$2b$10$nMXhqrb8d.0V9XRvs.V5aOFyxeOztLdyzac9pTqy4frTPx0zC8ZS6', 'Lee Ji-won', 'parent', NULL),
  ('admin-nicu@severance.com', '$2b$10$nMXhqrb8d.0V9XRvs.V5aOFyxeOztLdyzac9pTqy4frTPx0zC8ZS6', 'NICU 관리자', 'admin', 1),
  ('admin-ortho@severance.com', '$2b$10$nMXhqrb8d.0V9XRvs.V5aOFyxeOztLdyzac9pTqy4frTPx0zC8ZS6', '정형외과 관리자', 'admin', 2),
  ('admin-ccu@severance.com', '$2b$10$nMXhqrb8d.0V9XRvs.V5aOFyxeOztLdyzac9pTqy4frTPx0zC8ZS6', 'CCU 관리자', 'admin', 3),
  ('admin-er@severance.com', '$2b$10$nMXhqrb8d.0V9XRvs.V5aOFyxeOztLdyzac9pTqy4frTPx0zC8ZS6', '소아응급 관리자', 'admin', 4);

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

-- ═══════════════════════════════════════════
-- 정형외과 병동 (ortho-ward) 시드 콘텐츠
-- ═══════════════════════════════════════════

-- Content categories for ortho-ward (department_id = 2)
INSERT INTO content_categories (name, slug, icon_name, sort_order, is_journey_step, journey_step_order, department_id) VALUES
  ('입원안내', 'admission', 'Hospital', 1, 1, 1, 2),
  ('수술안내', 'surgery', 'Stethoscope', 2, 1, 2, 2),
  ('재활치료', 'rehab', 'Activity', 3, 1, 3, 2),
  ('퇴원안내', 'discharge', 'Home', 4, 1, 4, 2),
  ('통증관리', 'pain-mgmt', 'HeartPulse', 5, 0, NULL, 2);

-- Care journey templates for ortho-ward (department_id = 2)
INSERT INTO care_journey_templates (step_order, label, sub_label, icon_name, department_id) VALUES
  (1, '입원 및 수술 준비', '검사 및 수술 전 안내', 'ClipboardList', 2),
  (2, '수술 진행', '수술 및 회복', 'Stethoscope', 2),
  (3, '재활 치료', '물리치료 및 운동', 'Activity', 2),
  (4, '퇴원 준비', '자가 관리 교육', 'Home', 2),
  (5, '외래 추적', '정기 검진 및 재활', 'Calendar', 2);

-- Discharge categories for ortho-ward (department_id = 2)
INSERT INTO discharge_categories (title, subtitle, icon_name, is_emergency, sort_order, department_id) VALUES
  ('재활 운동', '퇴원 후 자가 재활 프로그램', 'Activity', 0, 1, 2),
  ('약물 관리', '진통제 및 항응고제 복용법', 'Pill', 0, 2, 2),
  ('상처 관리', '수술 부위 소독 및 관찰', 'ShieldCheck', 0, 3, 2),
  ('응급 증상', '즉시 병원 방문이 필요한 경우', 'AlertCircle', 1, 4, 2);

-- Discharge items for ortho-ward
INSERT INTO discharge_items (category_id, content, sort_order) VALUES
  ((SELECT id FROM discharge_categories WHERE title = '재활 운동' AND department_id = 2), '의료진이 안내한 재활 운동을 하루 2~3회 꾸준히 시행', 1),
  ((SELECT id FROM discharge_categories WHERE title = '재활 운동' AND department_id = 2), '통증이 심해지면 운동 강도를 줄이고 의료진 상담', 2),
  ((SELECT id FROM discharge_categories WHERE title = '재활 운동' AND department_id = 2), '보조기(보호대)는 의료진 지시에 따라 착용 시간 준수', 3),
  ((SELECT id FROM discharge_categories WHERE title = '약물 관리' AND department_id = 2), '진통제는 정해진 시간에 규칙적으로 복용', 1),
  ((SELECT id FROM discharge_categories WHERE title = '약물 관리' AND department_id = 2), '항응고제 복용 시 출혈 징후(잇몸 출혈, 멍) 관찰', 2),
  ((SELECT id FROM discharge_categories WHERE title = '약물 관리' AND department_id = 2), '약물 부작용(위장 장애, 어지러움) 시 의료진 연락', 3),
  ((SELECT id FROM discharge_categories WHERE title = '상처 관리' AND department_id = 2), '수술 부위는 깨끗하고 건조하게 유지', 1),
  ((SELECT id FROM discharge_categories WHERE title = '상처 관리' AND department_id = 2), '실밥 제거 전까지 목욕 시 방수 보호', 2),
  ((SELECT id FROM discharge_categories WHERE title = '상처 관리' AND department_id = 2), '발적, 부종, 삼출물 증가 시 즉시 내원', 3),
  ((SELECT id FROM discharge_categories WHERE title = '응급 증상' AND department_id = 2), '38도 이상 고열 또는 오한 지속', 1),
  ((SELECT id FROM discharge_categories WHERE title = '응급 증상' AND department_id = 2), '수술 부위 심한 부종·발적·고름', 2),
  ((SELECT id FROM discharge_categories WHERE title = '응급 증상' AND department_id = 2), '다리/팔의 감각 이상 또는 심한 통증 악화', 3);

-- ═══════════════════════════════════════════
-- 소아응급실 (ped-er) 시드 콘텐츠
-- ═══════════════════════════════════════════

-- Content categories for ped-er (department_id = 4)
INSERT INTO content_categories (name, slug, icon_name, sort_order, is_journey_step, journey_step_order, department_id) VALUES
  ('응급실안내', 'admission', 'Siren', 1, 1, 1, 4),
  ('검사안내', 'examination', 'Microscope', 2, 1, 2, 4),
  ('처치안내', 'treatment', 'Stethoscope', 3, 1, 3, 4),
  ('귀가안내', 'discharge', 'Home', 4, 1, 4, 4),
  ('재방문기준', 'revisit', 'AlertTriangle', 5, 0, NULL, 4);

-- Care journey templates for ped-er (department_id = 4)
INSERT INTO care_journey_templates (step_order, label, sub_label, icon_name, department_id) VALUES
  (1, '접수 및 분류', '응급도 평가 (KTAS)', 'ClipboardList', 4),
  (2, '검사 진행', '혈액, 영상 검사', 'Microscope', 4),
  (3, '처치 및 치료', '응급 처치', 'Stethoscope', 4),
  (4, '관찰 대기', '경과 관찰', 'Clock', 4),
  (5, '귀가 또는 입원', '귀가 안내 또는 입원 결정', 'Home', 4);

-- Discharge categories for ped-er (department_id = 4)
INSERT INTO discharge_categories (title, subtitle, icon_name, is_emergency, sort_order, department_id) VALUES
  ('귀가 후 관찰', '가정에서의 증상 모니터링', 'Eye', 0, 1, 4),
  ('약물 복용', '처방약 복용법 안내', 'Pill', 0, 2, 4),
  ('생활 관리', '안정과 수분 섭취', 'Home', 0, 3, 4),
  ('재방문 기준', '즉시 재방문이 필요한 경우', 'AlertCircle', 1, 4, 4);

-- Discharge items for ped-er
INSERT INTO discharge_items (category_id, content, sort_order) VALUES
  ((SELECT id FROM discharge_categories WHERE title = '귀가 후 관찰' AND department_id = 4), '체온을 4시간마다 측정하여 기록', 1),
  ((SELECT id FROM discharge_categories WHERE title = '귀가 후 관찰' AND department_id = 4), '의식 상태 및 활동량 변화 주의 깊게 관찰', 2),
  ((SELECT id FROM discharge_categories WHERE title = '귀가 후 관찰' AND department_id = 4), '구토 횟수, 소변량, 식이량 기록', 3),
  ((SELECT id FROM discharge_categories WHERE title = '약물 복용' AND department_id = 4), '해열제는 38.5도 이상일 때 체중에 맞는 용량 투여', 1),
  ((SELECT id FROM discharge_categories WHERE title = '약물 복용' AND department_id = 4), '항생제는 증상이 호전되어도 처방 기간까지 복용 완료', 2),
  ((SELECT id FROM discharge_categories WHERE title = '약물 복용' AND department_id = 4), '구토 시 30분 후 재투여, 2회 이상 구토 시 내원', 3),
  ((SELECT id FROM discharge_categories WHERE title = '생활 관리' AND department_id = 4), '충분한 수분 섭취 (보리차, 이온음료 소량씩 자주)', 1),
  ((SELECT id FROM discharge_categories WHERE title = '생활 관리' AND department_id = 4), '소화가 잘 되는 부드러운 음식 제공', 2),
  ((SELECT id FROM discharge_categories WHERE title = '생활 관리' AND department_id = 4), '충분한 휴식, 무리한 활동 자제', 3),
  ((SELECT id FROM discharge_categories WHERE title = '재방문 기준' AND department_id = 4), '39도 이상 고열이 해열제 투여 후에도 지속', 1),
  ((SELECT id FROM discharge_categories WHERE title = '재방문 기준' AND department_id = 4), '경련, 의식 저하, 심한 두통 또는 목 경직', 2),
  ((SELECT id FROM discharge_categories WHERE title = '재방문 기준' AND department_id = 4), '지속적 구토로 수분 섭취 불가 또는 탈수 징후', 3);

-- ═══════════════════════════════════════════
-- 심혈관 중환자실 CCU 시드 콘텐츠
-- ═══════════════════════════════════════════

-- Content categories for CCU (department_id = 3)
INSERT INTO content_categories (name, slug, icon_name, sort_order, is_journey_step, journey_step_order, department_id) VALUES
  ('입실안내', 'admission', 'Hospital', 1, 1, 1, 3),
  ('치료과정', 'treatment', 'HeartPulse', 2, 1, 2, 3),
  ('투약관리', 'medication', 'Pill', 3, 1, 3, 3),
  ('생활습관', 'lifestyle', 'Apple', 4, 0, NULL, 3),
  ('퇴실안내', 'discharge', 'Home', 5, 1, 4, 3);

-- Care journey templates for CCU (department_id = 3)
INSERT INTO care_journey_templates (step_order, label, sub_label, icon_name, department_id) VALUES
  (1, '응급 입실', '초기 안정화 및 진단', 'Siren', 3),
  (2, '집중 치료', '시술 및 약물 치료', 'HeartPulse', 3),
  (3, '안정화 단계', '모니터링 및 회복', 'Activity', 3),
  (4, '퇴실 준비', '자가 관리 교육', 'Home', 3),
  (5, '외래 추적', '재발 예방 관리', 'Calendar', 3);

-- Discharge categories for CCU (department_id = 3)
INSERT INTO discharge_categories (title, subtitle, icon_name, is_emergency, sort_order, department_id) VALUES
  ('투약 관리', '심장 약물 복용법 및 주의사항', 'Pill', 0, 1, 3),
  ('식이 관리', '심혈관 건강을 위한 식단', 'Apple', 0, 2, 3),
  ('운동 관리', '심장 재활 운동 가이드', 'Activity', 0, 3, 3),
  ('응급 증상', '즉시 병원 방문이 필요한 경우', 'AlertCircle', 1, 4, 3);

-- Discharge items for CCU
INSERT INTO discharge_items (category_id, content, sort_order) VALUES
  ((SELECT id FROM discharge_categories WHERE title = '투약 관리' AND department_id = 3), '항혈소판제(아스피린, 클로피도그렐)는 반드시 매일 복용', 1),
  ((SELECT id FROM discharge_categories WHERE title = '투약 관리' AND department_id = 3), '스타틴(콜레스테롤 약)은 저녁 복용 권장', 2),
  ((SELECT id FROM discharge_categories WHERE title = '투약 관리' AND department_id = 3), '약물 부작용(근육통, 출혈) 발생 시 즉시 의료진 연락', 3),
  ((SELECT id FROM discharge_categories WHERE title = '식이 관리' AND department_id = 3), '저염식 (하루 소금 5g 이하) 유지', 1),
  ((SELECT id FROM discharge_categories WHERE title = '식이 관리' AND department_id = 3), '포화지방 줄이고 불포화지방(생선, 견과류) 섭취', 2),
  ((SELECT id FROM discharge_categories WHERE title = '식이 관리' AND department_id = 3), '금주 및 카페인 섭취 제한', 3),
  ((SELECT id FROM discharge_categories WHERE title = '운동 관리' AND department_id = 3), '퇴원 2주 후부터 가벼운 걷기 시작 (하루 30분)', 1),
  ((SELECT id FROM discharge_categories WHERE title = '운동 관리' AND department_id = 3), '무리한 운동(역기, 등산) 시 흉통 발생 여부 확인', 2),
  ((SELECT id FROM discharge_categories WHERE title = '운동 관리' AND department_id = 3), '심장 재활 프로그램 참여 권장', 3),
  ((SELECT id FROM discharge_categories WHERE title = '응급 증상' AND department_id = 3), '가슴 통증(쥐어짜는 듯한 통증) 15분 이상 지속', 1),
  ((SELECT id FROM discharge_categories WHERE title = '응급 증상' AND department_id = 3), '갑작스러운 호흡곤란 또는 식은땀', 2),
  ((SELECT id FROM discharge_categories WHERE title = '응급 증상' AND department_id = 3), '실신 또는 심한 어지러움', 3);
