import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/agencies")
      .then((res) => res.json())
      .then(setData);
  }, []);

  const totalHajji = data.reduce((s, a) => s + a.totalHajji, 0);
  const totalPaid = data.reduce((s, a) => s + a.paidAmount, 0);
  const totalDue = data.reduce((s, a) => s + a.dueAmount, 0);

  return (
    <div className="dashboard">
      <div className="card">Agencies: {data.length}</div>
      <div className="card">Hajji: {totalHajji}</div>
      <div className="card">Paid: {totalPaid}</div>
      <div className="card">Due: {totalDue}</div>

      <style>{`
        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
          gap: 16px;
        }
        .card {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,.08);
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
