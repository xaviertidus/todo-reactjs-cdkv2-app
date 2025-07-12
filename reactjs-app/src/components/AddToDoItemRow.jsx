import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { APP_CONFIG } from '../App';
import { TextField, IconButton } from '@mui/material';  
import AddIcon from '@mui/icons-material/Add';

const AddToDoItemRow = ({ onAdd, getToken }) => {
  const [text, setText] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text) return;
    const token = await getToken();
    try {
      const res = await fetch(`${APP_CONFIG.apiUrl}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        toast.success('Added');
        setText('');
        onAdd();
      } else {
        toast.error('Add failed');
      }
    } catch (err) {
      toast.error('Error adding');
    }
  };

  return (
    <form onSubmit={handleAdd} style={{ display: 'flex', alignItems: 'center' }}>
      <TextField
        fullWidth
        label="Add new todo"
        value={text}
        onChange={(e) => setText(e.target.value)}
        size="small"
      />
      <IconButton type="submit" color="primary">
        <AddIcon />
      </IconButton>
    </form>
  );
};

export default AddToDoItemRow;