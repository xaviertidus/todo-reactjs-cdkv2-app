import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { APP_CONFIG } from '../App';
import { ListItem, TextField, Checkbox, IconButton, Tooltip } from '@mui/material';  
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const EditToDoItemRow = ({ todo, onSave, onCancel, getToken }) => {
  const [text, setText] = useState(todo.text);
  const [completed, setCompleted] = useState(todo.completed);

  const handleSave = async () => {
    const token = await getToken();
    try {
      const res = await fetch(`${APP_CONFIG.apiUrl}/todos/${todo.timestamp}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text, completed }),
      });
      if (res.ok) {
        toast.success('Saved');
        onSave();
      } else {
        toast.error('Save failed');
      }
    } catch (err) {
      toast.error('Error saving');
    }
  };

  return (
    <ListItem divider>
      <TextField
        value={text}
        onChange={(e) => setText(e.target.value)}
        size="small"
        sx={{ flex: 1, mr: 1 }}
      />
      <Checkbox checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
      <Tooltip title="Save">
        <IconButton onClick={handleSave} color="primary">
          <SaveIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Cancel">
        <IconButton onClick={onCancel} color="secondary">
          <CancelIcon />
        </IconButton>
      </Tooltip>
    </ListItem>
  );
};

export default EditToDoItemRow;