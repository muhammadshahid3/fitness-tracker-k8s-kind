import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const categories = ['Chest', 'Back', 'Legs', 'Cardio', 'Shoulder', 'Arms', 'Core'];

const emptyForm = {
  name: '',
  category: 'Cardio',
  duration: '',
  caloriesBurned: '',
  notes: '',
  date: new Date().toISOString().split('T')[0],
};

export default function WorkoutFormModal({ open, onClose, onSubmit, initialData, loading }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData, date: new Date(initialData.date).toISOString().split('T')[0] });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.duration || form.duration <= 0) errs.duration = 'Must be greater than 0';
    if (form.caloriesBurned === '' || form.caloriesBurned < 0) errs.caloriesBurned = 'Must be 0 or greater';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    onSubmit({ ...form, duration: Number(form.duration), caloriesBurned: Number(form.caloriesBurned) });
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Workout' : 'Add Workout'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Workout Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. Bench Press"
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duration (min)"
            type="number"
            min="1"
            required
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            error={errors.duration}
          />
          <Input
            label="Calories Burned"
            type="number"
            min="0"
            required
            value={form.caloriesBurned}
            onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })}
            error={errors.caloriesBurned}
          />
        </div>
        <Input
          label="Notes"
          textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Optional notes about this workout"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Save changes' : 'Add workout'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
