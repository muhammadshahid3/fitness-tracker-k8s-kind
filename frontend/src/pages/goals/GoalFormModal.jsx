import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const goalTypes = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintain_weight', label: 'Maintain Weight' },
];

const emptyForm = { type: 'weight_loss', title: '', startValue: '', targetValue: '', targetDate: '' };

export default function GoalFormModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const errs = {};
    if (form.startValue === '') errs.startValue = 'Required';
    if (form.targetValue === '') errs.targetValue = 'Required';
    if (!form.targetDate) errs.targetDate = 'Required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    onSubmit({ ...form, startValue: Number(form.startValue), targetValue: Number(form.targetValue) });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Goal">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select label="Goal Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={goalTypes} />
        <Input label="Title (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Summer shred" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Value (kg)" type="number" step="0.1" required value={form.startValue} onChange={(e) => setForm({ ...form, startValue: e.target.value })} error={errors.startValue} />
          <Input label="Target Value (kg)" type="number" step="0.1" required value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} error={errors.targetValue} />
        </div>
        <Input label="Target Date" type="date" required value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} error={errors.targetDate} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create goal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
