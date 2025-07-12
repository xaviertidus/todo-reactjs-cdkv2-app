import React from 'react';
import { toast } from 'react-toastify';
import { APP_CONFIG } from '../App';
import { ListItem, ListItemText, Checkbox, IconButton, Tooltip } from '@mui/material'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ToDoItemRow = ({ todo, onEdit, onDelete, onComplete, getToken }) => {
  const handleDelete = async () => {
    const token = await getToken();
    try {
      const res = await fetch(`${APP_CONFIG.apiUrl}/todos/${todo.timestamp}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Deleted');
        onDelete();
      } else {
        toast.error('Delete failed');
      }
    } catch (err) {
      toast.error('Error deleting');
    }
  };

  const handleComplete = async () => {
    const token = await getToken();
    try {
      const res = await fetch(`${APP_CONFIG.apiUrl}/todos/${todo.timestamp}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        toast.success('Marked complete');
        onComplete();
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      toast.error('Error updating');
    }
  };

  return (
    <ListItem onDoubleClick={onEdit} divider>  
      <Checkbox checked={todo.completed} onChange={handleComplete} />
      <ListItemText primary={todo.text} sx={{ textDecoration: todo.completed ? 'line-through' : 'none' }} />
      <Tooltip title="Edit">
        <IconButton onClick={onEdit} color="primary">
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Mark Complete">
        <IconButton onClick={handleComplete} color="success">
          <CheckCircleIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton onClick={handleDelete} color="error">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </ListItem>
  );
};

export default ToDoItemRow;