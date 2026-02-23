/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Package, 
  BarChart3, 
  FileText, 
  Settings, 
  Plus, 
  Search,
  ChevronRight,
  UserPlus,
  Stethoscope,
  Pill,
  TrendingUp,
  MapPin,
  Calendar,
  AlertCircle,
  BookOpen,
  Lock,
  User,
  LogOut,
  Save,
  HelpCircle,
  CheckCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

// --- Types ---

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'Male' | 'Female';
  address: string;
  purok: string;
  contact: string;
  lastVisit?: string;
}

interface Consultation {
  id: string;
  patientId: string;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  prescribedMeds: string[];
  followUp?: string;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  expiryDate: string;
}

interface UserProfile {
  id: number;
  username: string;
  name: string;
  role: string;
}

// --- Mock Data ---

const MOCK_PATIENTS: Patient[] = [
  { id: '1', firstName: 'Juan', lastName: 'Dela Cruz', age: 45, sex: 'Male', address: 'Poblacion', purok: 'Purok 1', contact: '09123456789', lastVisit: '2024-02-15' },
  { id: '2', firstName: 'Maria', lastName: 'Santos', age: 28, sex: 'Female', address: 'Poblacion', purok: 'Purok 3', contact: '09987654321', lastVisit: '2024-02-10' },
  { id: '3', firstName: 'Pedro', lastName: 'Penduko', age: 12, sex: 'Male', address: 'Poblacion', purok: 'Purok 2', contact: '09112223334', lastVisit: '2024-02-18' },
  { id: '4', firstName: 'Elena', lastName: 'Reyes', age: 65, sex: 'Female', address: 'Poblacion', purok: 'Purok 5', contact: '09445556667', lastVisit: '2024-02-05' },
];

const MOCK_CONSULTATIONS: Consultation[] = [
  { id: 'c1', patientId: '1', date: '2024-02-15', chiefComplaint: 'Cough and Fever', diagnosis: 'Common Cold', treatment: 'Rest and Hydration', prescribedMeds: ['Paracetamol'], followUp: '2024-02-22' },
  { id: 'c2', patientId: '2', date: '2024-02-10', chiefComplaint: 'Stomach Ache', diagnosis: 'Hyperacidity', treatment: 'Avoid spicy food', prescribedMeds: ['Antacid'], followUp: '2024-02-17' },
  { id: 'c3', patientId: '3', date: '2024-02-18', chiefComplaint: 'Skin Rash', diagnosis: 'Contact Dermatitis', treatment: 'Apply topical cream', prescribedMeds: ['Hydrocortisone'], followUp: '2024-02-25' },
];

const MOCK_MEDS: Medicine[] = [
  { id: 'm1', name: 'Paracetamol', category: 'Analgesic', stock: 500, unit: 'Tablets', expiryDate: '2025-12-31' },
  { id: 'm2', name: 'Amoxicillin', category: 'Antibiotic', stock: 200, unit: 'Capsules', expiryDate: '2024-10-15' },
  { id: 'm3', name: 'Cetirizine', category: 'Antihistamine', stock: 150, unit: 'Tablets', expiryDate: '2025-06-20' },
  { id: 'm4', name: 'Losartan', category: 'Antihypertensive', stock: 300, unit: 'Tablets', expiryDate: '2026-01-10' },
];

// --- Academic Content ---

