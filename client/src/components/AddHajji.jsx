import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AddHajji() {
  const { id } = useParams(); // edit হলে id থাকবে
  const navigate = useNavigate();

  const [agencies, setAgencies] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    passportNumber: "",
    address: "",
    mobile: "",
    agency: "",
    packageAmount: "",
    status: "Active",
    notes: "",
  });

  // Load agencies
  useEffect(() => {
    fetch("http://localhost:5000/api/agencies")
      .then((res) => res.json())
      .then(setAgencies);
  }, []);

  // Edit mode হলে হাজির ডাটা লোড
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/api/hajji`)
      .then((res) => res.json())
      .then((data) => {
        const h = data.find((x) => x._id === id);
        if (h) {
          setForm({
            fullName: h.fullName,
            passportNumber: h.passportNumber,
            address: h.address || "",
            mobile: h.mobile || "",
            agency: h.agency?._id,
            packageAmount: h.packageAmount,
            status: h.status,
            notes: h.notes || "",
          });
        }
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = id
      ? `http://localhost:5000/api/hajji/${id}`
      : "http://localhost:5000/api/hajji";

    const method = id ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert(id ? "Hajji Updated" : "Hajji Added");
    navigate("/hajji");
  };

  return (
    <div className="hajji-form">
      <h2>{id ? "Edit Hajji" : "Add Hajji"}</h2>

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <label>Passport Number</label>
        <input
          name="passportNumber"
          value={form.passportNumber}
          onChange={handleChange}
          required
        />

        <label>Mobile</label>
        <input name="mobile" value={form.mobile} onChange={handleChange} />

        <label>Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} />

        <label>Agency</label>
        <select
          name="agency"
          value={form.agency}
          onChange={handleChange}
          required
        >
          <option value="">Select Agency</option>
          {agencies.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>

        <label>Package Amount</label>
        <input
          type="number"
          name="packageAmount"
          value={form.packageAmount}
          onChange={handleChange}
          required
        />

        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Hold">Hold</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} />

        <button type="submit">{id ? "Update Hajji" : "Add Hajji"}</button>
      </form>

      {/* ================= PURE CSS ================= */}
      <style>{`
        .hajji-form {
          max-width: 600px;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
        }

        h2 {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-top: 12px;
          font-weight: 600;
        }

        input, select, textarea {
          width: 100%;
          padding: 8px;
          margin-top: 4px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        textarea {
          resize: vertical;
        }

        button {
          margin-top: 20px;
          padding: 10px;
          width: 100%;
          background: #198754;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        }

        button:hover {
          background: #157347;
        }
      `}</style>
    </div>
  );
}
