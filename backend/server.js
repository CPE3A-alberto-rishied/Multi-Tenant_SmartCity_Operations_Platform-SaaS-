const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION
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

// 3. EMAIL SETUP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 4. POST ROUTE
app.post('/api/report', async (req, res) => {
    try {
        const { reporter_name, reporter_email, contact_number, report_subject, report_location, report_description } = req.body;

        // A. Server-side Validation
        if (!reporter_name || !reporter_email || !contact_number || !report_subject || !report_location || !report_description) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }
        if (!/^[a-zA-Z\s]+$/.test(reporter_name)) {
            return res.status(400).json({ success: false, error: "Name must be letters only." });
        }
        if (!/^\d{11}$/.test(contact_number)) {
            return res.status(400).json({ success: false, error: "Contact must be exactly 11 digits." });
        }

        // B. Save to MongoDB
        const newReport = new Report(req.body);
        await newReport.save();

        // ✅ C. Send Success Response IMMEDIATELY for the Modal
        res.status(200).json({ success: true });

        // D. Background Emails
        // User Email
        transporter.sendMail({
            from: `"BEAT Pasig Support" <${process.env.EMAIL_USER}>`,
            to: reporter_email,
            subject: `Confirmation: Report Received - ${report_subject}`,
            html: `<p>Hi ${reporter_name}, your report has been successfully logged.</p>`
        }).catch(e => console.error("User Mail Error:", e));

        // Reverted Admin Alert format
        transporter.sendMail({
            from: `"BEAT SYSTEM" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `🚨 New BEAT Report: ${report_subject}`,
            html: `
                <p><b>New Incident Logged</b></p>
                <p><b>From:</b> ${reporter_name}</p>
                <p><b>Location:</b> ${report_location}</p>
                <p><b>Details:</b> ${report_description}</p>`
        }).catch(e => console.error("Admin Mail Error:", e));

    } catch (error) {
        console.error("Server Error:", error);
        if (!res.headersSent) res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));