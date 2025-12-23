import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { put } from '@vercel/blob'
import { v2 as cloudinary } from 'cloudinary'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Determine upload directory based on type (default to products)
    const uploadType = (formData.get('type') as string) || 'products'
    
    let publicUrl: string

    // Prefer Cloudinary if configured to avoid storing large image data in the database
    const hasCloudinaryEnv =
      !!process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)

    if (hasCloudinaryEnv) {
      // Configure Cloudinary (will automatically use CLOUDINARY_URL if present)
      if (process.env.CLOUDINARY_URL) {
        cloudinary.config({
          secure: true,
        })
      } else {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
          api_key: process.env.CLOUDINARY_API_KEY!,
          api_secret: process.env.CLOUDINARY_API_SECRET!,
          secure: true,
        })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      try {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `uploads/${uploadType}`,
              resource_type: 'image',
            },
            (error, result) => {
              if (error || !result) {
                return reject(error || new Error('Cloudinary upload failed'))
              }
              resolve(result)
            }
          )

          uploadStream.end(buffer)
        })

        publicUrl = uploadResult.secure_url || uploadResult.url
      } catch (cloudinaryError: any) {
        console.error('Cloudinary upload error:', cloudinaryError)
        return NextResponse.json(
          { error: 'Failed to upload image to Cloudinary' },
          { status: 500 }
        )
      }
    } else {
      // Fallback: original behaviour (Vercel Blob in production, filesystem in development)

      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}-${randomStr}.${extension}`

      // Check if we're in production (Vercel) or development
      const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
      const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN

      if (isProduction && hasBlobToken) {
        // In production (Vercel), use Vercel Blob Storage
        try {
          const blob = await put(`uploads/${uploadType}/${filename}`, file, {
            access: 'public',
            contentType: file.type,
          })
          publicUrl = blob.url
        } catch (blobError: any) {
          console.error('Vercel Blob upload error:', blobError)
          // Fallback: if Blob Storage fails, use Base64 (temporary solution)
          console.warn('Falling back to Base64 encoding (not recommended for production)')
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64 = buffer.toString('base64')
          publicUrl = `data:${file.type};base64,${base64}`
        }
      } else if (isProduction && !hasBlobToken) {
        // Production but no Blob token - use Base64 as fallback
        console.warn(
          'BLOB_READ_WRITE_TOKEN not set. Using Base64 encoding (temporary). Please set up Vercel Blob Storage or Cloudinary.'
        )
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        publicUrl = `data:${file.type};base64,${base64}`
      } else {
        // In development, save to local filesystem
        const uploadsDir = join(process.cwd(), 'public', 'uploads', uploadType)
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        const filepath = join(uploadsDir, filename)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Return public URL
        publicUrl = `/uploads/${uploadType}/${filename}`
      }
    }

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}

