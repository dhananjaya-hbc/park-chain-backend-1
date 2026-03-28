const { query } = require('../config/db');

// GET /api/admin/verifications
exports.getVerifications = async (req, res) => {
  try {
    // We join seller_kyc with users to get the kyc_status which holds
    // 'pending_review', 'verified', 'rejected', or 'unverified'
    const result = await query(`
      SELECT 
        k.id as kyc_id,
        k.full_name,
        k.seller_wallet,
        k.created_at,
        k.kyc_status,
        u.id as user_id
      FROM seller_kyc k
      JOIN users u ON k.user_id = u.id
      ORDER BY k.created_at DESC
    `);

    // Format the date like "01 Dec 2025-23:21:56"
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${day} ${month} ${year}-${hours}:${minutes}:${seconds}`;
    };

    // Map database states to frontend expectations
    const mapStatus = (dbStatus) => {
      if (dbStatus === 'pending_review') return 'pending';
      if (dbStatus === 'verified') return 'verified';
      if (dbStatus === 'rejected') return 'rejected';
      return 'pending'; // Default fallback
    };

    // Generate a pseudo-random role ID based on the UUID so it's consistent
    // (Takes the first 4 chars of the UUID)
    const generateRoleId = (uuid) => {
      const shortStr = uuid ? uuid.toString().substring(0, 4).toUpperCase() : '0000';
      return `#SF-${shortStr}`;
    };

    const formattedData = result.rows.map(row => ({
      id: row.kyc_id,
      name: row.full_name,
      role: 'Seller',
      walletId: row.seller_wallet || 'Not Provided',
      blockchain: 'XRPL',
      roleId: generateRoleId(row.user_id),
      date: formatDate(row.created_at),
      status: mapStatus(row.kyc_status)
    }));

    res.status(200).json(formattedData);

  } catch (error) {
    console.error('Error fetching admin verifications:', error);
    res.status(500).json({ error: 'Failed to fetch verifications data.' });
  }
};

// GET /api/admin/verifications/:id
exports.getVerificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        k.id,
        k.full_name,
        k.nic_number,
        k.parking_type,
        k.full_address,
        k.nic_front_url,
        k.nic_back_url,
        k.selfie_url,
        k.legal_document_url,
        k.utility_bill_url,
        k.created_at,
        k.kyc_status,
        u.email as seller_email
      FROM seller_kyc k
      JOIN users u ON k.user_id = u.id
      WHERE k.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Validation handles it. KYC record not found.' });
    }

    const row = result.rows[0];

    // Map database states to frontend expectations
    const mapStatus = (dbStatus) => {
      if (dbStatus === 'pending_review') return 'pending';
      if (dbStatus === 'verified') return 'verified';
      if (dbStatus === 'rejected') return 'rejected';
      return 'pending'; 
    };

    const formattedData = {
      id: row.id,
      fullName: row.full_name,
      sellerEmail: row.seller_email,
      nicNumber: row.nic_number,
      parkingType: row.parking_type,
      fullAddress: row.full_address,
      status: mapStatus(row.kyc_status),
      createdAt: row.created_at.toISOString(),
      nicFrontUrl: row.nic_front_url,
      nicBackUrl: row.nic_back_url,
      selfieUrl: row.selfie_url,
      legalDocumentUrl: row.legal_document_url,
      utilityBillUrl: row.utility_bill_url
    };

    res.status(200).json(formattedData);

  } catch (error) {
    console.error('Error fetching verification by ID:', error);
    res.status(500).json({ error: 'Failed to fetch verification data.' });
  }
};

// PUT /api/admin/verifications/:id/decision
exports.updateVerificationDecision = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the seller_kyc document
    const { decision, reason } = req.body;

    // Validate input
    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision. Must be "approve" or "reject".' });
    }

    // Find the KYC document to get the user_id
    const kycResult = await query('SELECT user_id FROM seller_kyc WHERE id = $1', [id]);
    
    if (kycResult.rows.length === 0) {
      return res.status(404).json({ error: 'KYC application not found.' });
    }

    const userId = kycResult.rows[0].user_id;

    // Determine values to update based on decision
    const newStatus = decision === 'approve' ? 'verified' : 'rejected';
    const isVerified = decision === 'approve'; // true if approved, false if rejected
    const rejectionReason = decision === 'reject' ? reason : null;

    // Start a transaction since we are updating two tables
    await query('BEGIN');

    // 1. Update the user's KYC status and verification flag in the 'users' table
    await query(
      `UPDATE users 
       SET kyc_status = $1, is_verified = $2 
       WHERE id = $3`,
      [newStatus, isVerified, userId]
    );

    // 2. Update the KYC document with the rejection reason (if any) and its status
    await query(
      `UPDATE seller_kyc 
       SET 
         rejection_reason = $1, 
         kyc_status = $2,
         updated_at = NOW() 
       WHERE id = $3`,
      [rejectionReason, newStatus, id]
    );

    await query('COMMIT');

    res.status(200).json({
      success: true,
      message: `KYC submission has been ${newStatus}.`,
      status: newStatus
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating verification decision:', error);
    res.status(500).json({ error: 'Failed to process the decision.' });
  }
};
