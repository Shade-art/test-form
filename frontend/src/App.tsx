import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  FileBadge,
  GraduationCap,
  Calendar,
  Briefcase,
  Code2,
  Github,
  Linkedin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Database,
  ArrowRight
} from 'lucide-react';
import {
  ApplicationFormData,
  FormErrors,
  SubmittedApplication,
  HealthStatus
} from './types';
import { submitApplication, checkBackendHealth } from './services/api';

const BRANCH_OPTIONS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Production & Industrial Engineering',
  'Biotechnology',
  'Other / Interdisciplinary'
];

const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th'];

const DEPARTMENT_OPTIONS = [
  'Technical',
  'Web Development',
  'Design',
  'Marketing',
  'Management',
  'Content'
];

const INITIAL_FORM_STATE: ApplicationFormData = {
  fullName: '',
  email: '',
  phone: '',
  registrationNumber: '',
  branch: '',
  currentYear: '',
  preferredDepartment: '',
  motivation: '',
  skills: '',
  github: '',
  linkedin: ''
};

export default function App() {
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ApplicationFormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<SubmittedApplication | null>(null);
  const [health, setHealth] = useState<HealthStatus>({ status: 'checking' });
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Health check on load
  const loadHealth = async () => {
    setIsCheckingHealth(true);
    const res = await checkBackendHealth();
    setHealth(res);
    setIsCheckingHealth(false);
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Validation function
  const validateField = (name: keyof ApplicationFormData, value: string): string => {
    const val = value.trim();
    switch (name) {
      case 'fullName':
        if (!val) return 'Full Name is required.';
        if (val.length < 2) return 'Full Name must be at least 2 characters.';
        return '';
      case 'email':
        if (!val) return 'Email address is required.';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
          return 'Please enter a valid email address.';
        }
        return '';
      case 'phone':
        if (!val) return 'Phone number is required.';
        const digits = val.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 15) {
          return 'Enter a valid phone number (10-15 digits).';
        }
        return '';
      case 'registrationNumber':
        if (!val) return 'Registration number is required.';
        if (val.length < 2) return 'Registration number must be at least 2 characters.';
        return '';
      case 'branch':
        if (!val) return 'Please select your academic branch.';
        return '';
      case 'currentYear':
        if (!val) return 'Please select your current year of study.';
        return '';
      case 'preferredDepartment':
        if (!val) return 'Please select your preferred department.';
        return '';
      case 'motivation':
        if (!val) return 'Please describe why you would like to join.';
        if (val.length < 10) return 'Motivation must be at least 10 characters.';
        return '';
      case 'skills':
        if (!val) return 'Please specify your skills and competencies.';
        return '';
      case 'github':
        if (val && !/^(https?:\/\/)?([\w\d.-]+\.[\w]{2,})(\/.*)?$/i.test(val)) {
          return 'Enter a valid URL (e.g., https://github.com/username).';
        }
        return '';
      case 'linkedin':
        if (val && !/^(https?:\/\/)?([\w\d.-]+\.[\w]{2,})(\/.*)?$/i.test(val)) {
          return 'Enter a valid URL (e.g., https://linkedin.com/in/username).';
        }
        return '';
      default:
        return '';
    }
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    (Object.keys(formData) as (keyof ApplicationFormData)[]).forEach((key) => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) {
        newErrors[key] = errorMsg;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ApplicationFormData;

    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    // If field has already been touched, validate live
    if (touched[fieldName]) {
      const errorMsg = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: errorMsg || undefined }));
    }

    if (serverError) {
      setServerError(null);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ApplicationFormData;

    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const errorMsg = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: errorMsg || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    const allTouched: Partial<Record<keyof ApplicationFormData, boolean>> = {};
    (Object.keys(formData) as (keyof ApplicationFormData)[]).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    if (!validateAll()) {
      setServerError('Please review the form and correct the highlighted fields before submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const response = await submitApplication(formData);

    setIsSubmitting(false);

    if (response.success && response.data) {
      setSubmittedData(response.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setServerError(response.message || 'Submission failed. Please check inputs.');
      if (response.errors) {
        setErrors((prev) => ({ ...prev, ...response.errors }));
      }
      if (response.field) {
        setErrors((prev) => ({
          ...prev,
          [response.field as keyof ApplicationFormData]: response.message
        }));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setTouched({});
    setServerError(null);
    setSubmittedData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 text-slate-800 pb-16">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              RF
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Recruitment Portal
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Testing Application • Full-Stack Edition
              </p>
            </div>
          </div>

          {/* System Health Widget */}
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                health.status === 'ok' && health.database?.status === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : health.status === 'checking'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={
                health.status === 'ok'
                  ? `Backend active • DB Latency: ${health.database?.latencyMs ?? 0}ms`
                  : 'Backend or Database unreachable'
              }
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  health.status === 'ok' && health.database?.status === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : health.status === 'checking'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              <span className="hidden sm:inline">
                {health.status === 'ok' && health.database?.status === 'connected'
                  ? `Live (${health.database.latencyMs}ms)`
                  : health.status === 'checking'
                  ? 'Connecting...'
                  : 'Offline'}
              </span>
              <Database className="w-3 h-3 ml-0.5 opacity-70" />
            </div>

            <button
              type="button"
              onClick={loadHealth}
              disabled={isCheckingHealth}
              aria-label="Refresh system status"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header Introduction */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-xs font-semibold mb-3">
            <span>Official Application Process</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Candidate Application Form
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Submit your profile, skills, and department preferences for candidate consideration.
            All submissions are safely stored in Neon PostgreSQL via Prisma.
          </p>
        </div>

        {/* Global Server Error Banner */}
        {serverError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex items-start gap-3 shadow-xs animate-in fade-in duration-200"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-rose-900">Submission Notice</h4>
              <p className="text-sm text-rose-700 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Success Confirmation Screen */}
        {submittedData ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              Application Successfully Submitted!
            </h3>
            <p className="mt-2 text-slate-600 text-sm max-w-md mx-auto">
              Thank you, <span className="font-semibold text-slate-900">{submittedData.fullName}</span>.
              Your recruitment form has been recorded in our PostgreSQL database.
            </p>

            {/* Application Summary Card */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-lg mx-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Submission Receipt
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Application ID</span>
                  <span className="font-mono text-xs font-semibold text-slate-800 break-all">
                    {submittedData.id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Registration No.</span>
                  <span className="font-medium text-slate-800">
                    {submittedData.registrationNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Email</span>
                  <span className="font-medium text-slate-800">{submittedData.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Target Department</span>
                  <span className="inline-block px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-medium text-xs mt-0.5">
                    {submittedData.preferredDepartment}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Academic Branch</span>
                  <span className="font-medium text-slate-800">{submittedData.branch}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Current Year</span>
                  <span className="font-medium text-slate-800">{submittedData.currentYear} Year</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors shadow-sm focus:outline-hidden focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                <span>Submit Another Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Recruitment Application Form */
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
          >
            {/* Section 1: Personal Information */}
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                <div className="p-1.5 rounded-md bg-sky-50 text-sky-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    1. Personal Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide your primary contact and identification details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Alex Mercer"
                      className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-hidden focus:ring-2 ${
                        errors.fullName && touched.fullName
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                      }`}
                    />
                  </div>
                  {errors.fullName && touched.fullName && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="alex.mercer@example.com"
                      className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-hidden focus:ring-2 ${
                        errors.email && touched.email
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                      }`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+1 (555) 019-2834"
                      className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-hidden focus:ring-2 ${
                        errors.phone && touched.phone
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                      }`}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>
                  )}
                </div>

                {/* Registration Number */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="registrationNumber"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Registration Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FileBadge className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. REG-2026-9481"
                      className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors uppercase font-mono tracking-wider focus:outline-hidden focus:ring-2 ${
                        errors.registrationNumber && touched.registrationNumber
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                      }`}
                    />
                  </div>
                  {errors.registrationNumber && touched.registrationNumber && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.registrationNumber}</p>
                  )}
                </div>

                {/* Branch Dropdown */}
                <div>
                  <label
                    htmlFor="branch"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Branch / Major <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <select
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`block w-full pl-10 pr-8 py-2.5 rounded-lg border text-sm transition-colors bg-white focus:outline-hidden focus:ring-2 ${
                        errors.branch && touched.branch
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                      }`}
                    >
                      <option value="">Select your branch</option>
                      {BRANCH_OPTIONS.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.branch && touched.branch && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.branch}</p>
                  )}
                </div>

                {/* Current Year Dropdown */}
                <div>
                  <label
                    htmlFor="currentYear"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Current Year <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <select
                      id="currentYear"
                      name="currentYear"
                      value={formData.currentYear}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`block w-full pl-10 pr-8 py-2.5 rounded-lg border text-sm transition-colors bg-white focus:outline-hidden focus:ring-2 ${
                        errors.currentYear && touched.currentYear
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                      }`}
                    >
                      <option value="">Select your year</option>
                      {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                          {year} Year
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.currentYear && touched.currentYear && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.currentYear}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Application Information */}
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    2. Application Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select your preferred department and explain your motivation.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Preferred Department */}
                <div>
                  <label
                    htmlFor="preferredDepartment"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Preferred Department <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <select
                      id="preferredDepartment"
                      name="preferredDepartment"
                      value={formData.preferredDepartment}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`block w-full pl-10 pr-8 py-2.5 rounded-lg border text-sm transition-colors bg-white focus:outline-hidden focus:ring-2 ${
                        errors.preferredDepartment && touched.preferredDepartment
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                      }`}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.preferredDepartment && touched.preferredDepartment && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {errors.preferredDepartment}
                    </p>
                  )}
                </div>

                {/* Why do you want to join? (Motivation) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="motivation"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                      Why do you want to join? <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">
                      {formData.motivation.length} / 2000 characters
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      id="motivation"
                      name="motivation"
                      rows={4}
                      value={formData.motivation}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Tell us about your interests, what drives you, and what you hope to achieve and contribute..."
                      className={`block w-full p-3 rounded-lg border text-sm transition-colors focus:outline-hidden focus:ring-2 ${
                        errors.motivation && touched.motivation
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                      }`}
                    />
                  </div>
                  {errors.motivation && touched.motivation && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.motivation}</p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <label
                    htmlFor="skills"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Skills & Technologies <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. JavaScript, Python, UI/UX Design, Figma, Project Planning"
                      className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-hidden focus:ring-2 ${
                        errors.skills && touched.skills
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                          : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                      }`}
                    />
                  </div>
                  {errors.skills && touched.skills && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.skills}</p>
                  )}
                </div>

                {/* GitHub & LinkedIn Profiles (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GitHub URL */}
                  <div>
                    <label
                      htmlFor="github"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      GitHub Profile <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Github className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        id="github"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="https://github.com/username"
                        className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-hidden focus:ring-2 ${
                          errors.github && touched.github
                            ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                            : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                        }`}
                      />
                    </div>
                    {errors.github && touched.github && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.github}</p>
                    )}
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label
                      htmlFor="linkedin"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      LinkedIn Profile <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        id="linkedin"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="https://linkedin.com/in/username"
                        className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-hidden focus:ring-2 ${
                          errors.linkedin && touched.linkedin
                            ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                            : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-sky-200'
                        }`}
                      />
                    </div>
                    {errors.linkedin && touched.linkedin && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.linkedin}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action Area */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span className="text-rose-500 font-bold">*</span> All marked fields are mandatory. Double submissions are prevented.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white shadow-md transition-all focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${
                  isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 active:scale-98'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <footer className="mt-12 text-center text-xs text-slate-400 space-y-1">
          <p>Full-Stack Recruitment Form Testing Project</p>
          <p>
            Vite + React + TypeScript • Fastify + Node.js • Prisma ORM • Neon PostgreSQL
          </p>
        </footer>
      </main>
    </div>
  );
}
