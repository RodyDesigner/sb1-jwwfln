import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function post({ request }) {
  const { name, email, password } = await request.json();

  const client = new MongoClient(import.meta.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('auth_system');
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'El correo electrónico ya está registrado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await users.insertOne({
      name,
      email,
      password: hashedPassword,
    });

    return new Response(JSON.stringify({ message: 'Usuario registrado exitosamente' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    return new Response(JSON.stringify({ error: 'Error en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.close();
  }
}