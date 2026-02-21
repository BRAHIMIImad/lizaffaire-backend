const pool = require('../src/config/database');

const createTables = async () => {
    try {
        // Ads Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        category_id INTEGER REFERENCES categories(id),
        subcategory_id INTEGER REFERENCES subcategories(id),
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(12, 2) NOT NULL,
        condition VARCHAR(50), 
        city_id INTEGER REFERENCES cities(id),
        region_id INTEGER REFERENCES regions(id),
        status VARCHAR(20) DEFAULT 'active',
        views_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Ad Images Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS ad_images (
        id SERIAL PRIMARY KEY,
        ad_id INTEGER REFERENCES ads(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Ads and AdImages tables created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    }
};

createTables();
