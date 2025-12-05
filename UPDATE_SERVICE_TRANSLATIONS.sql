-- Update Services with German and Thai translations

-- Massages
UPDATE services 
SET title = jsonb_build_object(
    'en', 'Traditional Thai Massage',
    'de', 'Traditionelle Thai-Massage',
    'th', 'นวดแผนไทย'
),
description = jsonb_build_object(
    'en', 'Ancient healing system combining acupressure, Indian Ayurvedic principles, and assisted yoga postures.',
    'de', 'Altes Heilsystem, das Akupressur, ayurvedische Prinzipien und unterstützte Yoga-Positionen kombiniert.',
    'th', 'ศาสตร์การรักษาแบบโบราณที่ผสมผสานการกดจุด หลักอายุรเวทของอินเดีย และท่าโยคะ'
)
WHERE title->>'en' ILIKE '%Thai Massage%';

UPDATE services 
SET title = jsonb_build_object(
    'en', 'Oil Massage',
    'de', 'Ölmassage',
    'th', 'นวดน้ำมัน'
),
description = jsonb_build_object(
    'en', 'Relaxing massage using aromatic oils to soothe muscles and relieve tension.',
    'de', 'Entspannende Massage mit aromatischen Ölen zur Beruhigung der Muskeln und Linderung von Verspannungen.',
    'th', 'การนวดผ่อนคลายโดยใช้น้ำมันหอมระเหยเพื่อปลอบประโลมกล้ามเนื้อและบรรเทาความตึงเครียด'
)
WHERE title->>'en' ILIKE '%Oil Massage%';

UPDATE services 
SET title = jsonb_build_object(
    'en', 'Deep Tissue Massage',
    'de', 'Tiefengewebsmassage',
    'th', 'นวดรีดเส้น'
),
description = jsonb_build_object(
    'en', 'Intense massage targeting deep layers of muscle and connective tissue.',
    'de', 'Intensive Massage, die auf tiefe Muskel- und Bindegewebsschichten abzielt.',
    'th', 'การนวด intense ที่เน้นชั้นลึกของกล้ามเนื้อและเนื้อเยื่อเกี่ยวพัน'
)
WHERE title->>'en' ILIKE '%Deep Tissue%';

UPDATE services 
SET title = jsonb_build_object(
    'en', 'Neck & Shoulder Massage',
    'de', 'Nacken- & Schultermassage',
    'th', 'นวดคอ บ่า ไหล่'
),
description = jsonb_build_object(
    'en', 'Focused relief for tension in the upper body.',
    'de', 'Gezielte Linderung von Verspannungen im Oberkörper.',
    'th', 'เน้นการบรรเทาความตึงเครียดบริเวณร่างกายส่วนบน'
)
WHERE title->>'en' ILIKE '%Neck%';

UPDATE services 
SET title = jsonb_build_object(
    'en', 'Foot Massage',
    'de', 'Fußmassage',
    'th', 'นวดเท้า'
),
description = jsonb_build_object(
    'en', 'Relaxing reflexology to restore balance and relieve fatigue.',
    'de', 'Entspannende Reflexzonenmassage zur Wiederherstellung des Gleichgewichts und Linderung von Müdigkeit.',
    'th', 'การนวดกดจุดสะท้อนเพื่อคืนความสมดุลและบรรเทาความเมื่อยล้า'
)
WHERE title->>'en' ILIKE '%Foot%';

-- Nails
UPDATE services 
SET title = jsonb_build_object(
    'en', 'Classic Manicure',
    'de', 'Klassische Maniküre',
    'th', 'ทำเล็บมือแบบคลาสสิก'
),
description = jsonb_build_object(
    'en', 'Complete hand care including shaping, cuticle work, and polish.',
    'de', 'Komplette Handpflege inklusive Formen, Nagelhautbehandlung und Lack.',
    'th', 'การดูแลมือครบวงจร รวมถึงการแต่งทรง การดูแลหนังกำพร้า และทาสีเล็บ'
)
WHERE title->>'en' ILIKE '%Manicure%';

UPDATE services 
SET title = jsonb_build_object(
    'en', 'Classic Pedicure',
    'de', 'Klassische Pediküre',
    'th', 'ทำเล็บเท้าแบบคลาสสิก'
),
description = jsonb_build_object(
    'en', 'Complete foot care including soaking, scrubbing, and polish.',
    'de', 'Komplette Fußpflege inklusive Fußbad, Peeling und Lack.',
    'th', 'การดูแลเท้าครบวงจร รวมถึงการแช่เท้า ขัดเท้า และทาสีเล็บ'
)
WHERE title->>'en' ILIKE '%Pedicure%';

UPDATE services 
SET title = jsonb_build_object(
    'en', 'Gel Polish Removal',
    'de', 'Gel-Lack Entfernung',
    'th', 'ล้างสีเจล'
),
description = jsonb_build_object(
    'en', 'Safe removal of gel polish without damaging natural nails.',
    'de', 'Sichere Entfernung von Gel-Lack ohne Beschädigung der Naturnägel.',
    'th', 'การล้างสีเจลอย่างปลอดภัยโดยไม่ทำลายเล็บธรรมชาติ'
)
WHERE title->>'en' ILIKE '%Removal%';

-- Beauty
UPDATE services 
SET title = jsonb_build_object(
    'en', 'Aloe Vera Facial',
    'de', 'Aloe Vera Gesichtsbehandlung',
    'th', 'นวดหน้าว่านหางจระเข้'
),
description = jsonb_build_object(
    'en', 'Soothing and hydrating facial perfect for sun-exposed skin.',
    'de', 'Beruhigende und feuchtigkeitsspendende Gesichtsbehandlung, perfekt für sonnengestresste Haut.',
    'th', 'ทรีตเมนต์ผิวหน้าเพื่อความผ่อนคลายและเติมความชุ่มชื้น เหมาะสำหรับผิวที่โดนแดด'
)
WHERE title->>'en' ILIKE '%Aloe%';
