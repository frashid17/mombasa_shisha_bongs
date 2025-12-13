import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

/**
 * Paystack Callback Handler
 * 
 * This endpoint handles the redirect after payment.
 * Paystack redirects users here after they complete payment.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    const trxref = searchParams.get('trxref') // Alternative reference parameter

    const paymentReference = reference || trxref

    if (!paymentReference) {
      return redirect('/orders?error=missing_reference')
    }

    console.log('📥 Paystack callback received:', { reference: paymentReference })

    // Redirect to order page with reference
    // The order page will verify the payment status
    return redirect(`/orders?reference=${paymentReference}`)
  } catch (error: any) {
    console.error('Paystack callback error:', error)
    return redirect('/orders?error=callback_failed')
  }
}

