import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Driver } from '../models/users/Driver.js';

dotenv.config();

export const ensureJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set in environment');
    }
}

let dataStore = []; // In-memory data store for demonstration purposes 

export const PayhereVerify = async (req, res) => {
    try {
        dataStore.push(req.body); // Store the received data
        res.status(200).json({ message: 'Payment data received successfully', data: req.body });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to process payment data' });
    }
}

export const PayhereStatus = async (req, res) => {
    try {

        res.status(200).json(dataStore);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to retrieve service status' });
    }
}