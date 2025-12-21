import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HajjiList() {
  const [hajjis, setHajjis] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [filterAgency, setFilterAgency] = useState("");
  const navigate = useNavigate();

  // Load Hajji & Agencies
  const loadHajjis = () => {
    let url = "http://localhost:5000/api/hajji";
    if (filterAgency) url += `?agency=${filterAgency}`;

    fetch(url)
      .then((res) => res.json())
      .then(setHajjis);
  };

  const loadAgencies = () => {
    fetch("http://localhost:5000/api/agencies")
      .then((res) => res.json())
      .then(setAgencies);
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  useEffect(() => {
    loadHajjis();
  }, [filterAgency]);

  // Delete Hajji
  const deleteHajji = async (id) => {
    if (!window.confirm("আপনি কি এই হাজীকে ডিলিট করতে চান?")) return;

    await fetch(`http://localhost:5000/api/hajji/${id}`, {
      method: "DELETE",
    });

    loadHajjis();
  };

  return (
    <div className="hajji-list">
      {/* Top Bar */}
      <div className="top-bar">
        <h2>Hajji Management</h2>
        <button onClick={() => navigate("/hajji/new")}>+ Add Hajji</button>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <label>Filter by Agency:</label>
        <select
          value={filterAgency}
          onChange={(e) => setFilterAgency(e.target.value)}
        >
          <option value="">All Agencies</option>
          {agencies.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Hajji Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Passport</th>
            <th>Agency</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hajjis.map((h) => (
            <tr key={h._id}>
              <td>{h.fullName}</td>
              <td>{h.passportNumber}</td>
              <td>{h.agency?.name || "-"}</td>
              <td>{h.paidAmount}</td>
              <td>{h.packageAmount - h.paidAmount}</td>
              <td>{h.status}</td>
              <td className="actions">
                <button
                  className="edit"
                  onClick={() => navigate(`/hajji/${h._id}`)}
                >
                  Edit
                </button>
                <button className="delete" onClick={() => deleteHajji(h._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {hajjis.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No Hajji found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ================= PURE CSS ================= */}
      <style>{`
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .top-bar button {
          padding: 6px 12px;
          background: #198754;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
        }

        .filter-bar {
          margin-bottom: 15px;
        }

        .filter-bar select {
          padding: 5px 10px;
          margin-left: 10px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #f1f3f5;
          text-align: left;
          padding: 10px;
        }

        td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }

        .actions button {
          margin-right: 5px;
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
        }

        .actions .edit {
          background: #ffc107;
          color: #000;
        }

        .actions .delete {
          background: #dc3545;
          color: #fff;
        }

        .actions button:hover {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
