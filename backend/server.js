const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. CLOUD DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ BEAT Cloud Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// 2. SCHEMA & MODEL
const reportSchema = new mongoose.Schema({
    reporter_name: String,
    reporter_email: String,
    report_subject: String,
    contact_number: String,
    report_location: String,
    report_description: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', reportSchema);

// 3. EMAIL TRANSPORTER SETUP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 4. THE POST ROUTE
app.post('/api/report', async (req, res) => {
    try {
        const newReport = new Report(req.body);
        await newReport.save();

        // 📧 UPDATED RECEIPT LOGIC (Matches Screenshot)
        await transporter.sendMail({
            from: `"BEAT Pasig Support" <${process.env.EMAIL_USER}>`,
            to: req.body.reporter_email,
            subject: `Confirmation: We received your report - ${req.body.report_subject}`,
            html: `
                <div style="font-family: sans-serif; background-color: #121212; color: #ffffff; padding: 30px; border-radius: 8px; max-width: 600px;">
                    <h3 style="color: #ffffff; margin-bottom: 20px;">Hello ${req.body.reporter_name},</h3>
                    
                    <p style="line-height: 1.6;">Thank you for your vigilance. We have received your report regarding <b>${req.body.report_subject}</b>.</p>
                    
                    <p style="line-height: 1.6;">Our team is currently reviewing the details provided for <b>${req.body.report_location}</b>. You will be notified once action has been taken.</p>
                    
                    <br><br>
                    <p style="font-style: italic; color: #888888; font-size: 0.9rem; border-top: 1px solid #333333; padding-top: 15px;">
                        This is an automated receipt from the BEAT (Block Enforcement & Alert Team) System.
                    </p>
                </div>
            `
        });

        // Response for Frontend
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));