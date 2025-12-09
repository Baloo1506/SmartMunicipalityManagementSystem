/**
 * Database Configuration
 * MongoDB connection with Mongoose
 */
import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smms', {
      // Mongoose 8 options
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`Database connection error: ${error.message}`)
    throw error
  }
}

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    console.log('MongoDB Disconnected')
  } catch (error) {
    console.error(`Database disconnection error: ${error.message}`)
  }
}
