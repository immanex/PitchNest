import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Check, Briefcase, GraduationCap, Users, TrendingUp, Rocket, Building, ChevronRight, ChevronLeft } from 'lucide-react';

const steps = ['Industry', 'Pitch Type', 'Experience'];

const industries = [
  { id: 'fintech', label: 'FinTech', icon: <TrendingUp className="w-6 h-6" /> },
  { id: 'saas', label: 'SaaS', icon: <Rocket className="w-6 h-6" /> },
  { id: 'healthcare', label: 'Healthcare', icon: <Building className="w-6 h-6" /> },
  { id: 'ecommerce', label: 'E-Commerce', icon: <Briefcase className="w-6 h-6" /> },
  { id: 'edtech', label: 'EdTech', icon: <GraduationCap className="w-6 h-6" /> },
  { id: 'other', label: 'Other', icon: <Users className="w-6 h-6" /> },
];

const pitchTypes = [
  { id: 'startup', label: 'Startup Founder', description: 'Raising seed or Series A funding' },
  { id: 'student', label: 'Student', description: 'Pitching for competition or grants' },
  { id: 'coach', label: 'Coach/Mentor', description: 'Training others on pitching' },
];

const experienceLevels = [
  { id: 'beginner', label: 'Beginner', description: 'First time pitching' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some pitching experience' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced pitcher' },
];

export default function ProfileSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const navigate = useNavigate();

  const canProceed = () => {
    if (currentStep === 0) return selectedIndustry !== '';
    if (currentStep === 1) return selectedType !== '';
    if (currentStep === 2) return selectedExperience !== '';
    return false;
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-[#3B82F6] opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-[#7C3AED] opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index <= currentStep
                        ? 'bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                        : 'bg-white/10 border border-white/20'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                      index < currentStep ? 'bg-gradient-to-r from-[#3B82F6] to-[#7C3AED]' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 0 && (
            <div>
              <h2 className="text-3xl mb-3">Select Your Industry</h2>
              <p className="text-gray-400 mb-8">Choose the industry that best matches your pitch</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {industries.map((industry) => (
                  <button
                    key={industry.id}
                    onClick={() => setSelectedIndustry(industry.id)}
                    className={`p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                      selectedIndustry === industry.id
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-[#3B82F6] mb-3 flex justify-center">{industry.icon}</div>
                    <div className="text-center">{industry.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h2 className="text-3xl mb-3">Select Your Pitch Type</h2>
              <p className="text-gray-400 mb-8">What's your role in this pitch?</p>
              
              <div className="space-y-4">
                {pitchTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 text-left ${
                      selectedType === type.id
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-lg mb-2">{type.label}</div>
                    <div className="text-sm text-gray-400">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-3xl mb-3">Select Your Experience Level</h2>
              <p className="text-gray-400 mb-8">This helps us tailor the simulation</p>
              
              <div className="space-y-4">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedExperience(level.id)}
                    className={`w-full p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 text-left ${
                      selectedExperience === level.id
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-lg mb-2">{level.label}</div>
                    <div className="text-sm text-gray-400">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12">
          {currentStep > 0 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </Link>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
              canProceed()
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]'
                : 'bg-white/5 border border-white/10 opacity-50 cursor-not-allowed'
            }`}
          >
            {currentStep === 2 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
