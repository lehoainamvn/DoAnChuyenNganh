import { transporter } from "../config/mail.js";

export const sendMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"BSM System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
  } catch (err) {
    console.error("❌ Send mail error:", err.message);
    throw new Error("Gửi email thất bại");
  }
};