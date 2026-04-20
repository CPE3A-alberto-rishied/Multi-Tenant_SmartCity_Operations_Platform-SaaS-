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

// 2. REPORT SCHEMA
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

// 3. EMAIL TRANSPORTER (Gmail Configuration)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // 16-character App Password
    }
});

// 4. API ROUTES
app.get('/', (req, res) => {
    res.send('🚀 BEAT Pasig API is live and operational.');
});

// THE SUBMISSION ROUTE
app.post('/api/report', async (req, res) => {
    try {
        // Save to MongoDB
        const newReport = new Report(req.body);
        const savedReport = await newReport.save();

        // Email to Citizen (Receipt)
        await transporter.sendMail({
            from: `"B.E.A.T. Pasig" <${process.env.EMAIL_USER}>`,
            to: req.body.reporter_email,
            subject: `Receipt: ${req.body.report_subject}`,
            html: `<h3>Hello ${req.body.reporter_name},</h3>
                   <p>Your report has been logged. <b>Tracking ID:</b> ${savedReport._id}</p>`
        });

        // Email to Admin (Notification)
        await transporter.sendMail({
            from: `"BEAT System Alert" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `NEW REPORT: ${req.body.report_subject}`,
            html: `<p>New incident at <b>${req.body.report_location}</b>. Check Admin Dashboard.</p>`
        });

        // Send JSON back to frontend (Fixes SyntaxError)
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));