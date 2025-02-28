import axios from 'axios';

const API_URL = 'http://172.30.66.99:3001'; // JSON Server endpoint

export const signUp = async (
  username: string,
  password: string,
  email: string,
  firstName: string,
  lastName: string,
) => {
  try {
    const accountId = Math.random().toString(36).substring(2, 10); // Generate a unique accountId

    const response = await axios.post(`${API_URL}/users`, {
      username,
      password, // In production, hash this before sending
      email,
      firstName,
      lastName,
      accountId, // Add accountId here
    });

    return response.data;
  } catch (error) {
    throw new Error('Sign-up failed');
  }
};
