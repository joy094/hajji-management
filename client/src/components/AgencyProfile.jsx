import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AgencyProfile() {
  const { id } = useParams();

  const [agency, setAgency] = useState(null);
  const [hajjis, setHajjis] = useState([]);
  const [ledger, setLedger] = useState([]);

  /* =============================
     Load Agency + Hajji + Ledger
  ============================== */
  useEffect(() => {
    // Agency basic info + hajji under agency
    fetch(`http://localhost:5000/api/agencies/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAgency(data.agency);
        setHajjis(data.hajji || []);
      });

    // Agency Ledger (Statement wise)
    fetch(`http://localhost:5000/api/reports/agency-ledger/${id}`)
      .then((res) => res.json())
      .then(setLedger);
  }, [id]);

  if (!agency) return <p>Loading...</p>;

  /* =============================
     Calculations
  ============================== */
  const totalPackage = hajjis.reduce((s, h) => s + h.packageAmount, 0);
  const totalPaid = hajjis.reduce((s, h) => s + h.paidAmount, 0);
  const totalDue = totalPackage - totalPaid;

  /* =============================
     Print Handler
  ============================== */
  const printStatement = () => {
    window.print();
  };

  return (
    <div className="agency-profile">
      <h2>{agency.name} – Agency Profile</h2>

      {/* ================= SUMMARY ================= */}
      <div className="summary">
        <div className="card">
          Total Hajji
          <br />
          {hajjis.length}
        </div>
        <div className="card">
          Package
          <br />৳ {totalPackage}
        </div>
        <div className="card paid">
          Paid
          <br />৳ {totalPaid}
        </div>
        <div className="card due">
          Due
          <br />৳ {totalDue}
        </div>
      </div>

      {/* ================= HAJJI TABLE ================= */}
      <h3>Hajji List</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Package</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {hajjis.map((h) => (
            <tr key={h._id}>
              <td>{h.fullName}</td>
              <td>{h.packageAmount}</td>
              <td>{h.paidAmount}</td>
              <td>{h.packageAmount - h.paidAmount}</td>
              <td>{h.status}</td>
            </tr>
          ))}
          {hajjis.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No Hajji Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ================= LEDGER ================= */}
      <h3>Payment Ledger (Statement / Receipt Wise)</h3>

      {ledger.length === 0 && <p>No payment record found.</p>}

      {ledger.map((s) => (
        <div key={s.statementId} className="statement-box">
          <div className="statement-header">
            <div>
              <strong>Statement / Receipt:</strong> {s.statementNo}
              <br />
              <strong>Bank:</strong> {s.bankName}
              <br />
              <strong>Date:</strong>{" "}
              {new Date(s.statementDate).toLocaleDateString()}
            </div>

            <div>
              <strong>Total:</strong> ৳ {s.totalAmount}
              <br />
              <strong>Allocated:</strong> ৳ {s.allocatedAmount}
            </div>
          </div>

          <table className="inner-table">
            <thead>
              <tr>
                <th>Hajji Name</th>
                <th>Allocated Amount</th>
              </tr>
            </thead>
            <tbody>
              {s.hajjiList.map((h) => (
                <tr key={h.hajjiId}>
                  <td>{h.name}</td>
                  <td>৳ {h.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <button className="print-btn" onClick={printStatement}>
        🖨 Print Report
      </button>

      {/* ================= PURE CSS ================= */}
      <style>{`
        .agency-profile {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
        }

        h2 {
          margin-bottom: 15px;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
        }

        .card.paid {
          background: #d1e7dd;
        }

        .card.due {
          background: #f8d7da;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th, td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }

        h3 {
          margin-top: 25px;
        }

        .statement-box {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 10px;
          margin-top: 15px;
        }

        .statement-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .inner-table th {
          background: #f1f3f5;
        }

        .print-btn {
          margin-top: 20px;
          padding: 10px 15px;
          border: none;
          background: #0d6efd;
          color: white;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
        }

        @media print {
          .print-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
