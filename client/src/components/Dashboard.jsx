// Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [agencies, setAgencies] = useState([]);
  const [hajjis, setHajjis] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    // Fetch Agencies with summary
    axios
      .get("http://localhost:5000/api/agencies")
      .then((res) => setAgencies(res.data))
      .catch((err) => console.error(err));

    // Fetch Hajji list
    axios
      .get("http://localhost:5000/api/hajji")
      .then((res) => setHajjis(res.data))
      .catch((err) => console.error(err));

    // Fetch recent payments
    axios
      .get("http://localhost:5000/api/payments/recent") // backend এ recent payments API
      .then((res) => setPayments(res.data))
      .catch((err) => console.error(err));
  }, []);

  const totalHajjis = hajjis.length;
  const totalAgencies = agencies.length;
  const totalPaid = hajjis.reduce((s, h) => s + h.paidAmount, 0);
  const totalDue = hajjis.reduce((s, h) => s + (h.packageAmount - h.paidAmount), 0);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card agencies">
          <h3>Agencies</h3>
          <p>{totalAgencies}</p>
        </div>
        <div className="card hajjis">
          <h3>Total Hajjis</h3>
          <p>{totalHajjis}</p>
        </div>
        <div className="card paid">
          <h3>Total Paid</h3>
          <p>৳ {totalPaid}</p>
        </div>
        <div className="card due">
          <h3>Total Due</h3>
          <p>৳ {totalDue}</p>
        </div>
      </div>

      {/* Recent Hajjis */}
      <h2>Recent Hajjis</h2>
      <table className="recent-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Agency</th>
            <th>Package</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {hajjis.slice(-5).reverse().map((h) => (
            <tr key={h._id}>
              <td>{h.fullName}</td>
              <td>{h.agency?.name || "-"}</td>
              <td>{h.packageAmount}</td>
              <td>{h.paidAmount}</td>
              <td>{h.packageAmount - h.paidAmount}</td>
              <td>{h.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Recent Payments */}
      <h2>Recent Payments</h2>
      <table className="recent-table">
        <thead>
          <tr>
            <th>Statement No</th>
            <th>Agency</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.slice(-5).reverse().map((p) => (
            <tr key={p._id}>
              <td>{p.statementNo}</td>
              <td>{p.agency?.name || "-"}</td>
              <td>৳ {p.amount}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PURE CSS */}
      <style>{`
        .dashboard {
          max-width: 1100px;
          margin: 20px auto;
          padding: 15px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        h1 {
          margin-bottom: 20px;
          color: #333;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        .card {
          padding: 20px;
          border-radius: 8px;
          color: #fff;
          font-weight: bold;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-3px);
        }
        .card.agencies { background: #0d6efd; }
        .card.hajjis { background: #6f42c1; }
        .card.paid { background: #198754; }
        .card.due { background: #dc3545; }
        .card h3 {
          margin-bottom: 10px;
          font-size: 16px;
        }
        .card p {
          font-size: 24px;
        }
        h2 {
          margin-top: 30px;
          margin-bottom: 10px;
          color: #444;
        }
        .recent-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .recent-table th, .recent-table td {
          padding: 8px 12px;
          border: 1px solid #ccc;
          text-align: left;
        }
        .recent-table th {
          background: #f1f3f5;
        }
        .recent-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        .recent-table tr:hover {
          background: #e9ecef;
        }
      `}</style>
    </div>
  );
}
