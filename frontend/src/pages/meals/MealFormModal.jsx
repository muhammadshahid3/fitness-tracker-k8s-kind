import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const emptyForm = {
  mealType: 'Breakfast',
  name: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  date: new Date().toISOString().split('T')[0],
};

export default function MealFormModal({ open, onClose, onSubmit, initialData, loading }) {
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
    if (form.calories === '' || form.calories < 0) errs.calories = 'Must be 0 or greater';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    onSubmit({
      ...form,
      calories: Number(form.calories),
      protein: Number(form.protein || 0),
      carbs: Number(form.carbs || 0),
      fat: Number(form.fat || 0),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Meal' : 'Add Meal'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Meal Type"
            value={form.mealType}
            onChange={(e) => setForm({ ...form, mealType: e.target.value })}
            options={mealTypes.map((c) => ({ value: c, label: c }))}
          />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <Input
          label="Meal / Food Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. Grilled chicken salad"
        />
        <Input
          label="Calories"
          type="number"
          min="0"
          required
          value={form.calories}
          onChange={(e) => setForm({ ...form, calories: e.target.value })}
          error={errors.calories}
        />
        <div className="grid grid-cols-3 gap-4">
          <Input label="Protein (g)" type="number" min="0" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
          <Input label="Carbs (g)" type="number" min="0" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
          <Input label="Fat (g)" type="number" min="0" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Save changes' : 'Add meal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
