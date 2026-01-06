import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

/**
 * Generate and download payment receipt as PDF
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get payment with order details
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Check if user owns this payment
    if (payment.order.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size in points
    const { width, height } = page.getSize()

    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Modern color palette
    const primaryRed = rgb(0.8627, 0.149, 0.149) // #dc2626
    const darkRed = rgb(0.6, 0.1, 0.1) // Darker red
    const lightRed = rgb(0.95, 0.9, 0.9) // Very light red background
    const darkGray = rgb(0.2, 0.2, 0.2) // #333
    const mediumGray = rgb(0.4, 0.4, 0.4) // #666
    const lightGray = rgb(0.9, 0.9, 0.9) // Light gray for borders
    const white = rgb(1, 1, 1)
    const successGreen = rgb(0.2, 0.7, 0.3) // Green for success status

    let yPosition = height - 40

    // Modern Header with colored background box
    const headerHeight = 80
    const headerY = yPosition + 20
    
    // Header background box
    page.drawRectangle({
      x: 0,
      y: headerY - headerHeight,
      width: width,
      height: headerHeight,
      color: primaryRed,
    })

    // Header text - white on red background
    const headerText = 'Mombasa Shisha Bongs'
    const headerWidth = helveticaBoldFont.widthOfTextAtSize(headerText, 28)
    page.drawText(headerText, {
      x: (width - headerWidth) / 2,
      y: headerY - 35,
      size: 28,
      font: helveticaBoldFont,
      color: white,
    })

    // Subtitle
    const subtitleText = 'Payment Receipt'
    const subtitleWidth = helveticaFont.widthOfTextAtSize(subtitleText, 14)
    page.drawText(subtitleText, {
      x: (width - subtitleWidth) / 2,
      y: headerY - 55,
      size: 14,
      font: helveticaFont,
      color: white,
    })

    yPosition = headerY - headerHeight - 30

    // Receipt Information Box
    const infoBoxY = yPosition
    // Calculate height based on number of items: 5 base items + 1 if sender name exists
    // Title area (25px) + divider spacing (10px) + items starting position (20px) + items (18px each) + bottom padding (20px)
    const baseItems = 5 // Receipt Number, Order Number, Payment Date, Payment Method, Status
    const itemCount = payment.mpesaSenderName ? baseItems + 1 : baseItems
    const infoBoxHeight = 25 + 10 + 20 + (itemCount * 18) + 20

    // Background box for receipt info
    page.drawRectangle({
      x: 50,
      y: infoBoxY - infoBoxHeight,
      width: width - 100,
      height: infoBoxHeight,
      borderColor: lightGray,
      borderWidth: 1.5,
      color: lightRed,
    })

    // Section title
    page.drawText('Payment Details', {
      x: 65,
      y: infoBoxY - 25,
      size: 14,
      font: helveticaBoldFont,
      color: primaryRed,
    })

    // Divider line
    page.drawLine({
      start: { x: 65, y: infoBoxY - 35 },
      end: { x: width - 65, y: infoBoxY - 35 },
      thickness: 1,
      color: primaryRed,
    })

    let infoY = infoBoxY - 55

    // Receipt Information with better formatting
    const receiptInfo = [
      { label: 'Receipt Number', value: payment.mpesaReceiptNumber || 'N/A' },
      { label: 'Order Number', value: payment.order.orderNumber },
      { label: 'Payment Date', value: payment.paidAt ? new Date(payment.paidAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : new Date(payment.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) },
      { label: 'Payment Method', value: payment.method },
      { label: 'Status', value: payment.status },
    ]

    if (payment.mpesaSenderName) {
      receiptInfo.push({ label: 'Sender Name', value: payment.mpesaSenderName })
    }

    receiptInfo.forEach((info) => {
      // Label
      page.drawText(`${info.label}:`, {
        x: 65,
        y: infoY,
        size: 10,
        font: helveticaBoldFont,
        color: darkGray,
      })
      
      // Value
      const labelWidth = helveticaBoldFont.widthOfTextAtSize(`${info.label}:`, 10)
      const valueColor = info.label === 'Status' && info.value === 'PAID' ? successGreen : darkGray
      page.drawText(info.value, {
        x: 65 + labelWidth + 10,
        y: infoY,
        size: 10,
        font: helveticaFont,
        color: valueColor,
      })
      
      infoY -= 18
    })

    yPosition = infoBoxY - infoBoxHeight - 30

    // Order Items Section
    page.drawText('Order Items', {
      x: 50,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: primaryRed,
    })

    yPosition -= 25

    // Modern Table with borders
    const tableTop = yPosition
    const tableLeft = 50
    const tableWidth = width - 100
    const rowHeight = 25
    const headerRowHeight = 30

    // Table header background
    page.drawRectangle({
      x: tableLeft,
      y: tableTop - headerRowHeight,
      width: tableWidth,
      height: headerRowHeight,
      color: darkRed,
    })

    // Table header text (white on dark red)
    const tableHeaderY = tableTop - 20
    page.drawText('Item', {
      x: tableLeft + 10,
      y: tableHeaderY,
      size: 11,
      font: helveticaBoldFont,
      color: white,
    })
    page.drawText('Qty', {
      x: tableLeft + 280,
      y: tableHeaderY,
      size: 11,
      font: helveticaBoldFont,
      color: white,
    })
    page.drawText('Price', {
      x: tableLeft + 330,
      y: tableHeaderY,
      size: 11,
      font: helveticaBoldFont,
      color: white,
    })
    const subtotalHeader = 'Subtotal'
    const subtotalHeaderWidth = helveticaBoldFont.widthOfTextAtSize(subtotalHeader, 11)
    page.drawText(subtotalHeader, {
      x: tableLeft + tableWidth - subtotalHeaderWidth - 10,
      y: tableHeaderY,
      size: 11,
      font: helveticaBoldFont,
      color: white,
    })

    // Table rows
    yPosition = tableTop - headerRowHeight - 5
    let currentPage = page
    let rowIndex = 0
    
    payment.order.items.forEach((item) => {
      if (yPosition < 150) {
        // Add new page if needed
        currentPage = pdfDoc.addPage([595, 842])
        yPosition = height - 50
        
        // Redraw table header on new page
        currentPage.drawRectangle({
          x: tableLeft,
          y: yPosition - headerRowHeight,
          width: tableWidth,
          height: headerRowHeight,
          color: darkRed,
        })
        
        const newHeaderY = yPosition - 20
        currentPage.drawText('Item', {
          x: tableLeft + 10,
          y: newHeaderY,
          size: 11,
          font: helveticaBoldFont,
          color: white,
        })
        currentPage.drawText('Qty', {
          x: tableLeft + 280,
          y: newHeaderY,
          size: 11,
          font: helveticaBoldFont,
          color: white,
        })
        currentPage.drawText('Price', {
          x: tableLeft + 330,
          y: newHeaderY,
          size: 11,
          font: helveticaBoldFont,
          color: white,
        })
        currentPage.drawText(subtotalHeader, {
          x: tableLeft + tableWidth - subtotalHeaderWidth - 10,
          y: newHeaderY,
          size: 11,
          font: helveticaBoldFont,
          color: white,
        })
        
        yPosition = yPosition - headerRowHeight - 5
        rowIndex = 0
      }

      // Alternate row background color
      if (rowIndex % 2 === 0) {
        currentPage.drawRectangle({
          x: tableLeft,
          y: yPosition - rowHeight,
          width: tableWidth,
          height: rowHeight,
          color: lightRed,
        })
      }

      // Row border
      currentPage.drawRectangle({
        x: tableLeft,
        y: yPosition - rowHeight,
        width: tableWidth,
        height: rowHeight,
        borderColor: lightGray,
        borderWidth: 0.5,
      })

      const productName = item.productName.length > 35 
        ? item.productName.substring(0, 32) + '...' 
        : item.productName

      // Product name
      currentPage.drawText(productName, {
        x: tableLeft + 10,
        y: yPosition - 18,
        size: 10,
        font: helveticaFont,
        color: darkGray,
        maxWidth: 260,
      })
      
      // Quantity
      currentPage.drawText(String(item.quantity), {
        x: tableLeft + 280,
        y: yPosition - 18,
        size: 10,
        font: helveticaFont,
        color: darkGray,
      })
      
      // Price
      currentPage.drawText(`KES ${Number(item.price).toLocaleString()}`, {
        x: tableLeft + 330,
        y: yPosition - 18,
        size: 10,
        font: helveticaFont,
        color: darkGray,
      })
      
      // Subtotal
      const subtotal = `KES ${(Number(item.price) * item.quantity).toLocaleString()}`
      const subtotalWidth = helveticaFont.widthOfTextAtSize(subtotal, 10)
      currentPage.drawText(subtotal, {
        x: tableLeft + tableWidth - subtotalWidth - 10,
        y: yPosition - 18,
        size: 10,
        font: helveticaFont,
        color: darkGray,
      })

      yPosition -= rowHeight
      rowIndex++
    })

    yPosition -= 15

    // Total Section with highlighted box
    const totalBoxHeight = 50
    const totalBoxY = yPosition
    
    // Total box background
    currentPage.drawRectangle({
      x: tableLeft,
      y: totalBoxY - totalBoxHeight,
      width: tableWidth,
      height: totalBoxHeight,
      borderColor: primaryRed,
      borderWidth: 2,
      color: lightRed,
    })

    // Total label
    const totalText = 'Total Amount'
    currentPage.drawText(totalText, {
      x: tableLeft + 15,
      y: totalBoxY - 25,
      size: 14,
      font: helveticaBoldFont,
      color: primaryRed,
    })
    
    // Total amount
    const totalAmount = `KES ${Number(payment.amount).toLocaleString()}`
    const totalAmountWidth = helveticaBoldFont.widthOfTextAtSize(totalAmount, 18)
    currentPage.drawText(totalAmount, {
      x: tableLeft + tableWidth - totalAmountWidth - 15,
      y: totalBoxY - 22,
      size: 18,
      font: helveticaBoldFont,
      color: primaryRed,
    })

    yPosition = totalBoxY - totalBoxHeight - 30

    // Footer section
    const footerY = yPosition
    
    // Thank you message
    const footerText = 'Thank you for your payment!'
    const footerWidth = helveticaFont.widthOfTextAtSize(footerText, 12)
    currentPage.drawText(footerText, {
      x: (width - footerWidth) / 2,
      y: footerY,
      size: 12,
      font: helveticaBoldFont,
      color: primaryRed,
    })

    // Divider line
    currentPage.drawLine({
      start: { x: 100, y: footerY - 20 },
      end: { x: width - 100, y: footerY - 20 },
      thickness: 0.5,
      color: lightGray,
    })

    // Copyright
    const copyrightText = `Mombasa Shisha Bongs © ${new Date().getFullYear()}`
    const copyrightWidth = helveticaFont.widthOfTextAtSize(copyrightText, 9)
    currentPage.drawText(copyrightText, {
      x: (width - copyrightWidth) / 2,
      y: footerY - 35,
      size: 9,
      font: helveticaFont,
      color: mediumGray,
    })

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

    // Convert Uint8Array to Buffer for NextResponse
    const pdfBuffer = Buffer.from(pdfBytes)

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${payment.order.orderNumber}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating receipt:', error)
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    
    // If pdf-lib is not installed, return helpful error
    if (error.message?.includes('Cannot find module') || error.message?.includes('pdf-lib') || error.code === 'MODULE_NOT_FOUND') {
      return NextResponse.json(
        { 
          error: 'PDF generation library not installed. Please run: npm install pdf-lib and restart the server.',
          details: error.message 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate receipt', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
