const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ BEAT Cloud Connected via Mongoose'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// ==========================================
// 2. SCHEMAS & MODELS
// ==========================================
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
    otp: String,          // Temporary verification code
    otpExpires: Date      // Code expiration time
});
const Admin = mongoose.model('Admin', adminSchema);

// ==========================================
// 3. EMAIL SETUP
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ==========================================
// 4. ROUTES
// ==========================================

// --- SUBMIT PUBLIC REPORT ---
app.post('/api/report', async (req, res) => {
    try {
        const { reporter_name, reporter_email, contact_number, report_subject, report_location, report_description } = req.body;

        if (!reporter_name || !reporter_email || !contact_number || !report_subject || !report_location || !report_description) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }
        if (!/^[a-zA-Z\s]+$/.test(reporter_name)) {
            return res.status(400).json({ success: false, error: "Name must be letters only." });
        }
        if (!/^\d{11}$/.test(contact_number)) {
            return res.status(400).json({ success: false, error: "Contact must be exactly 11 digits." });
        }

        const newReport = new Report(req.body);
        await newReport.save();

        res.status(200).json({ success: true });

        // Background Emails
        transporter.sendMail({
            from: "BEAT Pasig Support" <${process.env.EMAIL_USER}>,
            to: reporter_email,
            subject: Confirmation: Report Received - ${report_subject},
            html: <p>Hi ${reporter_name}, your report has been successfully logged.</p>
        }).catch(e => console.error("User Mail Error:", e));

        transporter.sendMail({
            from: "BEAT SYSTEM" <${process.env.EMAIL_USER}>,
            to: process.env.ADMIN_EMAIL,
            subject: 🚨 New BEAT Report: ${report_subject},
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

// --- GET ALL REPORTS ---
app.get('/api/reports/all', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- UPDATE REPORT STATUS ---
app.put('/api/report/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true }
        );
        res.status(200).json({ success: true, data: updatedReport });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to update status" });
    }
});

// --- ADMIN LOGIN (3-Way Verification + OTP) ---
app.post('/api/admin/login', async (req, res) => {
    try {
        const { id, password, dept } = req.body;
        
        // Find admin by ID first to give specific error messages
        const foundAdmin = await Admin.findOne({ id: id });

        if (!foundAdmin) {
            return res.status(401).json({ success: false, error: "ID Number not found." });
        }

        if (foundAdmin.password !== password) {
            return res.status(401).json({ success: false, error: "Incorrect password." });
        }

        // Verify the department matches the dropdown selection
        if (foundAdmin.dept !== dept) {
            return res.status(401).json({ 
                success: false, 
                error: Access Denied: This ID belongs to ${foundAdmin.dept}, not ${dept}. 
            });
        }

        // Generate 6-Digit Code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        foundAdmin.otp = otpCode;
        foundAdmin.otpExpires = Date.now() + 600000; // Valid for 10 minutes
        await foundAdmin.save();

        // Send Email via Nodemailer
        await transporter.sendMail({
            from: "BEAT Security" <${process.env.EMAIL_USER}>,
            to: foundAdmin.email,
            subject: "B.E.A.T. Admin Verification Code",
            html: <h3>Verification Code: <b>${otpCode}</b></h3><p>This code expires in 10 minutes.</p>
        });

        res.status(200).json({ success: true, adminId: foundAdmin.id });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: "Server Error during Login." });
    }
});

// --- ADMIN OTP VERIFICATION ---
app.post('/api/admin/verify', async (req, res) => {
    try {
        const { adminId, otpCode } = req.body;
        const admin = await Admin.findOne({ id: adminId });

        if (!admin || admin.otp !== otpCode || Date.now() > admin.otpExpires) {
            return res.status(400).json({ success: false, error: "Invalid or expired code." });
        }

        // Clear OTP after success
        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        // Send back the verified department for frontend routing
        res.status(200).json({ success: true, department: admin.dept });
    } catch (error) {
        console.error("Verify Error:", error);
        res.status(500).json({ success: false, error: "Verification failed." });
    }
});

// ==========================================
// 5. START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(🚀 Server running on port ${PORT}));