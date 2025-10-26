import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import userRoutes from './routes/users.js';
import quoteRoutes from './routes/quotes.js';
import notificationRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payments.js';

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('job-update', (job) => {
    socket.broadcast.emit('job-updated', job);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homepal');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };

