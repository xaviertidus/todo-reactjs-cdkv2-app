import React, { useEffect, useState } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';  
import { toast } from 'react-toastify';
import { APP_CONFIG } from '../App';
import AddToDoItemRow from './AddToDoItemRow';
import ToDoItemRow from './ToDoItemRow';
import EditToDoItemRow from './EditToDoItemRow';
import { CircularProgress, Typography, TextField } from '@mui/material';  

const HomeUI = ({ user }) => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);  

  const fetchTodos = async () => {
    setIsLoading(true);  
    const token = await getIdToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${APP_CONFIG.apiUrl}/todos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
        if (data.length === 0) {
          addDefaultTodo(token);
        }
      } else {
        toast.error('Failed to fetch todos');
      }
    } catch (err) {
      toast.error('Error fetching todos');
    } finally {
      setIsLoading(false);  // Stop loading
    }
  };

  const addDefaultTodo = async (token) => {
    try {
      const res = await fetch(`${APP_CONFIG.apiUrl}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: 'Add todo items to my todo list.' }),
      });
      if (res.ok) {
        toast.success('Default todo added');
        fetchTodos();
      } else {
        toast.error('Failed to add default todo');
      }
    } catch (err) {
      toast.error('Error adding default todo');
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const filteredTodos = todos.filter(todo => todo.text.toLowerCase().includes(filter.toLowerCase()));

  const handleEdit = (id) => setEditingId(id);
  const handleCancelEdit = () => setEditingId(null);

  const getIdToken = () => {
    const poolData = {
      UserPoolId: APP_CONFIG.cognito.userpoolId,
      ClientId: APP_CONFIG.cognito.userpoolClientId,
    };
    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();
    return new Promise((resolve) => {
      if (cognitoUser) {
        cognitoUser.getSession((err, session) => {
          resolve(err ? null : session.getIdToken().getJwtToken());
        });
      } else {
        resolve(null);
      }
    });
  };

  return (
    <div style={{ padding: '16px' }}>  
      <Typography variant="h5" gutterBottom>Hello, {user.given_name}</Typography>
      <TextField
        fullWidth
        label="Filter todos..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        margin="normal"
      />
      <AddToDoItemRow onAdd={fetchTodos} getToken={getIdToken} />
      {isLoading ? (
        <CircularProgress style={{ display: 'block', margin: '16px auto' }} />  
      ) : (
        <div>  
          {filteredTodos.map(todo => (
            editingId === todo.timestamp ? (
              <EditToDoItemRow
                key={todo.timestamp}
                todo={todo}
                onSave={fetchTodos}
                onCancel={handleCancelEdit}
                getToken={getIdToken}
              />
            ) : (
              <ToDoItemRow
                key={todo.timestamp}
                todo={todo}
                onEdit={() => handleEdit(todo.timestamp)}
                onDelete={fetchTodos}
                onComplete={fetchTodos}
                getToken={getIdToken}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeUI;