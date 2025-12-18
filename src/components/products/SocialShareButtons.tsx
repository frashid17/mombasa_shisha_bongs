'use client'

import { Share2, Instagram, Twitter, MessageCircle } from 'lucide-react'

interface SocialShareButtonsProps {
  productName: string
  productUrl: string
  productImage?: string
}

export default function SocialShareButtons({
  productName,
  productUrl,
  productImage,
}: SocialShareButtonsProps) {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${productUrl}` : productUrl
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedText = encodeURIComponent(`Check out ${productName}!`)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing, opens app
    snapchat: `https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
  }

  const handleShare = async (platform: string) => {
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out ${productName}!`,
          url: fullUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
      }
      return
    }

    const link = shareLinks[platform as keyof typeof shareLinks]
    if (link) {
      window.open(link, '_blank', 'width=600,height=400')
    }
  }

  const hasNativeShare = typeof window !== 'undefined' && 'share' in navigator

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="text-sm text-gray-400">Share:</span>
      <div className="flex gap-2">
        {hasNativeShare && (
          <button
            onClick={() => handleShare('native')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
        )}
        <button
          onClick={() => handleShare('twitter')}
          className="p-2 bg-gray-700 hover:bg-blue-500 rounded-lg transition-colors"
          title="Share on Twitter"
        >
          <Twitter className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => handleShare('instagram')}
          className="p-2 bg-gray-700 hover:bg-pink-500 rounded-lg transition-colors"
          title="Share on Instagram"
        >
          <Instagram className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => handleShare('snapchat')}
          className="p-2 bg-gray-700 hover:bg-yellow-400 rounded-lg transition-colors"
          title="Share on Snapchat"
        >
          <MessageCircle className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className="p-2 bg-gray-700 hover:bg-green-500 rounded-lg transition-colors"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}

