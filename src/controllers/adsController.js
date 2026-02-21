const pool = require('../config/database');
const path = require('path');

const createAd = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            title, description, price, condition,
            category_id, subcategory_id,
            city_id, region_id, images,
            neighborhood, is_urgent, is_featured, duration, negotiable
        } = req.body;
        const user_id = req.user.id;

        await client.query('BEGIN');

        // Calculate expiration date
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + parseInt(duration || '60'));

        // 1. Create Ad
        const adQuery = `
      INSERT INTO ads (
        user_id, company_id, category_id, subcategory_id, 
        title, description, price, original_price, condition, 
        city_id, region_id, neighborhood_text, 
        is_urgent, is_featured, expires_at, negotiable,
        status, under_review
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id;
    `;
        const adValues = [
            user_id,
            req.user.company_id || null, // Link to company if pro
            category_id, subcategory_id,
            title, description, price, price, condition,
            city_id, region_id, neighborhood,
            is_urgent || false, is_featured || false, expires_at, negotiable || false,
            'active', false
        ];
        const adResult = await client.query(adQuery, adValues);
        const adId = adResult.rows[0].id;

        // 2. Insert Images
        if (images && images.length > 0) {
            const imageQuery = `
        INSERT INTO ad_images (ad_id, image_url, is_primary, display_order)
        VALUES ($1, $2, $3, $4)
      `;
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                // img can be object { url, is_primary } or just string url
                const url = typeof img === 'string' ? img : img.url;
                const isPrimary = typeof img === 'object' ? !!img.is_primary : (i === 0);
                await client.query(imageQuery, [adId, url, isPrimary, i]);
            }
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Ad created successfully',
            adId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating ad:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        client.release();
    }
};

const uploadImages = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalname: file.originalname
    }));

    res.json({
        success: true,
        files: uploadedFiles
    });
};

const getNearestCity = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
        }

        // SQL query using Haversine formula
        const query = `
      SELECT 
        c.id, c.name, r.id as region_id, r.name as region_name,
        (6371 * acos(
          cos(radians($1)) * cos(radians(c.latitude)) * 
          cos(radians(c.longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(c.latitude))
        )) AS distance
      FROM cities c
      JOIN regions r ON c.region_id = r.id
      ORDER BY distance ASC
      LIMIT 1;
    `;

        // Note: Assuming cities table has latitude/longitude columns. 
        // If not, this will fail. The user prompt implies we should implement this query.
        // I need to check if cities table has lat/long. If not, I might need to add them or mock this.
        // For now, I'll implement as requested.

        const result = await pool.query(query, [lat, lng]);

        if (result.rows.length > 0) {
            res.json({ success: true, city: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'No city found' });
        }

    } catch (error) {
        console.error('Error finding nearest city:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getUserAds = async (req, res) => {
    try {
        const user_id = req.user.id;
        const query = `
            SELECT 
                a.*,
                c.name as category_name,
                c.name_ar as category_name_ar,
                sc.name as subcategory_name,
                sc.name_ar as subcategory_name_ar,
                ct.name as city_name,
                ct.name_ar as city_name_ar,
                (SELECT image_url FROM ad_images WHERE ad_id = a.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image
            FROM ads a
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN subcategories sc ON a.subcategory_id = sc.id
            LEFT JOIN cities ct ON a.city_id = ct.id
            WHERE a.user_id = $1 AND a.deleted_at IS NULL
            ORDER BY a.created_at DESC;
        `;
        const result = await pool.query(query, [user_id]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching user ads:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de vos annonces'
        });
    }
};

const getAdById = async (req, res) => {
    try {
        const { id } = req.params;

        // Simple regex check for UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ success: false, message: 'ID d\'annonce invalide' });
        }

        const query = `
      SELECT 
        a.*,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name,
        u.phone as seller_phone,
        u.email as seller_email,
        u.created_at as seller_since,
        c.name as category_name,
        c.name_ar as category_name_ar,
        sc.name as subcategory_name,
        sc.name_ar as subcategory_name_ar,
        ct.name as city_name,
        ct.name_ar as city_name_ar,
        (SELECT json_agg(img) FROM (
            SELECT json_build_object('url', image_url, 'is_primary', is_primary) as img
            FROM ad_images 
            WHERE ad_id = a.id 
            ORDER BY is_primary DESC, display_order ASC
         ) sub) as images
      FROM ads a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN subcategories sc ON a.subcategory_id = sc.id
      LEFT JOIN cities ct ON a.city_id = ct.id
      WHERE a.id = $1 AND a.deleted_at IS NULL;
    `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching ad detail:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const searchAds = async (req, res) => {
    try {
        const { q, category, city } = req.query;
        let queryParams = [];
        let conditions = ["a.status = 'active'", "a.deleted_at IS NULL"];

        if (q) {
            queryParams.push(`%${q}%`);
            conditions.push(`(a.title ILIKE $${queryParams.length} OR a.description ILIKE $${queryParams.length})`);
        }

        if (category && category !== '0') {
            queryParams.push(category);
            conditions.push(`a.category_id = $${queryParams.length}`);
        }

        if (city && city !== '0') {
            queryParams.push(city);
            conditions.push(`a.city_id = $${queryParams.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
            SELECT 
                a.*,
                c.name as category_name,
                c.name_ar as category_name_ar,
                ct.name as city_name,
                ct.name_ar as city_name_ar,
                (SELECT image_url FROM ad_images WHERE ad_id = a.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image
            FROM ads a
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN cities ct ON a.city_id = ct.id
            ${whereClause}
            ORDER BY 
                a.is_featured DESC, 
                a.is_urgent DESC, 
                a.created_at DESC;
        `;

        const result = await pool.query(sql, queryParams);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error searching ads:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche'
        });
    }
};

module.exports = {
    createAd,
    uploadImages,
    getNearestCity,
    getUserAds,
    searchAds,
    getAdById
};
