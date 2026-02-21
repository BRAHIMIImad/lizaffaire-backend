const pool = require('../config/database');

const createCompany = async (companyData) => {
    const {
        company_name,
        legal_form,
        siret,
        address,
        postal_code,
        city,
        company_email,
        company_phone
    } = companyData;

    const query = `
        INSERT INTO companies (
            company_name, 
            legal_form, 
            siret, 
            address, 
            postal_code, 
            city, 
            company_email, 
            company_phone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;

    const values = [
        company_name,
        legal_form,
        siret,
        address,
        postal_code,
        city,
        company_email,
        company_phone
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const findCompanyBySiret = async (siret) => {
    const query = 'SELECT * FROM companies WHERE siret = $1';
    const result = await pool.query(query, [siret]);
    return result.rows[0];
};

const getCompanyById = async (id) => {
    const query = 'SELECT * FROM companies WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    createCompany,
    findCompanyBySiret,
    getCompanyById
};
