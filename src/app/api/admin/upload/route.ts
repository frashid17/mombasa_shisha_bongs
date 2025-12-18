import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { put } from '@vercel/blob'

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
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomStr}.${extension}`

    // Check if we're in production (Vercel) or development
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

    let publicUrl: string

    if (isProduction) {
      // In production (Vercel), use Vercel Blob Storage
      try {
        const blob = await put(`uploads/${uploadType}/${filename}`, file, {
          access: 'public',
          contentType: file.type,
        })
        publicUrl = blob.url
      } catch (blobError: any) {
        console.error('Vercel Blob upload error:', blobError)
        // Fallback: if Blob Storage fails, return error
        return NextResponse.json(
          { error: 'Failed to upload to storage. Please check BLOB_READ_WRITE_TOKEN is set.' },
          { status: 500 }
        )
      }
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

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}

