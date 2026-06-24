import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty_id: "",
  });

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "", // optional
    specialty_id: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const normalizeDoctor = (doctor) => {
    if (!doctor) return doctor;

    const userName = doctor.user?.name;
    const userEmail = doctor.user?.email;

    return {
      ...doctor,
      // display helpers
      display_name: userName || doctor.name || "—",
      display_email: userEmail || "—",
    };
  };

  const normalizedDoctors = useMemo(
    () => doctors.map(normalizeDoctor),
    [doctors]
  );

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/doctors");

      const items = res?.data?.data?.items ?? res?.data?.data ?? [];
      setDoctors(items);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const clearErrors = () => {
    setError("");
    setFieldErrors({});
  };

  const extractLaravelErrors = (err) => {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Validation failed";

    const errors = err?.response?.data?.errors || {};
    return { message, errors };
  };

  const validateAddForm = () => {
    clearErrors();

    const errs = {};
    if (!addForm.name.trim()) errs.name = "Doctor name is required";
    if (!addForm.email.trim()) errs.email = "Email is required";
    if (!addForm.password.trim()) errs.password = "Password is required";
    if (!addForm.specialty_id) errs.specialty_id = "Specialty ID is required";

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setError("Please fix the highlighted fields.");
      return false;
    }

    return true;
  };

  const handleAddDoctor = async () => {
    if (!validateAddForm()) return;

    try {
      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        password: addForm.password,
        specialty_id: Number(addForm.specialty_id),
      };

      const res = await api.post("/admin/doctors", payload);

      // ✅ controller returns: data.doctor
      const created = res?.data?.data?.doctor ?? res?.data?.data;
      if (!created?.id) {
        setError("Doctor created but response format was unexpected.");
        return;
      }

      setDoctors((prev) => [created, ...prev]);

      setShowAddModal(false);
      setAddForm({ name: "", email: "", password: "", specialty_id: "" });

      alert("Doctor added successfully ✅");
    } catch (err) {
      const { message, errors } = extractLaravelErrors(err);
      setError(message || "Failed to add doctor");
      setFieldErrors(errors || {});
    }
  };

  const openEditModal = (doctor) => {
    clearErrors();
    setSelectedDoctor(doctor);

    setEditForm({
      name: doctor.user?.name || doctor.name || "",
      email: doctor.user?.email || "",
      password: "", // optional; empty = no change
      specialty_id: doctor.specialty_id ?? "",
    });

    setShowEditModal(true);
  };

  const validateEditForm = () => {
    clearErrors();

    const errs = {};
    if (!editForm.name.trim()) errs.name = "Doctor name is required";
    if (!editForm.specialty_id) errs.specialty_id = "Specialty ID is required";
    // email optional في update، لكن لو مكتوب لازم يكون شكل email
    if (editForm.email && !/^\S+@\S+\.\S+$/.test(editForm.email)) {
      errs.email = "Invalid email format";
    }
    // password optional، لكن لو مكتوب لازم 8+
    if (editForm.password && editForm.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setError("Please fix the highlighted fields.");
      return false;
    }

    return true;
  };

  const handleUpdateDoctor = async () => {
    if (!selectedDoctor) return;
    if (!validateEditForm()) return;

    try {
      const payload = {
        name: editForm.name.trim(),
        specialty_id: Number(editForm.specialty_id),
      };

      // optional fields
      if (editForm.email.trim()) payload.email = editForm.email.trim();
      if (editForm.password) payload.password = editForm.password;

      const res = await api.put(`/admin/doctors/${selectedDoctor.id}`, payload);

      const updated = res?.data?.data?.doctor ?? res?.data?.data;
      if (!updated?.id) {
        // حتى لو السيرفر رجع فقط success، نعمل تحديث محلي minimal
        setDoctors((prev) =>
          prev.map((doc) =>
            doc.id === selectedDoctor.id
              ? {
                  ...doc,
                  name: payload.name,
                  specialty_id: payload.specialty_id,
                  user: doc.user
                    ? {
                        ...doc.user,
                        name: payload.name,
                        email: payload.email ?? doc.user.email,
                      }
                    : doc.user,
                }
              : doc
          )
        );
      } else {
        setDoctors((prev) =>
          prev.map((doc) => (doc.id === updated.id ? updated : doc))
        );
      }

      setShowEditModal(false);
      setSelectedDoctor(null);
      setEditForm({ name: "", email: "", password: "", specialty_id: "" });

      alert("Doctor updated successfully ✅");
    } catch (err) {
      const { message, errors } = extractLaravelErrors(err);
      setError(message || "Failed to update doctor");
      setFieldErrors(errors || {});
    }
  };

  const handleDelete = async (id) => {
    clearErrors();
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      await api.delete(`/admin/doctors/${id}`);
      setDoctors((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Cannot delete doctor (maybe has appointments)";
      alert(msg);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading doctors...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2 style={{ marginBottom: 10 }}>Manage Doctors</h2>

      <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
        + Add Doctor
      </button>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Appointments</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {normalizedDoctors.map((doctor) => (
            <tr key={doctor.id}>
              <td style={styles.td}>{doctor.id}</td>
              <td style={styles.td}>{doctor.display_name}</td>
              <td style={styles.td}>{doctor.display_email}</td>
              <td style={styles.td}>{doctor.appointments_count ?? 0}</td>
              <td style={styles.td}>
                <button
                  style={styles.editBtn}
                  onClick={() => openEditModal(doctor)}
                >
                  Edit
                </button>

                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(doctor.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Add New Doctor</h3>

            <input
              type="text"
              placeholder="Doctor Name"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              style={{
                ...styles.input,
                borderColor: fieldErrors.name ? "#dc2626" : "#cbd5e1",
              }}
            />
            {fieldErrors.name && <p style={styles.error}>{fieldErrors.name}</p>}

            <input
              type="email"
              placeholder="Doctor Email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              style={{
                ...styles.input,
                borderColor: fieldErrors.email ? "#dc2626" : "#cbd5e1",
              }}
            />
            {fieldErrors.email && (
              <p style={styles.error}>{fieldErrors.email}</p>
            )}

            <input
              type="password"
              placeholder="Temporary Password (min 8)"
              value={addForm.password}
              onChange={(e) =>
                setAddForm({ ...addForm, password: e.target.value })
              }
              style={{
                ...styles.input,
                borderColor: fieldErrors.password ? "#dc2626" : "#cbd5e1",
              }}
            />
            {fieldErrors.password && (
              <p style={styles.error}>{fieldErrors.password}</p>
            )}

            <input
              type="number"
              placeholder="Specialty ID"
              value={addForm.specialty_id}
              onChange={(e) =>
                setAddForm({ ...addForm, specialty_id: e.target.value })
              }
              style={{
                ...styles.input,
                borderColor: fieldErrors.specialty_id ? "#dc2626" : "#cbd5e1",
              }}
            />
            {fieldErrors.specialty_id && (
              <p style={styles.error}>{fieldErrors.specialty_id}</p>
            )}

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({
                    name: "",
                    email: "",
                    password: "",
                    specialty_id: "",
                  });
                  clearErrors();
                }}
                style={styles.cancel}
              >
                Cancel
              </button>

              <button onClick={handleAddDoctor} style={styles.save}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDoctor && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Doctor #{selectedDoctor.id}</h3>

            <input
              type="text"
              placeholder="Doctor Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              style={{
                ...styles.input,
                borderColor: fieldErrors.name ? "#dc2626" : "#cbd5e1",
              }}
            />
            {fieldErrors.name && <p style={styles.error}>{fieldErrors.name}</p>}

            <input
              type="email"
              placeholder="Doctor Email (optional)"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              style={{
                ...styles.input,
                borderColor: fieldErrors.email ? "#dc2626" : "#cbd5e1",
              }}
            />
            {fieldErrors.email && (
              <p style={styles.error}>{fieldErrors.email}</p>
            )}

            <input
              type="password"
              placeholder="New Password (optional)"
              value={editForm.password}
              onChange={(e) =>
                setEditForm({ ...editForm, password: e.target.value })
              }
              style={{
                ...styles.input,
                borderColor: fieldErrors.password ? "#dc2626" : "#cbd5e1",
              }}
            />
            {fieldErrors.password && (
              <p style={styles.error}>{fieldErrors.password}</p>
            )}

            <input
              type="number"
              placeholder="Specialty ID"
              value={editForm.specialty_id}
              onChange={(e) =>
                setEditForm({ ...editForm, specialty_id: e.target.value })
              }
              style={{
                ...styles.input,
                borderColor: fieldErrors.specialty_id ? "#dc2626" : "#cbd5e1",
              }}
            />
            {fieldErrors.specialty_id && (
              <p style={styles.error}>{fieldErrors.specialty_id}</p>
            )}

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedDoctor(null);
                  setEditForm({
                    name: "",
                    email: "",
                    password: "",
                    specialty_id: "",
                  });
                  clearErrors();
                }}
                style={styles.cancel}
              >
                Cancel
              </button>

              <button onClick={handleUpdateDoctor} style={styles.save}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  addBtn: {
    marginTop: 20,
    marginBottom: 25,
    padding: "10px 18px",
    background: "#0ea5a4",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },

  th: {
    textAlign: "left",
    padding: "16px 20px",
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
    fontWeight: 700,
    fontSize: 14,
    color: "#334155",
  },

  td: {
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
    color: "#0f172a",
    verticalAlign: "middle",
  },

  editBtn: {
    marginRight: 8,
    padding: "6px 12px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },

  deleteBtn: {
    padding: "6px 12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },

  modal: {
    background: "#ffffff",
    padding: 30,
    borderRadius: 14,
    width: 440,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 12px 35px rgba(0,0,0,0.15)",
  },

  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    outline: "none",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },

  cancel: {
    padding: "8px 14px",
    background: "#e2e8f0",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  save: {
    padding: "8px 14px",
    background: "#0ea5a4",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  error: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: -6,
    marginBottom: 2,
  },
};
