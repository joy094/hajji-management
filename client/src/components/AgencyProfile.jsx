import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AgencyProfile() {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [hajjis, setHajjis] = useState([]);
  const [statements, setStatements] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/agencies/${id}`)
      .then((res) => res.json())
      .then(setAgency);

    fetch(`http://localhost:5000/api/hajji?agency=${id}`)
      .then((res) => res.json())
      .then(setHajjis);

    fetch(`http://localhost:5000/api/statements?agency=${id}`)
      .then((res) => res.json())
      .then(setStatements);
  }, [id]);

  if (!agency) return <p>Loading...</p>;

  const totalPackage = hajjis.reduce((s, h) => s + h.packageAmount, 0);
  const totalPaid = hajjis.reduce((s, h) => s + h.paidAmount, 0);
  const totalDue = totalPackage - totalPaid;

  return (
    <div className="agency-profile">
      <h2>{agency.name} – Profile</h2>

      {/* Summary */}
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

      {/* Hajji Table */}
      <h3>Hajji Status</h3>
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
        </tbody>
      </table>

      {/* Statement Summary */}
      <h3>Bank Statements</h3>
      <table>
        <thead>
          <tr>
            <th>Statement No</th>
            <th>Total Amount</th>
            <th>Allocated</th>
            <th>Adjustment</th>
          </tr>
        </thead>
        <tbody>
          {statements.map((s) => (
            <tr key={s._id}>
              <td>{s.statementNo}</td>
              <td>{s.totalAmount}</td>
              <td>{s.allocatedAmount}</td>
              <td>{s.adjustmentAmount || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PURE CSS */}
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
      `}</style>
    </div>
  );
}
