import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

export async function post({ request }) {
  const { email } = await request.json();

  const client = new MongoClient(import.meta.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('auth_system');
    const users = db.collection('users');

    const user = await users.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = jwt.sign({ userId: user._id }, import.meta.env.JWT_SECRET, { expiresIn: '1h' });

    const resetLink = `${import.meta.env.SITE_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: import.meta.env.SMTP_PORT,
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: import.meta.env.SMTP_FROM,
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este enlace expirará en 1 hora.</p>
      `,
    });

    return new Response(JSON.stringify({ message: 'Correo de recuperación enviado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en la recuperación de contraseña:', error);
    return new Response(JSON.stringify({ error: 'Error en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.close();
  }
}