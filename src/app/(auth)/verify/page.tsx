"use client";

import { VerifyForm } from '@/components/auth/VerifyForm'
import { useTemp } from '@/context/temp-context';
import Image from 'next/image'

export default function VerifyPage() {
    const { value } = useTemp();
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Image src="/icons/quest-genie-icon.png" height={50} width={50} alt="Logo" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">One Time Passcode</h2>
          <p className="mt-2 text-gray-600">{`An OTP has been sent to your email: ${value} Please check your inbox!`}</p>
        </div>
        <VerifyForm />
      </div>
    </div>
  )
}