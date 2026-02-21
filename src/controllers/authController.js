const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const companyModel = require('../models/companyModel');
const pool = require('../config/database');

const register = async (req, res) => {
    const client = await pool.connect();
    try {
        let {
            username, email, password, firstName, lastName, phone,
            account_type, company_data
        } = req.body;

        // Validation basique
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }

        // Normalize inputs
        username = username.toLowerCase();
        email = email.toLowerCase();

        // Vérifier si l'utilisateur existe déjà
        const existingEmail = await userModel.findUserByEmail(email);
        if (existingEmail) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const existingUsername = await userModel.findUserByUsername(username);
        if (existingUsername) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        await client.query('BEGIN');

        let companyId = null;
        if (account_type === 'professional' && company_data) {
            // Check if SIRET already exists
            const existingCompany = await companyModel.findCompanyBySiret(company_data.siret);
            if (existingCompany) {
                await client.query('ROLLBACK');
                return res.status(409).json({ message: 'Company with this SIRET already exists' });
            }

            const newCompany = await companyModel.createCompany(company_data);
            companyId = newCompany.id;
        }

        // Hashage du mot de passe
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Création de l'utilisateur
        const newUser = await userModel.createUser({
            username,
            email,
            passwordHash,
            firstName,
            lastName,
            phone,
            account_type: account_type || 'individual',
            company_id: companyId
        });

        await client.query('COMMIT');

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
};

const login = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        email = email.toLowerCase();

        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Vérification ròle user
        if (user.role === 'user' && !user.phone_verified && !user.email_verified) {
            return res.status(403).json({
                message: 'Account not verified',
                reason: 'verification_required'
            });
        }

        // Génération du token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                username: user.username,
                account_type: user.account_type,
                company_id: user.company_id
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key', // TODO: Move to env
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
                accountType: user.account_type,
                companyId: user.company_id
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    register,
    login
};
