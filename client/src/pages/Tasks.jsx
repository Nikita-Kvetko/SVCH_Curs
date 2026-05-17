import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Checkbox } from '@mui/material';
import axios from '../api/axiosConfig';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get('/tasks')
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Задачи</Typography>
      <Paper>
        <List>
          {tasks.map(task => (
            <ListItem key={task.id}>
              <Checkbox checked={task.is_completed} />
              <ListItemText primary={task.title} secondary={task.description} />
            </ListItem>
          ))}
          {tasks.length === 0 && (
            <ListItem>
              <ListItemText primary="Нет задач" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Container>
  );
}