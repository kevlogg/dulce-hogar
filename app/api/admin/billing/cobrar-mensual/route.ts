export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'
import { cobrarTarjeta } from '@/lib/mercadopago'

function nextMonth16(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number)
  const nextMonth = month + 1
  if (nextMonth > 12) return `${year + 1}-01-16`
  return `${year}-${String(nextMonth).padStart(2, '0')}-16`
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getAdminFirestore()
    const billingRef = db.collection('billing').doc('main')
    const doc = await billingRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'No hay configuracion de billing' }, { status: 404 })
    }

    const billing = doc.data()!
    const {
      mp_customer_id,
      mp_card_id,
      mp_payment_method_id,
      mp_customer_email,
      monthly_amount,
      monthly_next_date,
    } = billing

    if (!mp_customer_id || !mp_card_id) {
      return NextResponse.json({ error: 'No hay tarjeta guardada' }, { status: 400 })
    }

    const amount: number = monthly_amount ?? 33000
    const email: string = mp_customer_email ?? ''

    const { payment_id, status } = await cobrarTarjeta({
      customerId: mp_customer_id,
      cardId: mp_card_id,
      amount,
      email,
      paymentMethodId: mp_payment_method_id ?? '',
      installments: 1,
      description: 'Plan mensual - Dulce Hogar',
    })

    const confirmed = status === 'approved'
    const today = new Date().toISOString().slice(0, 10)

    await billingRef.collection('payments').add({
      date: today,
      amount,
      concept: 'Plan mensual (cobro automatico)',
      confirmed,
      payment_id,
      created_at: FieldValue.serverTimestamp(),
    })

    if (confirmed && monthly_next_date) {
      await billingRef.update({
        monthly_next_date: nextMonth16(monthly_next_date),
        updated_at: FieldValue.serverTimestamp(),
      })
    }

    return NextResponse.json({ ok: true, status, payment_id })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('cobrar-mensual error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
