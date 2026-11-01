//1. Load the Express module
import express from "express";

const app = express();

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the server!' });
});

app.get('/api/health', (req, res) => {
    res.json({ok: true}); 
});

const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

