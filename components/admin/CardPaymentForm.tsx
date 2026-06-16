'use client'

import { useEffect, useRef, useState } from 'react'

interface CardPaymentFormProps {
  amount: number
  onSuccess: (data: { cardLastFour: string; cardBrand: string; pending?: boolean }) => void
  onError: (msg: string) => void
  onCancel: () => void
}

declare global {
  interface Window { MercadoPago: any }
}

export default function CardPaymentForm({ amount, onSuccess, onError, onCancel }: CardPaymentFormProps) {
  const mpRef = useRef<any>(null)
  const cardFormRef = useRef<any>(null)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const [cargando, setCargando] = useState(false)
  const [sdkListo, setSdkListo] = useState(false)

  useEffect(() => { onSuccessRef.current = onSuccess }, [onSuccess])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    const existing = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')
    if (existing) {
      if (window.MercadoPago) {
        mpRef.current = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!)
        setSdkListo(true)
      }
      return
    }
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.async = true
    script.onload = () => {
      mpRef.current = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!)
      setSdkListo(true)
    }
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (!sdkListo) return

    const cardForm = mpRef.current.cardForm({
      amount: String(amount),
      iframe: true,
      form: {
        id: 'mp-billing-form',
        cardNumber: { id: 'mp-cardNumber', placeholder: 'Numero de tarjeta' },
        expirationDate: { id: 'mp-expirationDate', placeholder: 'MM/AA' },
        securityCode: { id: 'mp-securityCode', placeholder: 'CVV' },
        cardholderName: { id: 'mp-cardholderName', placeholder: 'Titular' },
        issuer: { id: 'mp-issuer' },
        installments: { id: 'mp-installments' },
        identificationType: { id: 'mp-identificationType' },
        identificationNumber: { id: 'mp-identificationNumber', placeholder: 'Numero de documento' },
        cardholderEmail: { id: 'mp-cardholderEmail', placeholder: 'Email' },
      },
      style: {
        input: { color: '#292524', 'background-color': '#fafaf9', 'font-size': '14px' },
        'input::placeholder': { color: '#a8a29e' },
      },
      callbacks: {
        onFormMounted: (error: any) => { if (error) console.warn('CardForm mount:', error) },
        onSubmit: async (event: any) => {
          event.preventDefault()
          setCargando(true)
          try {
            const {
              paymentMethodId,
              issuerId,
              cardholderEmail,
              token,
              installments,
              identificationNumber,
              identificationType,
            } = cardForm.getCardFormData()

            const res = await fetch('/api/admin/billing/guardar-tarjeta', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token,
                payment_method_id: paymentMethodId,
                issuer_id: issuerId,
                email: cardholderEmail,
                installments: Number(installments),
                identification_type: identificationType,
                identification_number: identificationNumber,
              }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al procesar el pago')

            onSuccessRef.current({
              cardLastFour: data.card_last_four,
              cardBrand: data.card_brand,
              pending: data.pending,
            })
          } catch (err: any) {
            onErrorRef.current(err.message || 'Error al procesar el pago')
          } finally {
            setCargando(false)
          }
        },
        onFetching: (_: string) => () => {},
      },
    })

    cardFormRef.current = cardForm
    return () => { try { cardForm.unmount() } catch (_) {} }
  }, [sdkListo, amount])

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#fafaf9',
    border: '1px solid #d6d3d1',
    borderRadius: '8px',
    padding: '0.55rem 0.85rem',
    height: '42px',
    color: '#292524',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  }

  return (
    <div>
      <form id="mp-billing-form">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Numero de tarjeta</label>
            <div id="mp-cardNumber" style={fieldStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Vencimiento</label>
              <div id="mp-expirationDate" style={fieldStyle} />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">CVV</label>
              <div id="mp-securityCode" style={fieldStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Titular de la tarjeta</label>
            <input type="text" id="mp-cardholderName" placeholder="Como figura en la tarjeta" style={fieldStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Tipo doc.</label>
              <select id="mp-identificationType" style={fieldStyle} />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Numero doc.</label>
              <input type="text" id="mp-identificationNumber" placeholder="12345678" style={fieldStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Email</label>
            <input type="email" id="mp-cardholderEmail" placeholder="correo@ejemplo.com" style={fieldStyle} />
          </div>
          <div style={{ display: 'none' }}>
            <select id="mp-issuer" />
            <select id="mp-installments" />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={cargando}
            className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando || !sdkListo}
            className="flex-1 px-4 py-2 rounded-lg bg-wood-800 text-sm font-semibold text-white hover:bg-wood-900 disabled:opacity-50"
          >
            {cargando ? 'Procesando...' : !sdkListo ? 'Cargando...' : 'Pagar'}
          </button>
        </div>
      </form>
    </div>
  )
}
