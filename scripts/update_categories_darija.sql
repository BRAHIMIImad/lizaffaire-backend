-- Update Categories to Authentic Darija
UPDATE categories SET name_ar = 'الخدمة' WHERE slug = 'emploi';
UPDATE categories SET name_ar = 'طوموبيلات و مواطر' WHERE slug = 'vehicules';
UPDATE categories SET name_ar = 'عقارات' WHERE slug = 'immobilier';
UPDATE categories SET name_ar = 'حوايج و موضة' WHERE slug = 'mode';
UPDATE categories SET name_ar = 'عطلة و سفر' WHERE slug = 'vacances';
UPDATE categories SET name_ar = 'الدار و الجردة' WHERE slug = 'maison-jardin';
UPDATE categories SET name_ar = 'العائلة و الوليدات' WHERE slug = 'famille';
UPDATE categories SET name_ar = 'إلكترونيك و تكنولوجيا' WHERE slug = 'electronique-multimedia';
UPDATE categories SET name_ar = 'هوايات و نشاط' WHERE slug = 'loisirs';
UPDATE categories SET name_ar = 'ماطيريال ديال الخدمة' WHERE slug = 'materiel-professionnel';
UPDATE categories SET name_ar = 'خدمات متنوعة' WHERE slug = 'services-divers';

-- Update Subcategories to Authentic Darija
UPDATE subcategories SET name_ar = 'طوموبيلات' WHERE name = 'Voitures';
UPDATE subcategories SET name_ar = 'مواطر' WHERE name = 'Motos';
UPDATE subcategories SET name_ar = 'طوموبيلات ديال الخدمة' WHERE name = 'Utilitaires';
UPDATE subcategories SET name_ar = 'باطوات و جيتسكي' WHERE name = 'Nautisme';
UPDATE subcategories SET name_ar = 'بيسيات و لانفورماتيك' WHERE name = 'Informatique';
UPDATE subcategories SET name_ar = 'تليفونات' WHERE name = 'Téléphonie';
UPDATE subcategories SET name_ar = 'تلفازات و كاميرات' WHERE name = 'Image & Son';
UPDATE subcategories SET name_ar = 'حوايج' WHERE name = 'Vêtements';
UPDATE subcategories SET name_ar = 'صبابط' WHERE name = 'Chaussures';
UPDATE subcategories SET name_ar = 'اكسسوارات و صيكان' WHERE name = 'Accessoires & Bagagerie';
UPDATE subcategories SET name_ar = 'كراء العطلة' WHERE name = 'Locations saisonnières';
UPDATE subcategories SET name_ar = 'أثاث و موبيليا' WHERE name = 'Ameublement';
UPDATE subcategories SET name_ar = 'ماكينات الدار' WHERE name = 'Électroménager';
UPDATE subcategories SET name_ar = 'ديكورات' WHERE name = 'Décoration';
UPDATE subcategories SET name_ar = 'بريكولاج' WHERE name = 'Bricolage';
UPDATE subcategories SET name_ar = 'جردة و نباتات' WHERE name = 'Jardin & Plantes';
UPDATE subcategories SET name_ar = 'حوايج الدراري الصغار' WHERE name = 'Équipement bébé';
UPDATE subcategories SET name_ar = 'البيع و الشرا' WHERE name = 'Ventes immobilières';
UPDATE subcategories SET name_ar = 'الكرا' WHERE name = 'Locations';
UPDATE subcategories SET name_ar = 'كولكاسيون' WHERE name = 'Colocations';
UPDATE subcategories SET name_ar = 'بنيات و مكاتب' WHERE name = 'Bureaux & Commerces';
