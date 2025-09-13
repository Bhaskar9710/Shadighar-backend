const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/send-mail", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: "All fields are required" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      text: message,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while sending email" });
  }
});

module.exports = router;
