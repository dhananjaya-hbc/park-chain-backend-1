// all public api endpoints related to authentication
import express from 'express';
import {PayhereStatus,PayhereVerify} from '../controllers/PayhereControllers.js';
const router = express.Router();

router.post('/verify', PayhereVerify);
router.get('/data', PayhereStatus);
export default router;