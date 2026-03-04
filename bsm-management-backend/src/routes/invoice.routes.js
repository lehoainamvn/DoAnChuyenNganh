import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createInvoice,
  getInvoicesByMonth,
  getInvoiceDetail,
  markInvoicePaid,
  getTenantInvoices,
  getTenantLatestInvoice,
  getTenantInvoiceDetail
} from "../controllers/invoice.controller.js";


const router = express.Router();

/* =========================
   CREATE INVOICE
========================= */
router.post("/invoices", authMiddleware, createInvoice);
router.get("/invoices", authMiddleware, getInvoicesByMonth);
router.get("/invoices/:id", authMiddleware, getInvoiceDetail);
router.put("/invoices/:id/pay", authMiddleware, markInvoicePaid);
router.get("/invoices", authMiddleware, getTenantInvoices);
router.get("/invoices/latest", authMiddleware, getTenantLatestInvoice);
router.get("/invoices/:id/detail", authMiddleware, getTenantInvoiceDetail);
export default router;

