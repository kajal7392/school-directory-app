import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '@/lib/auth';
import fs from 'fs/promises';
import { getPool } from '@/lib/db';
import { query } from '@/lib/db';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UserRole {
  role: string;
}

interface InsertResult {
  insertId: number;
}

export async function POST(request: NextRequest) {
  // Get connection pool
  const pool = getPool();
  let connection;
  
  try {
    // Extract token from Authorization header or cookie (preserving original fallback)
    let token: string | null = null;
    const authHeader = request.headers.get('authorization');
    token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      const cookieHeader = request.headers.get('cookie');
      token = cookieHeader
        ?.split(';')
        .find((cookie) => cookie.trim().startsWith('auth-token='))
        ?.split('=')[1] ?? null;
    }

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify token
    let decoded: { userId: number };
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get a connection from the pool for the transaction
    connection = await pool.getConnection();

    // Authorization check - using users table instead of admins
    const [userRows] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    const user = userRows as UserRole[];

    console.log('User role:', user);

    if (!user || user.length === 0) {
      console.log('User not found in database');
    // Check user role from DB
    const user = await query<UserRole[]>({
      query: 'SELECT role FROM users WHERE id = ?',
      values: [decoded.userId],
    });

    if (!user || user.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (user[0].role !== 'admin') {
      console.log('User is not an admin, role:', user[0].role);
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    console.log('User authorized as admin, proceeding with school addition');
    
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();

    // Extract fields
    const name = formData.get('name') as string | null;
    const address = formData.get('address') as string | null;
    const city = formData.get('city') as string | null;
    const state = formData.get('state') as string | null;
    const contact = formData.get('contact') as string | null;
    const email_id = formData.get('email_id') as string | null;
    const imageFile = formData.get('image') as File | null;

    // Validate required text fields
    const requiredFields: Record<string, string | null> = { name, address, city, state, contact, email_id };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return NextResponse.json(
          { message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` },
          { status: 400 }
        );
      }
    }

    // Validate image file presence
    if (!imageFile) {
      return NextResponse.json({ message: 'School image is required' }, { status: 400 });
    }

    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { message: 'Only JPG, PNG, WEBP, and GIF images are allowed' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_id as string)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    // Validate image size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json({ message: 'Image size must be less than 5MB' }, { status: 400 });
    }

    // Convert File to buffer for Cloudinary upload
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'school-images' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      // Create a readable stream from buffer and pipe to uploadStream
      const { Readable } = require('stream');
      const stream = Readable.from(buffer);
      stream.pipe(uploadStream);
    });

    // Insert into database using the connection
    const [dbResult] = await connection.execute(
      "INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, address, city, state, contact, uploadResult.secure_url, email_id]
    );

    const insertResult = dbResult as InsertResult;

    return NextResponse.json(
      {
        message: 'School added successfully!',
        schoolId: insertResult.insertId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: message,
      },
      { status: 500 }
    );
  } finally {
    // release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};