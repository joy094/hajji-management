// PaymentAllocation.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function PaymentAllocation() {
  const [paymentType, setPaymentType] = useState("");
  const [statementNo, setStatementNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [mobileBank, setMobileBank] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [amount, setAmount] = useState(""); // Total allocated amount (empty by default)
  const [hajjiList, setHajjiList] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [selectedHajjis, setSelectedHajjis] = useState([]);

  // custom select state & options
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const selectRef = useRef(null);
  const errorAudioRef = useRef(null);
  const paymentOptions = [
    {
      value: "",
      label: "Select Type",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#e6eef8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      ),
    },
    {
      value: "bank",
      label: "Bank",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#e6eef8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="4" />
          <path d="M5 11v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" />
        </svg>
      ),
    },
    {
      value: "mobile",
      label: "Mobile",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#e6eef8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M11 18h2" />
        </svg>
      ),
    },
    {
      value: "cash",
      label: "Cash",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#e6eef8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="10" rx="2" />
          <path d="M8 12h8" />
        </svg>
      ),
    },
  ];

  // Fetch Hajji List
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/hajji")
      .then((res) => {
        setHajjiList(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Error fetching Hajji list:", err));
  }, []);

  // Handle Hajji selection
  const handleHajjiSelect = (hajjiId) => {
    setSelectedHajjis((prev) =>
      prev.includes(hajjiId)
        ? prev.filter((id) => id !== hajjiId)
        : [...prev, hajjiId]
    );
    setAllocations((prev) => {
      if (!prev.find((a) => a.hajjiId === hajjiId)) {
        return [...prev, { hajjiId, amount: "" }];
      }
      return prev;
    });
  };

  // Handle individual allocation input
  const handleAmountChange = (hajjiId, value) => {
    setAllocations((prev) =>
      prev.map((a) =>
        a.hajjiId === hajjiId
          ? { ...a, amount: value === "" ? "" : parseFloat(value) || 0 }
          : a
      )
    );
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!paymentType) {
      alert("Select Payment Type");
      return;
    }

    if (selectedHajjis.length === 0) {
      alert("Select at least one Hajji");
      return;
    }

    // compute totalAllocated (treat blank as 0)
    const totalAllocated = allocations
      .filter((a) => selectedHajjis.includes(a.hajjiId))
      .reduce((s, a) => s + (parseFloat(a.amount) || 0), 0);

    // Validate total amount is provided
    if (amount === "" || isNaN(parseFloat(amount))) {
      alert("Enter the total amount to allocate");
      return;
    }

    if (totalAllocated !== parseFloat(amount)) {
      alert(
        `Allocated sum (${totalAllocated}) does not match the total amount (${amount})`
      );
      return;
    }

    const payload = {
      paymentType,
      allocations: allocations.filter((a) =>
        selectedHajjis.includes(a.hajjiId)
      ),
    };

    if (paymentType === "bank") {
      if (!statementNo || !bankName) {
        alert("Statement No & Bank Name required");
        return;
      }
      payload.statementNo = statementNo;
      payload.bankName = bankName;
    } else if (paymentType === "mobile") {
      if (!transactionId || !mobileBank) {
        alert("Transaction ID & Mobile Bank required");
        return;
      }
      payload.transactionId = transactionId;
      payload.mobileBank = mobileBank;
    } else if (paymentType === "cash") {
      if (!receiptName) {
        alert("Receipt Number required");
        return;
      }
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
      setSelectedHajjis([]);
      setAmount("");
    } catch (err) {
      const msg = err.response?.data?.error || "Error allocating payment";
      // Play special error sound for backend messages indicating 'already used' (case-insensitive)
      try {
        if (msg && /already\s+use(d)?/i.test(msg.toString())) {
          console.debug("Notification: playing error sound for message:", msg);
          await errorAudioRef.current?.play();
        }
      } catch (playErr) {
        console.warn("Failed to play error sound:", playErr);
      }
      alert(msg);
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

      <div className="form-group">
        <label>Total Amount to Allocate:</label>
        <input
          type="number"
          className="no-spin"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          onWheel={(e) => e.currentTarget.blur()}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown")
              e.preventDefault();
          }}
        />
      </div>

      {/* Hajji List with Agency + Passport */}
      <h3>Hajji Allocation</h3>
      <table className="hajji-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Agency</th>
            <th>Passport</th>
            <th>Package Amount</th>
            <th>Paid Amount</th>
            <th>Allocate Amount</th>
          </tr>
        </thead>
        <tbody>
          {hajjiList.length > 0 ? (
            hajjiList.map((h) => (
              <tr key={h._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedHajjis.includes(h._id)}
                    onChange={() => handleHajjiSelect(h._id)}
                  />
                </td>
                <td>{h.fullName}</td>
                <td>{h.agency?.name || "-"}</td>
                <td>{h.passportNo || h.passportNumber || h.passport || "-"}</td>
                <td>{h.packageAmount}</td>
                <td>{h.paidAmount}</td>
                <td>
                  <input
                    type="number"
                    className="no-spin"
                    inputMode="numeric"
                    min="0"
                    max={Math.max(0, h.packageAmount - h.paidAmount)}
                    value={
                      allocations.find((a) => a.hajjiId === h._id)?.amount || ""
                    }
                    onChange={(e) => handleAmountChange(h._id, e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown")
                        e.preventDefault();
                    }}
                    disabled={!selectedHajjis.includes(h._id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No Hajji found</td>
            </tr>
          )}
        </tbody>
      </table>

      <button className="submit-btn" onClick={handleSubmit}>
        Allocate Payment
      </button>
      {/* Hidden audio element for backend notifications (e.g., "No already Use") */}
      <audio ref={errorAudioRef} src="/sounds/error.mp3" preload="auto" />

      {/* PURE CSS - box-shadow design */}
      <style>{`
        :root{ --card-bg:#ffffff; --muted:#0b1220; --muted-2:#64748b; --accent-1:#6c5ce7; --accent-2:#ff7aa2; }

        .payment-allocation {
          max-width: 900px;
          margin: 20px auto;
          padding: 22px;
          border-radius: 12px;
          background: var(--card-bg);
          font-family: Inter, Arial, sans-serif;
          color: var(--muted);
          box-shadow: 0 8px 24px rgba(15,23,42,0.06), 0 2px 6px rgba(15,23,42,0.03) inset;
        }

        .payment-allocation h2, .payment-allocation h3 {
          color: var(--muted);
          margin-top: 0;
        }

        .form-group { margin-bottom: 12px; }
        .form-group label { display:block; margin-bottom:6px; font-weight:600; color:var(--muted); }

        .form-group input, .form-group select {
          width:100%;
          padding:10px 12px;
          border-radius:8px;
          border:1px solid rgba(15,23,42,0.06);
          background:#fff;
          box-shadow: 0 6px 18px rgba(12,16,26,0.06);
          transition: box-shadow 160ms ease, transform 140ms ease;
          font-size:14px;
          color:var(--muted);
        }
        .form-group input::placeholder { color: var(--muted-2); }
        .form-group input:focus, .form-group select:focus { outline:none; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(12,46,120,0.08); border-color: rgba(96,165,250,0.12); }

        /* Hide number input spinners for the Total Amount input */
        input.no-spin::-webkit-outer-spin-button,
        input.no-spin::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input.no-spin { -moz-appearance: textfield; }
        input.no-spin:focus { outline: none; }
        /* Prevent accidental wheel changes by blurring on wheel - handled via onWheel handler */

        .hajji-table { width:100%; border-collapse:separate; border-spacing:0 10px; margin-top:18px; }
        .hajji-table th { text-align:left; padding:10px 8px; color:var(--muted); font-weight:700; }
        .hajji-table tbody tr { background:#fff; border-radius:8px; box-shadow: 0 6px 18px rgba(15,23,42,0.06); transition: box-shadow 160ms ease, transform 160ms ease; }
        .hajji-table tbody tr:hover { box-shadow: 0 14px 36px rgba(15,23,42,0.10); transform: translateY(-4px); }
        .hajji-table td { padding:12px 8px; border:none; color:var(--muted); }

        .hajji-table input[type="checkbox"], .hajji-table input[type="number"] { padding:6px 8px; border-radius:6px; border:1px solid rgba(15,23,42,0.06); }
        .hajji-table input[type="number"]:focus { box-shadow: 0 10px 28px rgba(12,46,120,0.06); }

        .submit-btn {
          margin-top: 18px; padding:10px 20px; border-radius:8px; border:none; cursor:pointer; font-weight:700; color:#fff; background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%); box-shadow: 0 10px 30px rgba(108,92,231,0.12); transition: box-shadow 160ms ease, transform 160ms ease;
        }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(108,92,231,0.18); }

        @media (max-width:820px){ .payment-allocation{ padding:16px } .hajji-table td{ padding:10px 6px } }
        @media (prefers-reduced-motion: reduce){ .form-group input, .form-group select, .submit-btn, .hajji-table tbody tr { transition:none !important; transform:none !important; } }
      `}</style>
    </div>
  );
}
