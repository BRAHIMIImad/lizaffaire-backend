const express = require('express');
const router = express.Router();
const {
  getRegionsWithCities,
  getRegions,
  getCitiesByRegion,
  getAllCities,
  getAllCitiesFull,
  getCategoriesWithSubcategories
} = require('../controllers/locationController');

// GET /api/locations/regions-with-cities - Récupérer toutes les régions avec leurs villes
router.get('/regions-with-cities', getRegionsWithCities);

// GET /api/locations/regions - Récupérer uniquement les régions
router.get('/regions', getRegions);

// GET /api/locations/regions/:regionId/cities - Récupérer les villes d'une région
router.get('/regions/:regionId/cities', getCitiesByRegion);

// GET /api/locations/cities - Récupérer les 50 villes les plus importantes
router.get('/cities', getAllCities);

// GET /api/locations/all-cities - Récupérer TOUTES les villes
router.get('/all-cities', getAllCitiesFull);

// GET /api/locations/categories - Récupérer toutes les catégories avec sous-catégories
router.get('/categories', getCategoriesWithSubcategories);

module.exports = router;
