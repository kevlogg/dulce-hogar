export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'
import { obtenerOCrearCustomer, asociarTarjeta, cobrarTarjeta } from '@/lib/mercadopago'

function proximoDia16(): string {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() // 0-indexed
  if (now.getDate() >= 16) {
    month += 1
    if (month > 11) { month = 0; year += 1 }
  }
  return `${year}-${String(month + 1).padStart(2, '0')}-16`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      token,
      payment_method_id,
      issuer_id,
      email,
      installments,
      identification_type,
      identification_number,
    } = body

    if (!token || !email) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const billingRef = db.collection('billing').doc('main')
    const billingDoc = await billingRef.get()
    const billing = billingDoc.exists ? billingDoc.data()! : {}

    const amount: number = billing.monthly_amount ?? 33000

    const customerId = (billing.mp_customer_id as string | undefined) ?? await obtenerOCrearCustomer(email)

    const { card_id, last_four, brand } = await asociarTarjeta(customerId, token)

    const { payment_id, status } = await cobrarTarjeta({
      customerId,
      cardId: card_id,
      amount,
      email,
      paymentMethodId: payment_method_id ?? brand,
      installments: Number(installments) || 1,
      description: 'Plan mensual - Dulce Hogar',
    })

    const confirmed = status === 'approved'
    const nextDate = proximoDia16()

    await billingRef.set(
      {
        mp_customer_id: customerId,
        mp_customer_email: email,
        mp_card_id: card_id,
        mp_card_last_four: last_four,
        mp_card_brand: brand,
        mp_payment_method_id: payment_method_id ?? brand,
        ...(confirmed ? { monthly_next_date: nextDate } : {}),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    await billingRef.collection('payments').add({
      date: new Date().toISOString().slice(0, 10),
      amount,
      concept: 'Plan mensual',
      confirmed,
      payment_id,
      created_at: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({
      ok: true,
      card_last_four: last_four,
      card_brand: brand,
      pending: !confirmed,
    })
  } catch (e) {
    console.error('guardar-tarjeta error:', e)
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message || 'Error al procesar el pago' }, { status: 500 })
  }
}
