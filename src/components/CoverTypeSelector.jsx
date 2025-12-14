import React, { useState } from 'react';

/**
 * Cover Type Selector Component
 * Add this to your book preview page above the "Order Summary"
 */
export default function CoverTypeSelector({ selectedCover, onCoverChange }) {
  const [selected, setSelected] = useState(selectedCover || 'hardcover');

  const coverOptions = [
    {
      type: 'softcover',
      name: 'Softcover',
      price: 39.99,
      description: 'Premium perfect-bound softcover with glossy finish',
      features: [
        'Flexible cover',
        'Glossy laminate finish',
        'Perfect for gifts',
        'Ships in 3-5 business days'
      ],
      icon: '📘'
    },
    {
      type: 'hardcover',
      name: 'Hardcover',
      price: 49.99,
      description: 'Deluxe casewrap hardcover with premium feel',
      features: [
        'Rigid protective cover',
        'Premium casewrap binding',
        'Coffee table quality',
        'Ships in 3-5 business days'
      ],
      icon: '📕',
      popular: true
    }
  ];

  const handleSelect = (type) => {
    setSelected(type);
    onCoverChange(type);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Choose Your Cover Type
      </h3>
      <p className="text-gray-600 mb-6">
        Select the perfect finish for your personalized masterpiece
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {coverOptions.map((option) => (
          <div
            key={option.type}
            onClick={() => handleSelect(option.type)}
            className={`
              relative p-6 rounded-2xl border-2 cursor-pointer transition-all
              ${selected === option.type
                ? 'border-pink-500 bg-pink-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
              }
            `}
          >
            {/* Popular Badge */}
            {option.popular && (
              <div className="absolute -top-3 -right-3 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            )}

            {/* Radio Button */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{option.icon}</span>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {option.name}
                  </h4>
                  <p className="text-3xl font-bold text-pink-600">
                    ${option.price}
                  </p>
                </div>
              </div>
              
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${selected === option.type
                  ? 'border-pink-500 bg-pink-500'
                  : 'border-gray-300'
                }
              `}>
                {selected === option.type && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4">
              {option.description}
            </p>

            {/* Features */}
            <ul className="space-y-2">
              {option.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-pink-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Comparison Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>📏 Both formats:</strong> 8.5" × 8.5" square, 32 full-color pages, premium paper stock
        </p>
      </div>
    </div>
  );
}