'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'What is Shisha and How Does it Work?',
    answer: 'Shisha, also known as hookah, is a water pipe used to smoke flavored tobacco. The tobacco is heated with charcoal, and the smoke passes through water before being inhaled through a hose. We offer premium shisha products including pipes, tobacco, and accessories.',
  },
  {
    question: 'What are the Different Types of Vape Kits?',
    answer: 'We offer various types of vape kits including starter kits for beginners, pod kits for convenience, sub-ohm kits for cloud production, and advanced vape kits for experienced users. Each type serves different preferences and experience levels.',
  },
  {
    question: 'What are E-Liquids and What are They Made Of?',
    answer: 'E-liquids are the flavored liquids used in vape devices. They typically contain propylene glycol (PG), vegetable glycerin (VG), flavorings, and optionally nicotine. We offer a wide range of flavors and nicotine strengths to suit your preferences.',
  },
  {
    question: 'What is Nicotine Strength and How Do I Choose the Right One?',
    answer: 'Nicotine strength is measured in milligrams per milliliter (mg/ml). Common strengths range from 0mg (nicotine-free) to 20mg. Beginners usually start with lower strengths (3-6mg), while heavy smokers may prefer higher strengths (12-20mg).',
  },
  {
    question: 'How Do I Maintain My Vape Kit?',
    answer: 'Regular maintenance includes cleaning the tank, replacing coils regularly, charging batteries properly, and storing devices safely. Always follow manufacturer instructions and keep your device clean to ensure optimal performance and longevity.',
  },
  {
    question: 'What are Vape Coils and How Often Should I Change Them?',
    answer: 'Vape coils are heating elements that vaporize e-liquid. They should be replaced every 1-2 weeks or when you notice a burnt taste, reduced vapor production, or decreased flavor quality. Regular replacement ensures the best vaping experience.',
  },
  {
    question: 'What are Disposable Vapes and How Do They Work?',
    answer: 'Disposable vapes are pre-filled, single-use devices that come ready to use. They require no maintenance, charging, or refilling. Simply use until the battery or e-liquid runs out, then dispose of responsibly. Perfect for beginners or on-the-go vaping.',
  },
  {
    question: 'Do You Offer Delivery Services?',
    answer: 'Yes! We offer fast delivery throughout Mombasa and nationwide shipping across Kenya. Same-day delivery is available in Mombasa for orders placed before 2 PM. Delivery fees vary by location.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 bg-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-4">
              FAQs
            </h2>
            <p className="text-xl text-gray-600 font-medium">Got questions? Get answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-red-500 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-900 font-bold text-lg pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-red-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

