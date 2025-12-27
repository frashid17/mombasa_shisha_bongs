'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, User, FileText, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RequestQuotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to send quote request' }))
        throw new Error(data.error || 'Failed to send quote request')
      }

      const data = await response.json()

      toast.success('Quote request sent successfully! We will contact you soon.')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        description: '',
      })

      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error: any) {
      console.error('Error submitting quote request:', error)
      toast.error(error.message || 'Failed to send quote request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Request a Wholesale Quote
          </h1>
          <p className="text-gray-600 text-lg">
            Fill out the form below and we'll get back to you with a custom quote for your wholesale order.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                placeholder="+254712345678"
              />
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                What would you like to purchase? *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white resize-none"
                placeholder="Please describe the products you're interested in, quantities, and any specific requirements..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Quote Request</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Note:</strong> We typically respond to quote requests within 24-48 hours. 
              For urgent inquiries, please call us at <a href="tel:+2547117037140" className="underline font-semibold">+2547117037140</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