const THESIS_CHAPTER_1 = `
# CHAPTER 1: INTRODUCTION

## 1.1 Background of the Study
In the Philippines, the barangay serves as the primary unit of government and the first point of contact for health services through the Barangay Health Center (BHC). In rural areas like Barangay Poblacion in Jamindan, Capiz, the BHC plays a critical role in providing basic healthcare, maternal and child health services, and disease surveillance. However, the management of patient records in many of these centers remains predominantly manual, relying on paper-based logbooks and individual treatment cards.

Manual record-keeping poses significant challenges. Records are susceptible to physical damage from humidity, pests, or disasters. Retrieving a patient's history often involves searching through stacks of folders, which is time-consuming and prone to human error. Furthermore, generating health reports for the Municipal Health Office (MHO) requires manual tallying, a process that is not only laborious but also delays the identification of health trends and outbreaks.

The enactment of Republic Act No. 11223, also known as the Universal Health Care (UHC) Act, emphasizes the need for a comprehensive and integrated health system. Digital transformation at the grassroots level is essential to fulfill the UHC mandate of providing every Filipino with access to quality health services without financial hardship.

E-clinic is proposed as a solution to bridge this technological gap. By digitizing patient records and integrating data analytics, the system aims to transform the BHC of Barangay Poblacion into a data-driven health facility. This transition from "paper to pixels" is not merely an administrative upgrade but a strategic move to enhance the quality of care and the efficiency of public health interventions in Jamindan.

## 1.2 Statement of the Problem
The Barangay Health Center of Poblacion, Jamindan, Capiz, currently faces several operational inefficiencies due to its manual health information system:

1.  **Data Fragmentation and Loss:** Patient records are often scattered across different logbooks, making it difficult to maintain a longitudinal view of a patient's health history.
2.  **Inefficient Reporting:** The process of consolidating data for monthly and quarterly reports is slow and prone to inaccuracies, hindering timely decision-making by health officials.
3.  **Lack of Health Insights:** Without a systematic way to analyze data, the BHC cannot easily identify emerging health trends, such as seasonal spikes in respiratory illnesses or the prevalence of non-communicable diseases in specific puroks.
4.  **Inventory Management Issues:** Tracking the stock levels and expiration dates of medicines is done manually, leading to occasional stock-outs or wastage of expired supplies.

## 1.3 Objectives of the Study
### 1.3.1 General Objective
To develop E-clinic, a Clinic Management System integrated with Patient Record Analytics, to enhance healthcare delivery and improve patient data management in Barangay Health Center of Poblacion, Jamindan, Capiz.

### 1.3.2 Specific Objectives
1.  **Digital Patient Record System:** To design and implement a secure database for capturing and storing comprehensive patient information, including demographics, clinical history, and treatment plans.
2.  **Geospatial Organization:** To organize patient records by purok to facilitate targeted health monitoring and community-based interventions.
3.  **Analytics and Reporting:** To develop a dashboard that visualizes health indicators, such as top illnesses, demographic distributions, and medicine consumption patterns.
4.  **Operational Streamlining:** To automate daily clinic tasks, including patient registration, consultation recording, and medicine dispensing.
5.  **Quality Evaluation:** To assess the system's performance and acceptability based on ISO/IEC 25010 standards through user testing with BHWs and health professionals.

## 1.4 Significance of the Study
The findings and the developed system will be beneficial to the following:

-   **Barangay Health Workers (BHWs):** It will reduce their clerical workload, allowing them to focus more on patient care and community outreach.
-   **Barangay Residents:** Patients will experience faster service and better-informed consultations as their medical histories are readily available.
-   **Barangay Officials:** The analytics will provide evidence-based data for budgeting and planning health programs.
-   **Municipal Health Office (MHO):** Timely and accurate digital reports will improve the overall health surveillance of the municipality of Jamindan.
-   **Future Researchers:** This study can serve as a reference for developing similar health informatics solutions in other rural settings.

## 1.5 Scope and Limitations
The study focuses on the development and implementation of the E-clinic system for the BHC of Barangay Poblacion, Jamindan, Capiz. The system includes modules for patient registration, consultation, medicine inventory, and an analytics dashboard. 

**Limitations:**
-   The system is designed for the specific needs of a Barangay Health Center and may not include complex hospital features like laboratory management or billing.
-   Data security is limited to standard web authentication and authorization protocols.
-   Implementation is dependent on the availability of hardware (computers/tablets) and stable internet connectivity in the barangay.

## 1.6 Definition of Terms
-   **Barangay Health Center (BHC):** The primary healthcare facility at the community level in the Philippines.
-   **Patient Record Analytics:** The process of analyzing health data to identify patterns, trends, and insights.
-   **Purok:** A sub-division of a barangay, used for local administrative and health tracking purposes.
-   **ISO/IEC 25010:** An international standard for evaluating software quality.
`;

