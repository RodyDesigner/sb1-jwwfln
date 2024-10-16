import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function post({ request }) {
  const { email, password } = await request.json();

  const client = new MongoClient(import.meta.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('auth_system');
    const users = db.collection('users');

    const user = await users.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = jwt.sign({ userId: user._id }, import.meta.env.JWT_SECRET, { expiresIn: '1h' });

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return new Response(JSON.stringify({ error: 'Error en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.close();
  }
}