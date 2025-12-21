// ======================================
// Hajji Management System - Models
// Admin Only | Payment Locked | Adjustment Enabled
// ======================================

import mongoose from "mongoose";
const { Schema, model } = mongoose;

/* =====================================================
   1️⃣ Agency Model
===================================================== */
const AgencySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contactPerson: String,
    mobile: String,
    address: String,
    notes: String,
  },
  { timestamps: true }
);

export const Agency = model("Agency", AgencySchema);

/* =====================================================
   2️⃣ Hajji Model
===================================================== */
const HajjiSchema = new Schema(
  {
    agency: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    passportNumber: {
      type: String,
      required: true,
      unique: true,
    },
    address: String,
    mobile: String,

    packageAmount: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Cancelled", "Hold"],
      default: "Active",
    },

    notes: String,
  },
  { timestamps: true }
);

export const Hajji = model("Hajji", HajjiSchema);

/* =====================================================
   3️⃣ Bank Statement Model (Payment Entry)
   ❌ No Edit / No Delete
===================================================== */
const BankStatementSchema = new Schema(
  {
    statementNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    bankName: String,
    statementDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    allocatedAmount: {
      type: Number,
      default: 0,
    },

    note: String,

    isFinalized: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const BankStatement = model("BankStatement", BankStatementSchema);

/* =====================================================
   4️⃣ Payment Allocation Model
   🔒 Immutable after Final
===================================================== */
const PaymentAllocationSchema = new Schema(
  {
    statement: {
      type: Schema.Types.ObjectId,
      ref: "BankStatement",
      required: true,
    },
    hajji: {
      type: Schema.Types.ObjectId,
      ref: "Hajji",
      required: true,
    },
    agency: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const PaymentAllocation = model(
  "PaymentAllocation",
  PaymentAllocationSchema
);

/* =====================================================
   5️⃣ Adjustment Model (Correction System)
   ✅ Linked to Bank Statement
===================================================== */
const AdjustmentSchema = new Schema(
  {
    adjustmentRef: {
      type: String,
      required: true,
      unique: true,
    },

    statement: {
      type: Schema.Types.ObjectId,
      ref: "BankStatement",
      required: true,
    },

    hajji: {
      type: Schema.Types.ObjectId,
      ref: "Hajji",
      required: true,
    },

    agency: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      // can be + or -
    },

    reason: {
      type: String,
      required: true,
    },

    note: String,
  },
  { timestamps: true }
);

export const Adjustment = model("Adjustment", AdjustmentSchema);
