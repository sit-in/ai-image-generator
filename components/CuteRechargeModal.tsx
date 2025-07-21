'use client'

import React, { useState } from 'react'
import { X, CreditCard, ShoppingCart, Sparkles } from 'lucide-react'
import { CuteButton, CuteCard, CuteBadge } from './CuteUIComponents'
import Image from 'next/image'

interface RechargeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CuteRechargeModal = ({ isOpen, onClose }: RechargeModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [showQRCode, setShowQRCode] = useState(false)

  const packages = [
    {
      id: 'basic',
      credits: 100,
      price: 10,
      originalPrice: 10,
      badge: null,
      popular: false
    },
    {
      id: 'standard',
      credits: 500,
      price: 45,
      originalPrice: 50,
      badge: '优惠10%',
      popular: true
    },
    {
      id: 'premium',
      credits: 1000,
      price: 85,
      originalPrice: 100,
      badge: '优惠15%',
      popular: false
    },
    {
      id: 'ultra',
      credits: 5000,
      price: 400,
      originalPrice: 500,
      badge: '超值优惠',
      popular: false
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg animate-slide-in-up">
        <CuteCard className="relative overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
          >
            <X className="w-5 h-5 text-pink-600" />
          </button>
          
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
              充值积分
              <Sparkles className="w-6 h-6 ml-2 text-yellow-500" />
            </h2>
            <p className="text-gray-600">选择充值套餐，获得更多创作次数！</p>
          </div>
          
          {!showQRCode ? (
            <>
              {/* Package Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`
                      relative p-4 rounded-2xl border-2 transition-all duration-300
                      ${selectedPackage === pkg.id 
                        ? 'border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 scale-105' 
                        : 'border-gray-200 bg-white hover:border-pink-200 hover:scale-105'
                      }
                      ${pkg.popular ? 'shadow-cute-primary' : ''}
                    `}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs px-3 py-1 rounded-full">
                        人气推荐
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {pkg.credits}
                        <span className="text-sm font-normal text-gray-600 ml-1">积分</span>
                      </div>
                      <div className="text-lg font-bold text-pink-500 mt-1">
                        ¥{pkg.price}
                      </div>
                      {pkg.originalPrice > pkg.price && (
                        <div className="text-sm text-gray-400 line-through">
                          ¥{pkg.originalPrice}
                        </div>
                      )}
                      {pkg.badge && (
                        <CuteBadge color="pink" size="sm">
                          {pkg.badge}
                        </CuteBadge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600">选择支付方式：</p>
                <CuteButton
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={!selectedPackage}
                  onClick={() => setShowQRCode(true)}
                  icon={<ShoppingCart className="w-5 h-5" />}
                >
                  淘宝扫码支付
                </CuteButton>
                <p className="text-xs text-center text-gray-500">
                  支付完成后，请将订单号发送给客服领取积分
                </p>
              </div>
            </>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="text-center space-y-4">
                <div className="bg-gray-100 rounded-2xl p-8 inline-block">
                  {/* This would be the actual QR code */}
                  <div className="w-48 h-48 bg-gray-300 rounded-xl flex items-center justify-center">
                    <span className="text-gray-600">淘宝二维码</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium text-gray-800">
                    请使用淘宝扫描二维码
                  </p>
                  <p className="text-sm text-gray-600">
                    充值金额：<span className="font-bold text-pink-500">¥{packages.find(p => p.id === selectedPackage)?.price}</span>
                  </p>
                </div>
                
                <div className="bg-pink-50 rounded-xl p-4 text-sm text-pink-700">
                  <p className="font-medium mb-1">支付完成后：</p>
                  <ol className="text-left space-y-1">
                    <li>1. 截图保存订单号</li>
                    <li>2. 联系客服微信：AI_Service</li>
                    <li>3. 发送订单号领取积分</li>
                  </ol>
                </div>
                
                <CuteButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQRCode(false)}
                >
                  返回选择套餐
                </CuteButton>
              </div>
            </>
          )}
        </CuteCard>
      </div>
    </div>
  )
}

// 悬浮充值按钮
export const FloatingRechargeButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40"
      >
        <CreditCard className="w-6 h-6" />
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          充
        </div>
      </button>
      
      <CuteRechargeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}