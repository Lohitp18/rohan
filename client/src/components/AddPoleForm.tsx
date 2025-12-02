import { useState, type FormEvent } from "react";

export type AddPolePayload = {
  id: string;
  lat: number;
  lon: number;
};

type AddPoleFormProps = {
  onAdd: (payload: AddPolePayload) => Promise<void> | void;
  disabled?: boolean;
};

const defaultState = {
  id: "",
  lat: "",
  lon: "",
};

function AddPoleForm({ onAdd, disabled }: AddPoleFormProps) {
  const [form, setForm] = useState(defaultState);
  const [error, setError] = useState("");

  const handleChange = (field: keyof typeof form, value: string) => {
    setError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const payload: AddPolePayload = {
      id: form.id.trim(),
      lat: Number(form.lat),
      lon: Number(form.lon),
    };

    if (!payload.id || Number.isNaN(payload.lat) || Number.isNaN(payload.lon)) {
      setError("Pole ID, latitude, and longitude are required.");
      return;
    }

    try {
      await onAdd(payload);
      setForm(defaultState);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unable to add pole right now.";
      setError(errorMessage);
    }
  };

  return (
    <section className="add-pole-section">
      <h4>Add New Pole</h4>
      <form onSubmit={handleSubmit}>
        <label htmlFor="poleId">Pole ID:</label>
        <input
          id="poleId"
          value={form.id}
          onChange={(e) => handleChange("id", e.target.value)}
          required
        />

        <label htmlFor="latitudeAdd">Latitude:</label>
        <input
          id="latitudeAdd"
          type="number"
          step="any"
          value={form.lat}
          onChange={(e) => handleChange("lat", e.target.value)}
          required
        />

        <label htmlFor="longitudeAdd">Longitude:</label>
        <input
          id="longitudeAdd"
          type="number"
          step="any"
          value={form.lon}
          onChange={(e) => handleChange("lon", e.target.value)}
          required
        />

        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={disabled}>
          {disabled ? "Saving..." : "Add Pole and Save"}
        </button>
      </form>
    </section>
  );
}

export default AddPoleForm;

