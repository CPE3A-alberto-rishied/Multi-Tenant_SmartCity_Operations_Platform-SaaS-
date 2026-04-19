const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB Cloud
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ BEAT Cloud Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. Define the Report Schema
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

// 3. Nodemailer Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// 4. The Integration Route
app.post('/api/report', async (req, res) => {
    try {
        // Save to MongoDB Cloud
        const newReport = new Report(req.body);
        await newReport.save();

        // Send Email via Nodemailer
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `🚨 New BEAT Report: ${req.body.report_subject}`,
            html: `<h3>New Incident Logged</h3>
                   <p><strong>From:</strong> ${req.body.reporter_name}</p>
                   <p><strong>Location:</strong> ${req.body.report_location}</p>
                   <p><strong>Details:</strong> ${req.body.report_description}</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Report saved and email sent!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(process.env.PORT, () => console.log(`🚀 Server on port ${process.env.PORT}`));