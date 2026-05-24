'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Mail, MapPin, FileCheck, Upload, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Account', icon: Mail },
  { id: 3, title: 'Address', icon: MapPin },
  { id: 4, title: 'Verification', icon: FileCheck },
];

interface FormData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  dateOfBirth: string;
  email: string;
  password: string;
  confirmPassword: string;
  houseNo: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  idType: string;
  idFile: File | null;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  contactNumber: '',
  dateOfBirth: '',
  email: '',
  password: '',
  confirmPassword: '',
  houseNo: '',
  street: '',
  barangay: '',
  city: '',
  province: '',
  idType: '',
  idFile: null,
};

export function RegisterPage() {
  const { navigateTo, register } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const updateField = (field: keyof FormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Partial<Record<keyof FormData, string>> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) stepErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) stepErrors.lastName = 'Last name is required';
        if (!formData.contactNumber.trim()) stepErrors.contactNumber = 'Contact number is required';
        if (!formData.dateOfBirth) stepErrors.dateOfBirth = 'Date of birth is required';
        break;
      case 2:
        if (!formData.email.trim()) stepErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) stepErrors.email = 'Invalid email format';
        if (!formData.password) stepErrors.password = 'Password is required';
        else if (formData.password.length < 6) stepErrors.password = 'Password must be at least 6 characters';
        if (!formData.confirmPassword) stepErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = 'Passwords do not match';
        break;
      case 3:
        if (!formData.barangay.trim()) stepErrors.barangay = 'Barangay is required';
        if (!formData.city.trim()) stepErrors.city = 'City is required';
        if (!formData.province.trim()) stepErrors.province = 'Province is required';
        break;
      case 4:
        if (!formData.idType) stepErrors.idType = 'Please select an ID type';
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      contactNumber: formData.contactNumber,
      dateOfBirth: formData.dateOfBirth,
      address: {
        houseNo: formData.houseNo,
        street: formData.street,
        barangay: formData.barangay,
        city: formData.city,
        province: formData.province,
      },
      idType: formData.idType,
    });

    if (success) {
      toast.success('Registration successful!', {
        description: 'You can now sign in with your account.',
      });
      navigateTo('login');
    } else {
      toast.error('Registration failed', {
        description: 'Please try again.',
      });
    }

    setIsSubmitting(false);
  };

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 py-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-blue-100 dark:border-gray-800 shadow-xl shadow-blue-100/50 dark:shadow-black/20">
          <CardHeader className="text-center space-y-4 pb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex justify-center"
            >
              <Image
                src="/mmodrm-logo.png"
                alt="MMODRM Logo"
                width={56}
                height={56}
                className="shrink-0"
                priority
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Register to MMODRM
              </CardDescription>
            </motion.div>

            {/* Stepper Progress */}
            <div className="flex items-center justify-center gap-1 pt-2">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        animate={{
                          scale: isCurrent ? 1.1 : 1,
                          backgroundColor: isCompleted
                            ? '#16a34a'
                            : isCurrent
                              ? '#2563eb'
                              : undefined,
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isCompleted
                            ? 'bg-green-600 text-white'
                            : isCurrent
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : 'bg-blue-100 dark:bg-gray-800 text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                      </motion.div>
                      <span className={`text-[10px] font-medium hidden sm:block ${
                        isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-8 sm:w-12 h-0.5 mx-1 mb-4 sm:mb-0 transition-colors ${
                          currentStep > step.id ? 'bg-green-500' : 'bg-blue-200 dark:bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {currentStep === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="Juan"
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Dela Cruz"
                          value={formData.lastName}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <Input
                        id="contactNumber"
                        placeholder="+63 917 123 4567"
                        value={formData.contactNumber}
                        onChange={(e) => updateField('contactNumber', e.target.value)}
                        className={errors.contactNumber ? 'border-red-500' : ''}
                      />
                      {errors.contactNumber && <p className="text-xs text-red-500">{errors.contactNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateField('dateOfBirth', e.target.value)}
                        className={errors.dateOfBirth ? 'border-red-500' : ''}
                      />
                      {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="regEmail">Email Address *</Label>
                      <Input
                        id="regEmail"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="regPassword">Password *</Label>
                      <Input
                        id="regPassword"
                        type="password"
                        placeholder="At least 6 characters"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="houseNo">House No.</Label>
                        <Input
                          id="houseNo"
                          placeholder="123"
                          value={formData.houseNo}
                          onChange={(e) => updateField('houseNo', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="street">Street</Label>
                        <Input
                          id="street"
                          placeholder="Rizal St"
                          value={formData.street}
                          onChange={(e) => updateField('street', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barangay">Barangay *</Label>
                      <Input
                        id="barangay"
                        placeholder="Poblacion"
                        value={formData.barangay}
                        onChange={(e) => updateField('barangay', e.target.value)}
                        className={errors.barangay ? 'border-red-500' : ''}
                      />
                      {errors.barangay && <p className="text-xs text-red-500">{errors.barangay}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="Dagupan"
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          className={errors.city ? 'border-red-500' : ''}
                        />
                        {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">Province *</Label>
                        <Input
                          id="province"
                          placeholder="Pangasinan"
                          value={formData.province}
                          onChange={(e) => updateField('province', e.target.value)}
                          className={errors.province ? 'border-red-500' : ''}
                        />
                        {errors.province && <p className="text-xs text-red-500">{errors.province}</p>}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <div className="space-y-2">
                      <Label>ID Type *</Label>
                      <Select
                        value={formData.idType}
                        onValueChange={(value) => updateField('idType', value)}
                      >
                        <SelectTrigger className={`w-full ${errors.idType ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select ID Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="National ID">National ID</SelectItem>
                          <SelectItem value="Driver's License">Driver&apos;s License</SelectItem>
                          <SelectItem value="PhilHealth ID">PhilHealth ID</SelectItem>
                          <SelectItem value="Voter's ID">Voter&apos;s ID</SelectItem>
                          <SelectItem value="Passport">Passport</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.idType && <p className="text-xs text-red-500">{errors.idType}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Upload ID Document</Label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            updateField('idFile', file);
                          }}
                          className="hidden"
                          id="id-upload"
                        />
                        <label
                          htmlFor="id-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <Upload className="w-8 h-8 text-blue-400 dark:text-blue-500 mb-2" />
                          <span className="text-sm text-muted-foreground">
                            {formData.idFile ? formData.idFile.name : 'Click to upload your ID'}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                            PDF, JPG, or PNG
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Review summary */}
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-gray-800/50 border border-blue-100 dark:border-gray-700">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">Registration Summary</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Name:</span>
                        <span className="text-foreground">{formData.firstName} {formData.lastName}</span>
                        <span>Email:</span>
                        <span className="text-foreground truncate">{formData.email || '-'}</span>
                        <span>Contact:</span>
                        <span className="text-foreground">{formData.contactNumber || '-'}</span>
                        <span>Address:</span>
                        <span className="text-foreground truncate">{formData.barangay ? `${formData.barangay}, ${formData.city}` : '-'}</span>
                        <span>ID Type:</span>
                        <span className="text-foreground">{formData.idType || '-'}</span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex-col gap-4 pb-6">
            <div className="flex w-full gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-11 border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-blue-500/25"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 h-11 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-md shadow-green-500/25"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Submit Registration
                    </>
                  )}
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigateTo('login')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                Sign In
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
