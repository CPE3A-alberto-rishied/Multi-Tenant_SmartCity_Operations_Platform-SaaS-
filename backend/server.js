const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ BEAT Cloud Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// 3. SCHEMAS & MODELS
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

const adminSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: String,
    dept: String,
    otp: String,
    otpExpires: Date
});
const Admin = mongoose.model('Admin', adminSchema);

// Announcement Schema
const announcementSchema = new mongoose.Schema({
    title: String,
    category: String,
    coverImage: String,
    content: String,
    blocks: String,
    status: { type: String, default: 'Queue' }, // 'Queue', 'Live', or 'Denied'
    createdAt: { type: Date, default: Date.now }
});
const Announcement = mongoose.model('Announcement', announcementSchema);

// 4. EMAIL SETUP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 5. ROUTES

// --- Report Routes ---
app.post('/api/report', async (req, res) => {
    try {
        const { reporter_name, reporter_email, contact_number, report_subject, report_location, report_description } = req.body;

        if (!reporter_name || !reporter_email || !contact_number || !report_subject || !report_location || !report_description) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        const newReport = new Report(req.body);
        await newReport.save();

        res.status(200).json({ success: true });

        // Background Emails
        transporter.sendMail({
            from: `"BEAT Pasig Support" <${process.env.EMAIL_USER}>`,
            to: reporter_email,
            subject: `Confirmation: Report Received - ${report_subject}`,
            html: `<p>Hi ${reporter_name}, your report has been successfully logged.</p>`
        }).catch(e => console.error("User Mail Error:", e));

    } catch (error) {
        console.error("Server Error:", error);
        if (!res.headersSent) res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/reports/all', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/report/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedReport = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.status(200).json({ success: true, data: updatedReport });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to update status" });
    }
});

// --- Announcement Routes ---
app.post('/api/announcements', async (req, res) => {
    try {
        const newAnn = new Announcement(req.body);
        await newAnn.save();
        res.status(200).json({ success: true, data: newAnn });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/announcements/:id', async (req, res) => {
    try {
        const updated = await Announcement.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/news', async (req, res) => {
    try {
        // Only grab announcements that the Admin has Approved ('Live')
        const liveNews = await Announcement.find({ status: 'Live' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: liveNews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- Admin Login & 2FA Routes ---
app.post('/api/admin/login', async (req, res) => {
    try {
        const { id, password, dept } = req.body;
        const foundAdmin = await Admin.findOne({ id, dept });

        if (!foundAdmin || foundAdmin.password !== password) {
            return res.status(401).json({ success: false, error: "Invalid credentials." });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        foundAdmin.otp = otpCode;
        foundAdmin.otpExpires = Date.now() + 600000; 
        await foundAdmin.save();

        await transporter.sendMail({
            from: `"BEAT Security" <${process.env.EMAIL_USER}>`,
            to: foundAdmin.email,
            subject: "B.E.A.T. Admin Verification Code",
            html: `<h3>Verification Code: <b>${otpCode}</b></h3><p>This code expires in 10 minutes.</p>`
        });

        res.status(200).json({ success: true, adminId: foundAdmin.id });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error during 2FA." });
    }
});

app.post('/api/admin/verify', async (req, res) => {
    try {
        const { adminId, otpCode } = req.body;
        const admin = await Admin.findOne({ id: adminId });

        if (!admin || admin.otp !== otpCode || Date.now() > admin.otpExpires) {
            return res.status(400).json({ success: false, error: "Invalid or expired code." });
        }

        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        res.status(200).json({ success: true, dept: admin.dept });
    } catch (error) {
        res.status(500).json({ success: false, error: "Verification failed." });
    }
});

// Simple Login Route (using the same Admin model)
app.post('/api/login', async (req, res) => {
    const { id, password, dept } = req.body;
    try {
        const user = await Admin.findOne({ id });
        if (!user || user.password !== password || user.dept !== dept) {
            return res.status(401).json({ success: false, message: "Invalid ID, Password, or Department." });
        }
        res.json({ success: true, department: user.dept });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// 6. START SERVER (MUST BE AT THE VERY BOTTOM)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Fetch ALL Announcements (For Admin Dashboard Reloads)
app.get('/api/announcements/all', async (req, res) => {
    try {
        const allAnnouncements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: allAnnouncements });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});