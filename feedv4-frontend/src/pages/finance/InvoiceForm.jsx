import React, { useState } from 'react';
import { Button, TextField, MenuItem, Typography, Paper } from '@mui/material';

const serviceTypes = ['Formulation', 'Pelleting', 'Raw Material Supply', 'Consulting'];

const InvoiceForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    customerId: '',
    batchId: '',
    serviceType: '',
    amount: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
      <Typography variant="h6" gutterBottom>Create New Invoice</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Customer ID"
          name="customerId"
          value={form.customerId}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Batch ID"
          name="batchId"
          value={form.batchId}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          select
          fullWidth
          label="Service Type"
          name="serviceType"
          value={form.serviceType}
          onChange={handleChange}
          margin="normal"
        >
          {serviceTypes.map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Amount (LKR)"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          margin="normal"
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Create Invoice
        </Button>
      </form>
    </Paper>
  );
};

export default InvoiceForm;
