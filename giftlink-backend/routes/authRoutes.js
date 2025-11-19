const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const dotenv = require('dotenv');
const pino = require('pino');

const logger = pino();

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            res.status(400).json({ message: 'Email already existed'});
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        const newUser = await collection.insertOne({
            email: email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date()
        });

        const payload = {
            user: {
                id: newUser.insertedId
            }
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({ authtoken, email });
    } catch (error) {
        return res.status(500).send('Internal server error')
    }
});

router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const user = await collection.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: 'User not found'});
        }
        const result = await bcryptjs.compare(req.body.password, user.password);
        if(!result){
            return res.status(400).json({ message: 'Wrong password'});
        }

        const userName = user.firstName;
        const userEmail = user.email;

        const payload = {
            user: {
                id: user._id.toString()
            }
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User login successfully');
        return res.json({ authtoken, userName, userEmail });
    } catch (error) {
        return res.status(500).send('Internal server error');
    }
});

router.put('/update', async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            logger.error('Validation errors in update request', errors.array());
            return res.status(400).json({ errors: errors.array()});
        }

        const email = req.headers.email;

        if(!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: 'Email not found in the request header'});
        }

        const db = await connectToDatabase();
        const collection = db.collection('users');
        const existingUser = await collection.findOne({email: email});
        if(!existingUser){
            logger.error('User not found');
            return res.status(400).json({ error: 'User not found'});
        }
        existingUser.firstName = req.body.name;
        existingUser.udpatedAt = new Date();

        const udpateUser = await collection.findOneAndUpdate({email}, {$set: existingUser}, {returnDocument: 'after'});
        const payload = {
            user: {
                id: udpateUser._id.toString()
            }
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User updated successfully');
        res.json({authtoken});
    } catch (error) {
        return res.status(500).send('Internal server error');
    }
})

module.exports = router;