// ================================
// Controller.js
// Hajji Management System – Phase 1
// Admin Only | Bulk Transaction Supported
// ================================

import {
  Hajji,
  Agency,
  Package,
  Transaction,
  PaymentAllocation,
} from "./model.js";

// -------------------------------
// 1️⃣ Hajji Controller
// -------------------------------
export const addHajji = async (req, res) => {
  try {
    const {
      name,
      fatherName,
      address,
      mobile,
      hajjiSource,
      agencyId,
      packageId,
      packagePrice,
      discountAmount = 0,
      discountReason = "",
    } = req.body;

    const finalPrice = packagePrice - discountAmount;

    const newHajji = new Hajji({
      name,
      fatherName,
      address,
      mobile,
      hajjiSource,
      agencyId: hajjiSource === "Agency" ? agencyId : null,
      packageId,
      packagePrice,
      discount: { amount: discountAmount, reason: discountReason },
      finalPrice,
    });

    await newHajji.save();

    res.status(201).json({ success: true, data: newHajji });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllHajji = async (req, res) => {
  try {
    const hajjiList = await Hajji.find().populate("agencyId packageId");
    res.status(200).json({ success: true, data: hajjiList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------------------
// 2️⃣ Agency Controller
// -------------------------------
export const addAgency = async (req, res) => {
  try {
    const {
      name,
      district,
      contactPerson,
      mobile,
      commissionType,
      commissionValue,
    } = req.body;
    const newAgency = new Agency({
      name,
      district,
      contactPerson,
      mobile,
      commissionType,
      commissionValue,
    });
    await newAgency.save();
    res.status(201).json({ success: true, data: newAgency });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllAgency = async (req, res) => {
  try {
    const agencyList = await Agency.find();
    res.status(200).json({ success: true, data: agencyList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------------------
// 3️⃣ Package Controller
// -------------------------------
export const addPackage = async (req, res) => {
  try {
    const { name, duration, price, facilities } = req.body;
    const newPackage = new Package({ name, duration, price, facilities });
    await newPackage.save();
    res.status(201).json({ success: true, data: newPackage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllPackage = async (req, res) => {
  try {
    const packageList = await Package.find();
    res.status(200).json({ success: true, data: packageList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------------------
// 4️⃣ Transaction & Payment Allocation Controller
// -------------------------------
export const addTransaction = async (req, res) => {
  try {
    const {
      paymentMethod,
      totalAmount,
      reference,
      payerType,
      agencyId = null,
      allocations = [],
      note,
    } = req.body;

    // Validate allocation sum = totalAmount
    const sumAllocation = allocations.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    if (sumAllocation !== totalAmount) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Allocation total does not match transaction total.",
        });
    }

    // Create Transaction Header
    const transaction = new Transaction({
      paymentMethod,
      totalAmount,
      reference,
      payerType,
      agencyId,
      note,
    });
    await transaction.save();

    // Create Payment Allocations & Update Hajji Status
    for (let alloc of allocations) {
      const hajji = await Hajji.findById(alloc.hajjiId);
      if (!hajji) continue;

      const paymentAlloc = new PaymentAllocation({
        transactionId: transaction._id,
        hajjiId: alloc.hajjiId,
        amount: alloc.amount,
      });
      await paymentAlloc.save();

      // Update Hajji totalPaid & status
      const paymentRecords = await PaymentAllocation.find({
        hajjiId: hajji._id,
      });
      const totalPaid = paymentRecords.reduce(
        (acc, curr) => acc + curr.amount,
        0
      );

      let status = "Partially Paid";
      if (totalPaid >= hajji.finalPrice) status = "Fully Paid";
      hajji.status = status;
      await hajji.save();
    }

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllTransaction = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate("agencyId");
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const searchTransaction = async (req, res) => {
  try {
    const { ref } = req.query;
    const transactions = await Transaction.find({
      $or: [
        { "reference.transactionId": ref },
        { "reference.bankStatementNo": ref },
      ],
    }).populate("agencyId");

    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ================================
// END OF CONTROLLER
// ================================
