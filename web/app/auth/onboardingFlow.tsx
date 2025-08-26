'use client'

/**
 * WSL User Onboarding Flow - Production Version
 * 
 * Collects surf preferences and completes user profile setup
 * Integrates with PubNub App Context for real user data
 */

import { useState } from 'react';
import Image from 'next/image';
import { WSLUser } from './realAuthentication';

interface OnboardingFlowProps {
  user: WSLUser;
  onComplete: (updatedUser: WSLUser) => void;
  onSkip: () => void;
}

interface OnboardingData {
  surfLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  favoriteSpots: string[];
  homeBreak: string;
  interests: string[];
  notifications: boolean;
  language: 'en' | 'pt' | 'es' | 'fr';
}

const SURF_SPOTS = [
  { id: 'pipeline', name: 'Pipeline, Hawaii', country: 'USA' },
  { id: 'teahupoo', name: 'Teahupo\'o', country: 'Tahiti' },
  { id: 'mavericks', name: 'Mavericks', country: 'California, USA' },
  { id: 'nazare', name: 'Nazaré', country: 'Portugal' },
  { id: 'trestles', name: 'Trestles', country: 'California, USA' },
  { id: 'bells-beach', name: 'Bells Beach', country: 'Australia' },
  { id: 'jeffreys-bay', name: 'Jeffreys Bay', country: 'South Africa' },
  { id: 'hossegor', name: 'Hossegor', country: 'France' },
  { id: 'uluwatu', name: 'Uluwatu', country: 'Indonesia' },
  { id: 'cloudbreak', name: 'Cloudbreak', country: 'Fiji' }
];

const SURF_INTERESTS = [
  'Live Heat Coverage',
  'Fantasy Surfing',
  'Clip Highlights',
  'Portuguese Translation',
  'Watch Parties',
  'Surfer Interviews',
  'Wave Analysis',
  'Contest Predictions'
];

export default function OnboardingFlow({ user, onComplete, onSkip }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    surfLevel: 'beginner',
    favoriteSpots: [],
    homeBreak: '',
    interests: [],
    notifications: true,
    language: 'en'
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const updatedUser: WSLUser = {
      ...user,
      surfLevel: onboardingData.surfLevel,
      favoriteSpots: onboardingData.favoriteSpots,
      homeBreak: onboardingData.homeBreak,
      preferences: {
        ...user.preferences,
        language: onboardingData.language,
        notifications: onboardingData.notifications
      }
    };

    onComplete(updatedUser);
  };

  const updateOnboardingData = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/pubnub-logos/pubnub.svg" alt="WSL" width={60} height={60} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to WSL Live! 🌊</h1>
          <p className="text-gray-600">Let's customize your surf experience</p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">What's your surf level? 🏄‍♂️</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'beginner', label: 'Beginner', emoji: '🌊', desc: 'Just starting to catch waves' },
                { value: 'intermediate', label: 'Intermediate', emoji: '🏄', desc: 'Comfortable on most waves' },
                { value: 'advanced', label: 'Advanced', emoji: '🏄‍♂️', desc: 'Experienced in all conditions' },
                { value: 'pro', label: 'Professional', emoji: '🏆', desc: 'Competing or coaching' }
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => updateOnboardingData('surfLevel', level.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    onboardingData.surfLevel === level.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{level.emoji}</div>
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-sm text-gray-600">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">Favorite surf spots? 🌍</h2>
            <p className="text-center text-gray-600">Select up to 5 spots you love to follow</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {SURF_SPOTS.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => {
                    if (onboardingData.favoriteSpots.includes(spot.id)) {
                      updateOnboardingData('favoriteSpots', 
                        onboardingData.favoriteSpots.filter(s => s !== spot.id)
                      );
                    } else if (onboardingData.favoriteSpots.length < 5) {
                      updateOnboardingData('favoriteSpots', 
                        [...onboardingData.favoriteSpots, spot.id]
                      );
                    }
                  }}
                  disabled={!onboardingData.favoriteSpots.includes(spot.id) && onboardingData.favoriteSpots.length >= 5}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    onboardingData.favoriteSpots.includes(spot.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 disabled:opacity-50'
                  }`}
                >
                  <div className="font-semibold">{spot.name}</div>
                  <div className="text-sm text-gray-600">{spot.country}</div>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center">
              Selected: {onboardingData.favoriteSpots.length}/5
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">What interests you most? 📺</h2>
            <div className="grid grid-cols-2 gap-3">
              {SURF_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => updateOnboardingData('interests', 
                    toggleArrayItem(onboardingData.interests, interest)
                  )}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    onboardingData.interests.includes(interest)
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{interest}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">Final preferences 🎯</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language
                </label>
                <select
                  value={onboardingData.language}
                  onChange={(e) => updateOnboardingData('language', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home Break (Optional)
                </label>
                <input
                  type="text"
                  value={onboardingData.homeBreak}
                  onChange={(e) => updateOnboardingData('homeBreak', e.target.value)}
                  placeholder="e.g., Malibu, California"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={onboardingData.notifications}
                  onChange={(e) => updateOnboardingData('notifications', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="notifications" className="text-sm text-gray-700">
                  Send me notifications for live heats and big waves
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Skip for now
          </button>
          
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {step === totalSteps ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

