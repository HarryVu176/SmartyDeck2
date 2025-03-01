import { defineEventHandler } from 'h3';
import { connectToDatabase } from '../utils/dbConnect';

export default defineEventHandler(async (event) => {
  await connectToDatabase();
  return { message: 'pong' };
});