// --- Components ---

const ForgotPasswordModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGetQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/forgot-password?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.success) {
        setQuestion(data.question);
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, answer, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Password reset successfully! You can now log in.');
        setStep(3);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Reset Password</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={handleGetQuestion} className="space-y-4">
            <p className="text-sm text-slate-500">Enter your username to retrieve your security question.</p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
              <input 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-4">
              <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Security Question</p>
              <p className="text-sm text-emerald-900 font-medium">{question}</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Your Answer</label>
              <input 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
              <input 
                required type="password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <p className="text-slate-900 font-bold">{success}</p>
            <button 
              onClick={onClose}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
            >
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (user: UserProfile) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl shadow-emerald-100 border border-slate-100 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-600 p-4 rounded-2xl mb-4 shadow-lg shadow-emerald-200">
            <Stethoscope className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">E-clinic Login</h1>
          <p className="text-slate-500 text-sm">Barangay Poblacion Health System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-medium">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
          </button>

          <div className="text-center mt-4">
            <button 
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-emerald-600 font-semibold hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </form>

        <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">Jamindan, Capiz • Health Information System</p>
        </div>
      </motion.div>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
        : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, color, trend, onClick }: { label: string, value: string | number, icon: any, color: string, trend?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-emerald-100 group' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
    <div className="flex items-end justify-between">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {onClick && (
        <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
      )}
    </div>
  </div>
);

