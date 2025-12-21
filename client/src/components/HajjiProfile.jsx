// HajjiProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "../utils/api";

export default function HajjiProfile({ hajjiId }) {
  const [hajji, setHajji] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!hajjiId) return;
    fetchHajji();
  }, [hajjiId]);

  const fetchHajji = async () => {
    try {
      const hajjiRes = await axios.get(`/hajji`, { params: { _id: hajjiId } });
      const hajjiData = hajjiRes.data[0];
      setHajji(hajjiData);

      const paymentRes = await axios.get("/hajjiPayment", {
        params: { hajjiId },
      });
      setPayments(paymentRes.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching Hajji profile");
    }
  };

  if (!hajji) return <div>Loading...</div>;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const due = hajji.packagePrice - hajji.discount - totalPaid;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      <h2>Hajji Profile</h2>
      <div style={styles.profile}>
        <p>
          <strong>Name:</strong> {hajji.name}
        </p>
        <p>
          <strong>Passport Number:</strong> {hajji.passportNumber}
        </p>
        <p>
          <strong>Mobile:</strong> {hajji.mobile}
        </p>
        <p>
          <strong>Package:</strong> {hajji.packageName}
        </p>
        <p>
          <strong>Package Price:</strong> {hajji.packagePrice}
        </p>
        <p>
          <strong>Discount:</strong> {hajji.discount}
        </p>
        <p>
          <strong>Total Paid:</strong> {totalPaid}
        </p>
        <p>
          <strong>Due:</strong> {due}
        </p>
        <p>
          <strong>Status:</strong> {hajji.status}
        </p>
      </div>

      <h3>Payments</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Method</th>
            <th>Bank / Service</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id}>
              <td>{p.method}</td>
              <td>{p.bankOrServiceName || "-"}</td>
              <td>{p.amount}</td>
              <td>{new Date(p.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handlePrint} style={styles.button}>
        Print Profile
      </button>
    </div>
  );
}

const styles = {
  container: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
    maxWidth: "700px",
    marginBottom: "1rem",
  },
  profile: {
    marginBottom: "1rem",
    lineHeight: "1.5rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "1rem",
  },
  button: {
    padding: "0.6rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
