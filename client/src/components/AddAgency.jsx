import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AddAgency() {
  const { id } = useParams(); // থাকলে edit mode
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    mobile: "",
    address: "",
    notes: "",
  });

  // Edit mode হলে agency data load
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/api/agencies/${id}`)
      .then((res) => res.json())
      .then((data) => {
        // Server returns { agency, hajji }
        const agency = data?.agency || data || {};
        setForm({
          name: agency.name || "",
          contactPerson: agency.contactPerson || "",
          mobile: agency.mobile || "",
          address: agency.address || "",
          notes: agency.notes || "",
        });
      })
      .catch((err) => {
        console.error("Error loading agency:", err);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = id
      ? `http://localhost:5000/api/agencies/${id}`
      : "http://localhost:5000/api/agencies";

    const method = id ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert(id ? "Agency Updated Successfully" : "Agency Added Successfully");
    navigate("/agency-list");
  };

  return (
    <div className="agency-form">
      <h2>{id ? "Edit Agency" : "Add New Agency"}</h2>

      <form onSubmit={handleSubmit}>
        <label>Agency Name *</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Contact Person</label>
        <input
          name="contactPerson"
          value={form.contactPerson}
          onChange={handleChange}
        />

        <label>Mobile Number</label>
        <input name="mobile" value={form.mobile} onChange={handleChange} />

        <label>Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} />

        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} />

        <button type="submit">{id ? "Update Agency" : "Save Agency"}</button>
      </form>

      {/* ================= PURE CSS ================= */}
      <style>{`
        .agency-form {
          max-width: 600px;
          background: #ffffff;
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

        input, textarea {
          width: 100%;
          padding: 8px;
          margin-top: 4px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }

        textarea {
          resize: vertical;
          min-height: 70px;
        }

        button {
          margin-top: 20px;
          padding: 10px;
          width: 100%;
          background: #0d6efd;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        }

        button:hover {
          background: #0b5ed7;
        }
      `}</style>
    </div>
  );
}
