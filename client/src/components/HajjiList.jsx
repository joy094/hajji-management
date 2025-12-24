import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HajjiList() {
  const [hajjis, setHajjis] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [filterAgency, setFilterAgency] = useState("");
  const navigate = useNavigate();

  // Load Hajji & Agencies
  const loadHajjis = () => {
    const url = "http://localhost:5000/api/hajji";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        if (filterAgency) {
          // Backend may or may not support agency filtering consistently.
          // Apply a client-side fallback filter to ensure UI works.
          const filtered = list.filter((h) => {
            const agencyId = h.agency?._id ?? h.agency?.id ?? h.agency;
            return String(agencyId) === String(filterAgency);
          });
          setHajjis(filtered);
        } else {
          setHajjis(list);
        }
      })
      .catch((err) => {
        console.error("Error loading hajjis:", err);
        setHajjis([]);
      });
  };

  const loadAgencies = () => {
    fetch("http://localhost:5000/api/agencies")
      .then((res) => res.json())
      .then(setAgencies)
      .catch((err) => {
        console.error("Error loading agencies:", err);
        setAgencies([]);
      });
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

      {/* ================= PURE CSS (Clean Box-Shadow Design) ================= */}
      <style>{`
        /* Palette */
        :root{ --bg-0:#0f1724; --card:#ffffff; --muted:#e6eef8; --accent:#6c5ce7; --accent-2:#ff7aa2; }

        .hajji-list {
          position: relative;
          padding: 18px;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,251,253,0.98));
          color: #0b1220;
          overflow: visible;
          box-shadow: 0 8px 24px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04) inset;
        }

        .top-bar{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; }
        .top-bar h2{ margin:0; font-size:18px; color:var(--muted); }

        /* Primary button: simple elevated style */
        .btn-primary{ display:inline-flex; align-items:center; gap:8px; padding:8px 14px; border-radius:10px; font-weight:700; color:#fff; border:none; cursor:pointer; background: linear-gradient(135deg,var(--accent) 0%, var(--accent-2) 100%); box-shadow: 0 8px 20px rgba(108,92,231,0.12); transition: box-shadow 160ms ease, transform 160ms ease; }
        .btn-primary:hover{ transform: translateY(-2px); box-shadow: 0 14px 32px rgba(108,92,231,0.18); }
        .btn-primary:focus{ outline:none; box-shadow: 0 0 0 4px rgba(108,92,231,0.08); }

        .filter-bar{ display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .filter-bar label{ color:#0b1220; font-weight:600; }

        /* Select: flat with crisp shadow */
        .filter-bar select{ appearance:none; padding:8px 36px 8px 12px; border-radius:8px; border:1px solid rgba(15,23,42,0.06); background:#fff; color:#0b1220; box-shadow: 0 6px 18px rgba(12,16,26,0.06); background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%230b1220' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position: calc(100% - 12px) center; transition: box-shadow 160ms ease; }
        .filter-bar select:focus{ box-shadow: 0 10px 28px rgba(12,46,120,0.08); border-color: rgba(96,165,250,0.12); outline:none; }

        /* Table: clear separation using spacing and drop shadows */
        table{ width:100%; border-collapse:separate; border-spacing:0 12px; }
        thead tr th{ color:#0b1220; font-weight:700; padding:10px 12px; text-align:left; }

        tbody tr{ background:#fff; border-radius:10px; box-shadow: 0 6px 20px rgba(15,23,42,0.06); transition: box-shadow 160ms ease, transform 160ms ease; }
        tbody tr:hover{ box-shadow: 0 16px 36px rgba(15,23,42,0.10); }
        tbody td{ padding:12px 10px; border:none; color:#0b1220; }

        /* Actions */
        .actions button{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:8px; border:none; font-weight:700; cursor:pointer; transition: box-shadow 140ms ease, transform 140ms ease; }
        .actions button:hover{ transform: translateY(-2px); }
        .actions .edit{ background:#ffd966; color:#0b1220; box-shadow: 0 8px 18px rgba(255,193,7,0.08); }
        .actions .delete{ background:#ff7b7b; color:#fff; box-shadow: 0 8px 18px rgba(220,53,69,0.08); }

        /* Empty state */
        tbody tr.empty-row td{ text-align:center; padding:28px 12px; color:#667085; }

        /* Responsive */
        @media (max-width:820px){ .top-bar{ flex-direction:column; align-items:stretch; gap:12px } table{ border-spacing:0 8px } tbody td{ padding:10px 8px } }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce){ .filter-bar select, .btn-primary, tbody tr { transition:none !important; transform:none !important; animation:none !important; } }
      `}</style>
    </div>
  );
}
