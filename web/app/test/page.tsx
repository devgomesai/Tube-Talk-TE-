"use client"
import pb from '@/lib/db/pocket_base.config';
// pages/index.tsx
import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate password confirmation
    if (password !== passwordConfirm) {
      setMessage('Passwords do not match');
      return;
    }

    const data = {
      username,
      email,
      emailVisibility: true,
      password,
      passwordConfirm,
      name: username,
    };

    try {
      console.log(data);
      // Create the record in PocketBase
      const record = await pb.collection('users').create(data);
      console.log(record);

      // Send email verification (optional)
      await pb.collection('users').requestVerification(email);

      setMessage('User created successfully. Please check your email for verification.');
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    }
  };

  return (
    <div className="container">
      <h1>Create User</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create User</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
