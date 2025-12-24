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
          background: #f8f9fa;
          padding: 30px;
          border-radius: 10px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        h2 {
          margin-bottom: 25px;
          color: #2c3e50;
          font-size: 28px;
          border-bottom: 3px solid #0d6efd;
          padding-bottom: 10px;
        }

        h3 {
          margin-top: 30px;
          margin-bottom: 15px;
          color: #34495e;
          font-size: 18px;
          font-weight: 600;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .card {
          background: linear-gradient(135deg, #2b7ed2 0%, #1e5aa8 100%);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          font-weight: 700;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .card.paid {
          background: linear-gradient(135deg, #2cd78a 0%, #1aa85a 100%);
        }

        .card.due {
          background: linear-gradient(135deg, #da3636 0%, #b52a2a 100%);
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 15px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        thead {
          background: linear-gradient(135deg, #0d6efd 0%, #0856ca 100%);
        }

        th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: white;
          border: none;
        }

        td {
          padding: 12px 16px;
          border-bottom: 1px solid #e9ecef;
          color: #495057;
        }

        tbody tr {
          transition: background-color 0.2s;
        }

        tbody tr:hover {
          background-color: #f8f9fa;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        .statement-box {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .statement-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e9ecef;
          font-size: 14px;
          gap: 20px;
        }

        .statement-header strong {
          color: #2c3e50;
        }

        .statement-header div {
          flex: 1;
          line-height: 1.8;
        }

        .inner-table {
          margin-top: 10px;
        }

        .inner-table th {
          background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
          font-size: 13px;
        }

        .inner-table td {
          font-size: 14px;
        }

        .print-btn {
          display: block;
          margin-top: 30px;
          padding: 12px 25px;
          border: none;
          background: linear-gradient(135deg, #0d6efd 0%, #0856ca 100%);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
        }

        .print-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
        }

        .print-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .agency-profile {
            padding: 20px;
          }

          h2 {
            font-size: 22px;
          }

          .summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .statement-header {
            flex-direction: column;
          }

          table {
            font-size: 13px;
          }

          th, td {
            padding: 10px 12px;
          }
        }

        @media print {
          .print-btn {
            display: none;
          }

          .agency-profile {
            padding: 0;
            background: white;
          }

          .statement-box {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