const PUROK_LOCATIONS = [
  { name: 'Purok 1', lat: 11.4285, lng: 122.4815 },
  { name: 'Purok 2', lat: 11.4290, lng: 122.4820 },
  { name: 'Purok 3', lat: 11.4275, lng: 122.4825 },
  { name: 'Purok 4', lat: 11.4270, lng: 122.4810 },
  { name: 'Purok 5', lat: 11.4280, lng: 122.4830 },
  { name: 'Purok 6', lat: 11.4295, lng: 122.4805 },
  { name: 'Purok 7', lat: 11.4265, lng: 122.4835 },
];

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-4 text-amber-600">
          <HelpCircle size={24} />
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100">
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MedicineModal = ({ isOpen, onClose, onSave, initialData }: { isOpen: boolean, onClose: () => void, onSave: (med: any) => void, initialData?: any }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: '',
    unit: 'pcs',
    expiryDate: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        stock: initialData.stock.toString(),
        unit: initialData.unit,
        expiryDate: initialData.expiryDate
      });
    } else {
      setFormData({ name: '', category: '', stock: '', unit: 'pcs', expiryDate: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Medicine' : 'Add New Medicine'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Plus className="rotate-45" size={24} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Medicine Name</label>
            <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
            <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Stock</label>
              <input required type="number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Unit</label>
              <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date</label>
            <input required type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100">Save</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ConsultationModal = ({ isOpen, onClose, onSave, patients }: { isOpen: boolean, onClose: () => void, onSave: (cons: any) => void, patients: Patient[] }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',
    prescribedMeds: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">New Consultation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Plus className="rotate-45" size={24} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Patient</label>
            <select required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})}>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (#{p.id})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Chief Complaint</label>
            <textarea required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]" value={formData.chiefComplaint} onChange={e => setFormData({...formData, chiefComplaint: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Diagnosis</label>
            <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Prescribed Meds (comma separated)</label>
            <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" value={formData.prescribedMeds} onChange={e => setFormData({...formData, prescribedMeds: e.target.value})} placeholder="e.g. Paracetamol, Amoxicillin" />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100">Save Record</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const PatientModal = ({ isOpen, onClose, onSave, initialData }: { isOpen: boolean, onClose: () => void, onSave: (patient: any) => void, initialData?: any }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    sex: 'Male',
    address: 'Poblacion',
    purok: '',
    contact: ''
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        age: initialData.age || '',
        sex: initialData.sex || 'Male',
        address: initialData.address || 'Poblacion',
        purok: initialData.purok || '',
        contact: initialData.contact || ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        age: '',
        sex: 'Male',
        address: 'Poblacion',
        purok: '',
        contact: ''
      });
    }
  }, [initialData, isOpen]);

  const detectPurok = () => {
    if (initialData) return; // Don't auto-detect if editing
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Find closest purok
        let closestPurok = PUROK_LOCATIONS[0].name;
        let minDistance = Infinity;

        PUROK_LOCATIONS.forEach(p => {
          const dist = Math.sqrt(Math.pow(p.lat - latitude, 2) + Math.pow(p.lng - longitude, 2));
          if (dist < minDistance) {
            minDistance = dist;
            closestPurok = p.name;
          }
        });

        setFormData(prev => ({ ...prev, purok: closestPurok }));
        setDetectingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Permission denied or location unavailable. Please select manually.");
        setDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      detectPurok();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Patient Details' : 'Add New Patient'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
              <input 
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
              <input 
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
              <input 
                required type="number"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Sex</label>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.sex}
                onChange={e => setFormData({...formData, sex: e.target.value as any})}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Purok</label>
            <div className="relative">
              <select 
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                value={formData.purok}
                onChange={e => setFormData({...formData, purok: e.target.value})}
              >
                <option value="">Select Purok</option>
                {PUROK_LOCATIONS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                {detectingLocation && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
                {!detectingLocation && <MapPin size={16} className="text-slate-400" />}
              </div>
            </div>
            {locationError && <p className="text-[10px] text-amber-600 font-medium">{locationError}</p>}
            {!detectingLocation && !formData.purok && !locationError && (
              <p className="text-[10px] text-slate-500">Detecting location...</p>
            )}
            {formData.purok && !detectingLocation && (
              <p className="text-[10px] text-emerald-600 font-medium">Location detected: {formData.purok}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Contact Number</label>
            <input 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="09XXXXXXXXX"
              value={formData.contact}
              onChange={e => setFormData({...formData, contact: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
            >
              {initialData ? 'Update Patient' : 'Save Patient'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [meds, setMeds] = useState<Medicine[]>(MOCK_MEDS);
  const [consultations, setConsultations] = useState<Consultation[]>(MOCK_CONSULTATIONS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(p => 
      p.firstName.toLowerCase().includes(query) || 
      p.lastName.toLowerCase().includes(query) || 
      p.id.includes(query) ||
      p.purok.toLowerCase().includes(query)
    );
  }, [patients, searchQuery]);

  const filteredMeds = useMemo(() => {
    if (!searchQuery) return meds;
    const query = searchQuery.toLowerCase();
    return meds.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.category.toLowerCase().includes(query)
    );
  }, [meds, searchQuery]);

  const exportPatientsToCSV = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Age', 'Sex', 'Purok', 'Contact', 'Last Visit'];
    const rows = patients.map(p => [p.id, p.firstName, p.lastName, p.age, p.sex, p.purok, p.contact, p.lastVisit]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Profile Edit State
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editRecoveryQuestion, setEditRecoveryQuestion] = useState('');
  const [editRecoveryAnswer, setEditRecoveryAnswer] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [updating, setUpdating] = useState(false);

  React.useEffect(() => {
    if (user) {
      setEditUsername(user.username);
      setEditName(user.name);
      setEditRecoveryQuestion((user as any).recovery_question || '');
      setEditRecoveryAnswer((user as any).recovery_answer || '');
    }
  }, [user]);

  // Real-time username check
  React.useEffect(() => {
    if (!editUsername || !user || editUsername === user.username) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const response = await fetch(`/api/check-username?username=${encodeURIComponent(editUsername)}&excludeId=${user.id}`);
        const data = await response.json();
        setUsernameAvailable(data.available);
      } catch (err) {
        console.error("Check username error:", err);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [editUsername, user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmSave(true);
  };

  const performUpdateProfile = async () => {
    setUpdating(true);
    setUpdateStatus(null);

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername,
          password: editPassword || undefined,
          name: editName,
          recoveryQuestion: editRecoveryQuestion,
          recoveryAnswer: editRecoveryAnswer
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUpdateStatus({ type: 'success', message: 'Profile updated successfully!' });
        setUser(prev => prev ? { ...prev, username: editUsername, name: editName } : null);
        setEditPassword('');
      } else {
        setUpdateStatus({ type: 'error', message: data.message || 'Update failed' });
      }
    } catch (err) {
      setUpdateStatus({ type: 'error', message: 'Connection error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!isLoggedIn) {
    return <Login onLogin={(user) => {
      setUser(user);
      setIsLoggedIn(true);
    }} />;
  }

  // Analytics Data
  const purokData = [
    { name: 'Purok 1', patients: 45 },
    { name: 'Purok 2', patients: 32 },
    { name: 'Purok 3', patients: 58 },
    { name: 'Purok 4', patients: 24 },
    { name: 'Purok 5', patients: 41 },
  ];

  const illnessData = [
    { name: 'Common Cold', value: 40 },
    { name: 'Hypertension', value: 25 },
    { name: 'Dermatitis', value: 15 },
    { name: 'UTI', value: 10 },
    { name: 'Others', value: 10 },
  ];

  const monthlyVisits = [
    { month: 'Sep', visits: 120 },
    { month: 'Oct', visits: 150 },
    { month: 'Nov', visits: 180 },
    { month: 'Dec', visits: 140 },
    { month: 'Jan', visits: 210 },
    { month: 'Feb', visits: 195 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const generateAiInsights = async () => {
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this health data for Barangay Poblacion, Jamindan, Capiz and provide 3-4 actionable insights for the Barangay Health Workers. 
        Data: 
        - Total Patients: 200
        - Top Illness: Common Cold (40%), Hypertension (25%)
        - Purok with highest cases: Purok 3
        - Monthly Trend: Increasing visits in January/February.
        Keep it professional and community-focused.`,
      });
      setAiInsights(response.text || "Unable to generate insights at this time.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiInsights("Error connecting to AI service. Please check your API key.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col p-6 transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10 px-2 lg:block">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Stethoscope className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-900">E-clinic</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={Users} label="Patients" active={activeTab === 'patients'} onClick={() => { setActiveTab('patients'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={ClipboardList} label="Consultations" active={activeTab === 'consultations'} onClick={() => { setActiveTab('consultations'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={Package} label="Inventory" active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={BookOpen} label="Thesis Chapter" active={activeTab === 'thesis'} onClick={() => { setActiveTab('thesis'); setIsMobileMenuOpen(false); }} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 space-y-2">
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={LogOut} label="Logout" active={false} onClick={handleLogout} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <Search size={20} />
            </button>
            <div className="relative w-48 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search patients, records, or meds..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {user?.name[0]}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
                    <p className="text-slate-500">Welcome back! Here's what's happening in Brgy. Poblacion today.</p>
                  </div>
                  <button 
                    onClick={() => { setEditingPatient(null); setShowPatientModal(true); }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                  >
                    <Plus size={20} />
                    New Patient
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    label="Total Patients" 
                    value="1,248" 
                    icon={Users} 
                    color="bg-blue-500" 
                    trend="+12% this month" 
                    onClick={() => setActiveTab('patients')}
                  />
                  <StatCard 
                    label="Consultations Today" 
                    value="18" 
                    icon={ClipboardList} 
                    color="bg-emerald-500" 
                    trend="Busy day" 
                    onClick={() => setActiveTab('consultations')}
                  />
                  <StatCard 
                    label="Low Stock Meds" 
                    value="4" 
                    icon={Package} 
                    color="bg-amber-500" 
                    trend="Action required" 
                    onClick={() => setActiveTab('inventory')}
                  />
                  <StatCard 
                    label="Active Puroks" 
                    value="7" 
                    icon={MapPin} 
                    color="bg-indigo-500" 
                    onClick={() => setActiveTab('analytics')}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Activity */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Recent Consultations</h3>
                      <button className="text-emerald-600 text-sm font-semibold hover:underline">View all</button>
                    </div>
                    <div className="space-y-4">
                      {MOCK_CONSULTATIONS.map((c) => {
                        const patient = MOCK_PATIENTS.find(p => p.id === c.patientId);
                        return (
                          <div key={c.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                {patient?.firstName[0]}{patient?.lastName[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {patient?.firstName} {patient?.lastName} 
                                  <span className="ml-2 text-xs font-normal text-slate-400">#{patient?.id}</span>
                                </p>
                                <p className="text-xs text-slate-500">{c.diagnosis} • {c.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                                {patient?.purok}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Top Illnesses</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={illnessData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {illnessData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {illnessData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                            <span className="text-slate-600">{item.name}</span>
                          </div>
                          <span className="font-semibold">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Health Analytics</h2>
                    <p className="text-slate-500">Data-driven insights for Barangay Poblacion.</p>
                  </div>
                  <button 
                    onClick={generateAiInsights}
                    disabled={loadingAi}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {loadingAi ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <TrendingUp size={20} />
                    )}
                    Generate AI Insights
                  </button>
                </div>

                {aiInsights && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl"
                  >
                    <div className="flex items-center gap-2 mb-4 text-indigo-700">
                      <AlertCircle size={20} />
                      <h3 className="font-bold">AI-Generated Health Insights</h3>
                    </div>
                    <div className="prose prose-indigo prose-sm max-w-none text-indigo-900">
                      <Markdown>{aiInsights}</Markdown>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Visits Trend */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Monthly Patient Visits</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyVisits}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Line type="monotone" dataKey="visits" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Purok Distribution */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Patient Distribution by Purok</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={purokData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="patients" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'thesis' && (
              <motion.div 
                key="thesis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto bg-white p-12 rounded-2xl border border-slate-100 shadow-sm"
              >
                <div className="prose prose-slate max-w-none">
                  <Markdown>{THESIS_CHAPTER_1}</Markdown>
                </div>
              </motion.div>
            )}

            {activeTab === 'patients' && (
              <motion.div 
                key="patients"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-slate-900">Patient Records</h2>
                  <div className="flex gap-3">
                    <button 
                      onClick={exportPatientsToCSV}
                      className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Save size={20} />
                      Export CSV
                    </button>
                    <button 
                      onClick={() => { setEditingPatient(null); setShowPatientModal(true); }}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <UserPlus size={20} />
                      Add New Patient
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Age/Sex</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Visit</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPatients.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{p.firstName} {p.lastName}</p>
                            <p className="text-xs text-slate-500">ID: {p.id}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {p.age} yrs / {p.sex}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                              {p.purok}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{p.contact}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{p.lastVisit}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => { setEditingPatient(p); setShowPatientModal(true); }}
                              className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                            >
                              Edit Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'consultations' && (
              <motion.div 
                key="consultations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-slate-900">Consultation Records</h2>
                  <button 
                    onClick={() => setShowConsultationModal(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <ClipboardList size={20} />
                    New Consultation
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chief Complaint</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnosis</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Meds</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {consultations.map((c) => {
                        const patient = patients.find(p => p.id === c.patientId);
                        return (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-900">{patient?.firstName} {patient?.lastName}</p>
                              <p className="text-xs text-slate-500">Patient ID: #{patient?.id}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{c.date}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{c.chiefComplaint}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                                {c.diagnosis}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {c.prescribedMeds.map(med => (
                                  <span key={med} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                    {med}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm">View Record</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-slate-900">Medicine Inventory</h2>
                  <button 
                    onClick={() => { setEditingMedicine(null); setShowMedicineModal(true); }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add Medicine
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredMeds.map((med) => (
                    <div 
                      key={med.id} 
                      onClick={() => { setEditingMedicine(med); setShowMedicineModal(true); }}
                      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                          <Pill size={20} />
                        </div>
                        {med.stock < 100 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2 py-1 rounded">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">{med.name}</h4>
                      <p className="text-xs text-slate-500 mb-4">{med.category}</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{med.stock}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{med.unit}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Exp: {med.expiryDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-slate-100 text-slate-600">
                      <Settings size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
                      <p className="text-slate-500 text-sm">Manage your login credentials and profile information.</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Username</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 transition-all ${
                              usernameAvailable === true ? 'border-emerald-200 focus:ring-emerald-500' : 
                              usernameAvailable === false ? 'border-red-200 focus:ring-red-500' : 
                              'border-slate-200 focus:ring-emerald-500'
                            }`}
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            required
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {checkingUsername && <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />}
                            {usernameAvailable === true && <div className="text-emerald-500"><TrendingUp size={16} /></div>}
                            {usernameAvailable === false && <div className="text-red-500"><AlertCircle size={16} /></div>}
                          </div>
                        </div>
                        {usernameAvailable === false && (
                          <p className="text-[10px] text-red-500 font-medium">This username is already taken.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">New Password (leave blank to keep current)</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="password" 
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                          placeholder="••••••••"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Security Recovery Question</label>
                        <div className="relative">
                          <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="e.g. What is your favorite color?"
                            value={editRecoveryQuestion}
                            onChange={(e) => setEditRecoveryQuestion(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Recovery Answer</label>
                        <div className="relative">
                          <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="Your answer"
                            value={editRecoveryAnswer}
                            onChange={(e) => setEditRecoveryAnswer(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {updateStatus && (
                      <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                        updateStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {updateStatus.type === 'success' ? <TrendingUp size={18} /> : <AlertCircle size={18} />}
                        {updateStatus.message}
                      </div>
                    )}

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={updating || usernameAvailable === false}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                      >
                        {updating ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save size={20} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <PatientModal 
        isOpen={showPatientModal} 
        initialData={editingPatient}
        onClose={() => { setShowPatientModal(false); setEditingPatient(null); }}
        onSave={(patientData) => {
          if (editingPatient) {
            setPatients(prev => prev.map(p => p.id === editingPatient.id ? { ...p, ...patientData, age: Number(patientData.age) } : p));
          } else {
            const newPatient: Patient = {
              ...patientData,
              id: (patients.length + 1).toString(),
              age: Number(patientData.age),
              lastVisit: new Date().toISOString().split('T')[0]
            };
            setPatients(prev => [...prev, newPatient]);
          }
          setShowPatientModal(false);
          setEditingPatient(null);
        }}
      />

      <MedicineModal 
        isOpen={showMedicineModal}
        initialData={editingMedicine}
        onClose={() => { setShowMedicineModal(false); setEditingMedicine(null); }}
        onSave={(medData) => {
          if (editingMedicine) {
            setMeds(prev => prev.map(m => m.id === editingMedicine.id ? { ...m, ...medData, stock: Number(medData.stock) } : m));
          } else {
            const newMed: Medicine = {
              ...medData,
              id: (meds.length + 1).toString(),
              stock: Number(medData.stock)
            };
            setMeds(prev => [...prev, newMed]);
          }
          setShowMedicineModal(false);
          setEditingMedicine(null);
        }}
      />

      <ConsultationModal 
        isOpen={showConsultationModal}
        patients={patients}
        onClose={() => setShowConsultationModal(false)}
        onSave={(consData) => {
          const newCons: Consultation = {
            ...consData,
            id: `c${consultations.length + 1}`,
            date: new Date().toISOString().split('T')[0],
            prescribedMeds: consData.prescribedMeds.split(',').map((m: string) => m.trim()).filter((m: string) => m)
          };
          setConsultations(prev => [newCons, ...prev]);
          setShowConsultationModal(false);
        }}
      />

      <ConfirmModal 
        isOpen={showConfirmSave}
        onClose={() => setShowConfirmSave(false)}
        onConfirm={performUpdateProfile}
        title="Confirm Changes"
        message="Are you sure you want to save these changes to your profile?"
      />
    </div>
  );
}
