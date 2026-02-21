const pool = require('../config/database');

// Récupérer toutes les régions avec leurs villes
const getRegionsWithCities = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id as region_id,
        r.name as region_name,
        r.name_ar as region_name_ar,
        r.code as region_code,
        json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'name_ar', c.name_ar,
            'postal_code', c.postal_code
          ) ORDER BY c.name
        ) FILTER (WHERE c.id IS NOT NULL) as cities
      FROM regions r
      LEFT JOIN cities c ON c.region_id = r.id
      WHERE r.is_active = true
      GROUP BY r.id, r.name, r.name_ar, r.code
      ORDER BY r.name;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching regions with cities:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des régions et villes'
    });
  }
};

// Récupérer uniquement les régions
const getRegions = async (req, res) => {
  try {
    const query = `
      SELECT id, name, name_ar, code
      FROM regions
      WHERE is_active = true
      ORDER BY name;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des régions'
    });
  }
};

// Récupérer les villes d'une région
const getCitiesByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;

    const query = `
      SELECT id, name, name_ar, postal_code
      FROM cities
      WHERE region_id = $1 AND is_active = true
      ORDER BY name;
    `;

    const result = await pool.query(query, [regionId]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des villes'
    });
  }
};

// Récupérer les 50 villes les plus importantes
const getAllCities = async (req, res) => {
  try {
    const query = `
      SELECT id, name, name_ar, name_en, postal_code, region_id, importance
      FROM cities
      WHERE is_active = true
      ORDER BY importance DESC, name ASC
      LIMIT 50;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des villes'
    });
  }
};

// Récupérer TOUTES les villes
const getAllCitiesFull = async (req, res) => {
  try {
    const query = `
      SELECT id, name, name_ar, name_en, postal_code, region_id, importance
      FROM cities
      WHERE is_active = true
      ORDER BY importance DESC, name ASC;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching all cities:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des villes'
    });
  }
};

// Récupérer toutes les catégories avec leurs sous-catégories
const getCategoriesWithSubcategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.name_ar as category_name_ar,
        c.slug as category_slug,
        c.description as category_description,
        c.icon as category_icon,
        json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'name_ar', s.name_ar,
            'slug', s.slug,
            'description', s.description,
            'icon', s.icon
          ) ORDER BY s.id
        ) FILTER (WHERE s.id IS NOT NULL) as subcategories
      FROM categories c
      LEFT JOIN subcategories s ON s.category_id = c.id AND s.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.name_ar, c.slug, c.description, c.icon
      ORDER BY c.id ASC;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des catégories'
    });
  }
};

module.exports = {
  getRegionsWithCities,
  getRegions,
  getCitiesByRegion,
  getAllCities,
  getAllCitiesFull,
  getCategoriesWithSubcategories
};
