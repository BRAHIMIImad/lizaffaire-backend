const pool = require('../config/database');

const createUser = async (userData) => {
    const {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        account_type,
        company_id
    } = userData;

    const query = `
    INSERT INTO users (
      username, 
      email, 
      password_hash, 
      first_name, 
      last_name, 
      phone,
      account_type,
      company_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, username, email, account_type, company_id, created_at;
  `;

    const values = [
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        account_type || 'individual',
        company_id || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateUserCompany = async (userId, companyId) => {
    const query = 'UPDATE users SET company_id = $1, account_type = $2 WHERE id = $3 RETURNING *';
    const result = await pool.query(query, [companyId, 'professional', userId]);
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

const findUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE LOWER(username) = LOWER($1)';
    const result = await pool.query(query, [username]);
    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserByUsername,
    updateUserCompany
};
