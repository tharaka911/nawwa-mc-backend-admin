'use client'

import React, { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { verifyEmailAction } from './actions'

const VerifyEmailContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email address...')
  const hasCalled = useRef(false)

  useEffect(() => {
    if (hasCalled.current) return
    hasCalled.current = true

    if (!token) {
      setStatus('error')
      setMessage('No verification token found. Please check your email link.')
      return
    }

    const verifyToken = async () => {
      try {
        const result = await verifyEmailAction(token as string);

        if (result.success) {
          setStatus('success')
          setMessage(result.message || 'Your email has been verified successfully!')
        } else {
          console.error('Action Error:', result.message);
          setStatus('error')
          setMessage(result.message || 'Verification failed. The link may have expired.')
        }
      } catch (err) {
        console.error('Fatal Error:', err);
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again later.')
      }
    }

    verifyToken()
  }, [token])

  return (
    <div 
      className="verify-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
        color: 'white',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        padding: '20px',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 450px;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .icon-wrapper {
          margin-bottom: 32px;
          display: flex;
          justify-content: center;
        }

        .loader {
          width: 64px;
          height: 64px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .error-icon {
          width: 80px;
          height: 80px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 16px 0;
          background: linear-gradient(135deg, #fff 0%, #a5a5a5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p {
          font-size: 16px;
          color: #a1a1aa;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .button {
          background: #fff;
          color: #000;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-block;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }

        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(255, 255, 255, 0.2);
        }

        .button.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .button.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      ` }} />

      <div className="card">
        <div className="icon-wrapper">
          {status === 'loading' && <div className="loader" />}
          {status === 'success' && (
            <div className="success-icon">✓</div>
          )}
          {status === 'error' && (
            <div className="error-icon">✕</div>
          )}
        </div>

        <h1>
          {status === 'loading' && 'Verifying...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p>{message}</p>

        {status === 'error' && (
          <button className="button secondary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
