import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AgencyList() {
  const [agencies, setAgencies] = useState([]);
  const navigate = useNavigate();

  const loadAgencies = () => {
    fetch("http://localhost:5000/api/agencies")
      .then((res) => res.json())
      .then(setAgencies);
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const deleteAgency = async (id) => {
    if (
      !window.confirm("এই এজেন্সি ডিলিট করলে সব হাজীর লিংক থাকবে না। Continue?")
    )
      return;

    await fetch(`http://localhost:5000/api/agencies/${id}`, {
      method: "DELETE",
    });

    loadAgencies();
  };

  return (
    <div className="agency-list">
      {/* Top Bar */}
      <div className="top-bar">
        <h2>Agency Management</h2>
        <button className="add-btn" onClick={() => navigate("/agencies/new")}>
          + Add Agency
        </button>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Agency Name</th>
            <th>Contact</th>
            <th>Mobile</th>
            <th>Total Hajji</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {agencies.map((a) => (
            <tr key={a._id}>
              <td>{a.name}</td>
              <td>{a.contactPerson || "-"}</td>
              <td>{a.mobile || "-"}</td>
              <td>{a.hajjiCount || 0}</td>
              <td className="actions">
                <button
                  className="view"
                  onClick={() => navigate(`/agencies/${a._id}`)}
                >
                  Profile
                </button>

                <button
                  className="edit"
                  onClick={() => navigate(`/agencies/${a._id}/edit`)}
                >
                  Edit
                </button>

                <button className="delete" onClick={() => deleteAgency(a._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {agencies.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No agency found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ================= PURE CSS ================= */}
      <style>{`
        .agency-list {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .add-btn {
          padding: 8px 14px;
          background: #198754;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
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
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
        }

        .actions button {
          margin-right: 6px;
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }

        .actions .view {
          background: #0d6efd;
          color: #fff;
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
