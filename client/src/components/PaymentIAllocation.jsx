// PaymentAllocation.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentAllocation() {
  const [paymentType, setPaymentType] = useState("");
  const [statementNo, setStatementNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [mobileBank, setMobileBank] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [hajjiList, setHajjiList] = useState([]);
  const [allocations, setAllocations] = useState([]);

  // Fetch Hajji List
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/hajji")
      .then((res) => {
        console.log("Hajji API response:", res.data);
        // safety check for array
        setHajjiList(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching Hajji list:", err);
      });
  }, []);

  // Handle individual hajji allocation input
  const handleAmountChange = (hajjiId, amount) => {
    setAllocations((prev) => {
      const existing = prev.find((a) => a.hajjiId === hajjiId);
      if (existing) {
        return prev.map((a) =>
          a.hajjiId === hajjiId ? { ...a, amount: parseFloat(amount) || 0 } : a
        );
      } else {
        return [...prev, { hajjiId, amount: parseFloat(amount) || 0 }];
      }
    });
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!paymentType) return alert("Select Payment Type");

    const payload = { paymentType, allocations };

    if (paymentType === "bank") {
      if (!statementNo || !bankName)
        return alert("Statement No & Bank Name required");
      payload.statementNo = statementNo;
      payload.bankName = bankName;
    } else if (paymentType === "mobile") {
      if (!transactionId || !mobileBank)
        return alert("Transaction ID & Mobile Bank required");
      payload.transactionId = transactionId;
      payload.mobileBank = mobileBank;
    } else if (paymentType === "cash") {
      if (!receiptName) return alert("Receipt Number required");
      payload.receiptName = receiptName;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/payments/allocate",
        payload
      );
      alert(res.data.message || "Payment allocated successfully");

      // Reset form
      setPaymentType("");
      setStatementNo("");
      setBankName("");
      setTransactionId("");
      setMobileBank("");
      setReceiptName("");
      setAllocations([]);
    } catch (err) {
      alert(err.response?.data?.error || "Error allocating payment");

      console.error(err);
    }
  };

  return (
    <div className="payment-allocation">
      <h2>Payment Allocation</h2>

      <div className="form-group">
        <label>Payment Type:</label>
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="bank">Bank</option>
          <option value="mobile">Mobile</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      {/* Conditional Inputs */}
      {paymentType === "bank" && (
        <>
          <div className="form-group">
            <label>Statement No:</label>
            <input
              type="text"
              value={statementNo}
              onChange={(e) => setStatementNo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Bank Name:</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
        </>
      )}

      {paymentType === "mobile" && (
        <>
          <div className="form-group">
            <label>Transaction ID:</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Mobile Bank:</label>
            <input
              type="text"
              value={mobileBank}
              onChange={(e) => setMobileBank(e.target.value)}
            />
          </div>
        </>
      )}

      {paymentType === "cash" && (
        <div className="form-group">
          <label>Receipt Number:</label>
          <input
            type="text"
            value={receiptName}
            onChange={(e) => setReceiptName(e.target.value)}
          />
        </div>
      )}

      {/* Hajji List Table */}
      <h3>Hajji Allocation</h3>
      <table className="hajji-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Package Amount</th>
            <th>Paid Amount</th>
            <th>Allocate Amount</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(hajjiList) && hajjiList.length > 0 ? (
            hajjiList.map((h) => (
              <tr key={h._id}>
                <td>{h.fullName}</td>
                <td>{h.packageAmount}</td>
                <td>{h.paidAmount}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max={h.packageAmount - h.paidAmount}
                    value={
                      allocations.find((a) => a.hajjiId === h._id)?.amount || ""
                    }
                    onChange={(e) => handleAmountChange(h._id, e.target.value)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No Hajji found</td>
            </tr>
          )}
        </tbody>
      </table>

      <button className="submit-btn" onClick={handleSubmit}>
        Allocate Payment
      </button>

      {/* ================= Pure CSS ================= */}
      <style>{`
        .payment-allocation {
          max-width: 700px;
          margin: 20px auto;
          padding: 15px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background: #f9f9f9;
          font-family: Arial, sans-serif;
        }
        .form-group {
          margin-bottom: 12px;
        }
        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: bold;
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid #aaa;
        }
        .hajji-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .hajji-table th, .hajji-table td {
          border: 1px solid #ccc;
          padding: 6px 8px;
          text-align: left;
        }
        .hajji-table th {
          background: #eee;
        }
        .submit-btn {
          margin-top: 15px;
          padding: 8px 12px;
          border: none;
          background: #28a745;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        .submit-btn:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
}
