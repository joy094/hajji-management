// ======================================
// Hajji Management System - Routes + Controllers
// Admin Only | Payment Locked | Adjustment Enabled
// ======================================

import express from "express";
import {
  Agency,
  Hajji,
  BankStatement,
  PaymentAllocation,
  Adjustment,
} from "./models.js";

const router = express.Router();

/* =====================================================
   1️⃣ AGENCY CONTROLLERS
===================================================== */

// Create Agency
router.post("/agencies", async (req, res) => {
  try {
    const agency = await Agency.create(req.body);
    res.json(agency);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Agencies (with summary)
router.get("/agencies", async (req, res) => {
  const agencies = await Agency.find();

  const result = await Promise.all(
    agencies.map(async (agency) => {
      const hajji = await Hajji.find({ agency: agency._id });
      const total = hajji.reduce((s, h) => s + h.packageAmount, 0);
      const paid = hajji.reduce((s, h) => s + h.paidAmount, 0);

      return {
        ...agency.toObject(),
        totalHajji: hajji.length,
        totalAmount: total,
        paidAmount: paid,
        dueAmount: total - paid,
      };
    })
  );

  res.json(result);
});

// Get Single Agency Profile
router.get("/agencies/:id", async (req, res) => {
  const agency = await Agency.findById(req.params.id);
  const hajji = await Hajji.find({ agency: agency._id });

  res.json({ agency, hajji });
});

// Update Agency
router.put("/agencies/:id", async (req, res) => {
  try {
    const agency = await Agency.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(agency);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Agency (unset agency on Hajji records)
router.delete("/agencies/:id", async (req, res) => {
  try {
    await Agency.findByIdAndDelete(req.params.id);
    // Unlink agency from hajjis rather than deleting hajji records
    await Hajji.updateMany(
      { agency: req.params.id },
      { $unset: { agency: "" } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   2️⃣ HAJJI CONTROLLERS
===================================================== */

// Add Hajji
router.post("/hajji", async (req, res) => {
  try {
    const hajji = await Hajji.create(req.body);
    res.json(hajji);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Hajji
router.get("/hajji", async (req, res) => {
  const list = await Hajji.find().populate("agency");
  res.json(list);
});

// Get Single Hajji
router.get("/hajji/:id", async (req, res) => {
  try {
    const hajji = await Hajji.findById(req.params.id).populate("agency");
    if (!hajji) return res.status(404).json({ error: "Hajji not found" });
    res.json(hajji);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Hajji
router.put("/hajji/:id", async (req, res) => {
  const hajji = await Hajji.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(hajji);
});

// Delete Hajji
router.delete("/hajji/:id", async (req, res) => {
  await Hajji.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =====================================================
   3️⃣ BANK STATEMENT (PAYMENT ENTRY)
===================================================== */

// Add Bank Statement (Unique)
router.post("/statements", async (req, res) => {
  try {
    const exists = await BankStatement.findOne({
      statementNo: req.body.statementNo,
    });
    if (exists)
      return res.status(400).json({ error: "Statement already exists" });

    const statement = await BankStatement.create(req.body);
    res.json(statement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Statements
router.get("/statements", async (req, res) => {
  const list = await BankStatement.find();
  res.json(list);
});

/* =====================================================
   4️⃣ PAYMENT ALLOCATION (NO EDIT / NO DELETE)
===================================================== */
// ================================
// POST /api/payments/allocate
// ================================
router.post("/payments/allocate", async (req, res) => {
  try {
    const {
      paymentType, // bank / mobile / cash
      statementNo,
      bankName,
      transactionId,
      mobileBank,
      receiptName,
      allocations, // [{ hajjiId, amount }]
    } = req.body;

    if (!paymentType || !allocations || allocations.length === 0) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // normalize helper: trim + uppercase strings (preserves special chars inside)
    const normalize = (v) =>
      typeof v === "string" ? v.trim().toUpperCase() : v;

    let statement = null;

    // 1️⃣ Bank Payment
    if (paymentType === "bank") {
      if (
        !statementNo ||
        !statementNo.toString().trim() ||
        !bankName ||
        !bankName.toString().trim()
      ) {
        return res
          .status(400)
          .json({ error: "Bank StatementNo & BankName required" });
      }

      const normalizedStatementNo = normalize(statementNo);

      // check duplicates against normalized value
      const existing = await BankStatement.findOne({
        statementNo: normalizedStatementNo,
      });
      if (existing) {
        return res.status(400).json({ error: "Statement already used" });
      }

      const totalAmount = allocations.reduce((sum, a) => sum + a.amount, 0);

      statement = await BankStatement.create({
        statementNo: normalizedStatementNo,
        bankName: bankName.toString().trim(),
        statementDate: new Date(),
        totalAmount,
        allocatedAmount: 0,
        isFinalized: false,
      });
    }

    // 2️⃣ Mobile Payment
    if (paymentType === "mobile") {
      if (
        !transactionId ||
        !transactionId.toString().trim() ||
        !mobileBank ||
        !mobileBank.toString().trim()
      ) {
        return res
          .status(400)
          .json({ error: "TransactionId & MobileBank required" });
      }

      const normalizedTxn = normalize(transactionId);

      // if transaction id already used - block
      const existingTxn = await BankStatement.findOne({
        transactionId: normalizedTxn,
      });
      if (existingTxn)
        return res.status(400).json({ error: "Transaction already used" });

      const totalAmount = allocations.reduce((sum, a) => sum + a.amount, 0);

      statement = await BankStatement.create({
        statementNo: "MOB-" + Date.now(),
        bankName: mobileBank.toString().trim(),
        transactionId: normalizedTxn,
        statementDate: new Date(),
        totalAmount,
        allocatedAmount: 0,
        isFinalized: false,
        note: "Mobile Payment, TXN: " + transactionId,
      });
    }

    // 3️⃣ Cash Payment
    if (paymentType === "cash") {
      if (!receiptName || !receiptName.toString().trim()) {
        return res.status(400).json({ error: "ReceiptName required" });
      }

      const normalizedReceipt = normalize(receiptName);

      const existingReceipt = await BankStatement.findOne({
        receiptName: normalizedReceipt,
      });
      if (existingReceipt)
        return res.status(400).json({ error: "Receipt already used" });

      const totalAmount = allocations.reduce((sum, a) => sum + a.amount, 0);

      statement = await BankStatement.create({
        statementNo: "CASH-" + Date.now(),
        bankName: receiptName.toString().trim(),
        receiptName: normalizedReceipt,
        statementDate: new Date(),
        totalAmount,
        allocatedAmount: 0,
        isFinalized: false,
        note: "Cash Payment",
      });
    }

    // Loop through allocations
    let totalAllocated = 0;

    for (const item of allocations) {
      try {
        const hajji = await Hajji.findById(item.hajjiId);
        if (!hajji) {
          console.warn("Hajji not found:", item.hajjiId);
          continue;
        }

        const amount = parseFloat(item.amount);
        if (!amount || amount <= 0) {
          console.warn("Invalid amount for Hajji:", item.hajjiId);
          continue;
        }

        await PaymentAllocation.create({
          statement: statement._id,
          hajji: hajji._id,
          agency: hajji.agency,
          amount,
        });

        // Update Hajji paidAmount
        hajji.paidAmount += amount;
        await hajji.save();

        totalAllocated += amount;
      } catch (err) {
        console.error("Allocation error:", item, err.message);
      }
    }

    statement.allocatedAmount = totalAllocated;
    statement.isFinalized = true;
    await statement.save();

    res.json({ success: true, message: "Payment allocated successfully" });
  } catch (err) {
    console.error("Server error:", err);
    // Handle Mongo duplicate key errors for unique fields
    if (err && err.code === 11000) {
      const dupKey = Object.keys(err.keyValue || {})[0];
      if (dupKey === "statementNo")
        return res.status(400).json({ error: "Statement already used" });
      if (dupKey === "transactionId")
        return res.status(400).json({ error: "Transaction already used" });
      if (dupKey === "receiptName")
        return res.status(400).json({ error: "Receipt already used" });
      // generic duplicate
      return res
        .status(400)
        .json({ error: "Duplicate identifier already used" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   5️⃣ ADJUSTMENT SYSTEM (CORRECTION)
===================================================== */

router.post("/adjustments", async (req, res) => {
  const { statementId, hajjiId, amount, reason, note } = req.body;

  const statement = await BankStatement.findById(statementId);
  if (!statement) return res.status(400).json({ error: "Invalid statement" });

  const hajji = await Hajji.findById(hajjiId);

  const adjustment = await Adjustment.create({
    adjustmentRef: "ADJ-" + Date.now(),
    statement: statement._id,
    hajji: hajji._id,
    agency: hajji.agency,
    amount,
    reason,
    note,
  });

  hajji.paidAmount += amount;
  await hajji.save();

  res.json(adjustment);
});

// Get All Adjustments
router.get("/adjustments", async (req, res) => {
  const list = await Adjustment.find()
    .populate("hajji")
    .populate("agency")
    .populate("statement");

  res.json(list);
});

/* =====================================================
   6️⃣ REPORT HELPERS
===================================================== */

// Hajji Ledger
router.get("/reports/hajji-ledger/:id", async (req, res) => {
  const hajji = await Hajji.findById(req.params.id).populate("agency");
  const payments = await PaymentAllocation.find({ hajji: hajji._id });
  const adjustments = await Adjustment.find({ hajji: hajji._id });

  res.json({ hajji, payments, adjustments });
});

// Bank Statement Report
/* =====================================================
   Bank Statement Report
===================================================== */
router.get("/reports/bank-statement/:id", async (req, res) => {
  try {
    const statementId = req.params.id;

    // Statement fetch
    const statement = await BankStatement.findById(statementId);
    if (!statement)
      return res.status(404).json({ error: "Statement not found" });

    // Allocations linked to this statement
    const allocations = await PaymentAllocation.find({
      statement: statement._id,
    })
      .populate("hajji")
      .populate("agency");

    res.json({
      statementNo: statement.statementNo,
      bankName: statement.bankName,
      statementDate: statement.statementDate,
      totalAmount: statement.totalAmount,
      allocatedAmount: statement.allocatedAmount,
      allocations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   Agency Ledger Report (Powerful)
===================================================== */

router.get("/reports/agency-ledger/:agencyId", async (req, res) => {
  try {
    const { agencyId } = req.params;

    // All statements where allocation exists for this agency
    const allocations = await PaymentAllocation.find({ agency: agencyId })
      .populate("hajji")
      .populate("statement")
      .populate("agency");

    if (!allocations.length) {
      return res.json([]);
    }

    // Group by statement
    const ledgerMap = {};

    allocations.forEach((a) => {
      const st = a.statement;

      if (!ledgerMap[st._id]) {
        ledgerMap[st._id] = {
          statementId: st._id,
          statementNo: st.statementNo,
          bankName: st.bankName,
          statementDate: st.statementDate,
          totalAmount: st.totalAmount,
          allocatedAmount: st.allocatedAmount,
          hajjiList: [],
        };
      }

      ledgerMap[st._id].hajjiList.push({
        hajjiId: a.hajji._id,
        name: a.hajji.fullName,
        amount: a.amount,
      });
    });

    res.json(Object.values(ledgerMap));
  } catch (err) {
    console.error("Agency Ledger Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   Agency Ledger Report (Powerful)
===================================================== */

router.get("/reports/agency-ledger/:agencyId", async (req, res) => {
  try {
    const { agencyId } = req.params;

    // All statements where allocation exists for this agency
    const allocations = await PaymentAllocation.find({ agency: agencyId })
      .populate("hajji")
      .populate("statement")
      .populate("agency");

    if (!allocations.length) {
      return res.json([]);
    }

    // Group by statement
    const ledgerMap = {};

    allocations.forEach((a) => {
      const st = a.statement;

      if (!ledgerMap[st._id]) {
        ledgerMap[st._id] = {
          statementId: st._id,
          statementNo: st.statementNo,
          bankName: st.bankName,
          statementDate: st.statementDate,
          totalAmount: st.totalAmount,
          allocatedAmount: st.allocatedAmount,
          hajjiList: [],
        };
      }

      ledgerMap[st._id].hajjiList.push({
        hajjiId: a.hajji._id,
        name: a.hajji.fullName,
        amount: a.amount,
      });
    });

    res.json(Object.values(ledgerMap));
  } catch (err) {
    console.error("Agency Ledger Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Recent Payments (latest 10)
router.get("/payments/recent", async (req, res) => {
  try {
    const payments = await PaymentAllocation.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("agency")
      .populate("statement");
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Recent Hajji Registrations (latest 10)
router.get("/hajji/recent", async (req, res) => {
  try {
    const hajjis = await Hajji.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("agency");
    res.json(hajjis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
