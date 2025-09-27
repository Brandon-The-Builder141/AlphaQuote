import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadDemoData } from './utils/demoData';
import PricingAssistant from './components/PricingAssistant';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Calculator,
  Plus,
  Trash2,
  ArrowLeft,
  DollarSign,
  Square,
  Package
} from 'lucide-react';

// Move RoomCard outside to prevent re-creation on every render
const RoomCard = React.memo(({ room, onUpdate, onRemove, roomCost, isSingle }) => {
  return (
    <motion.div
      className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl space-y-6 border border-slate-800/50 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-heading text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          {isSingle ? 'Project Details' : 'Room/Area Details'}
        </h2>
        <div className="flex items-center space-x-4">
          {roomCost && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold text-lg">${roomCost}</span>
            </div>
          )}
          {!isSingle && (
            <motion.button
              onClick={onRemove}
              className="text-red-400 hover:text-red-300 px-4 py-2 rounded-xl border border-red-400/30 hover:border-red-400 hover:bg-red-400/10 transition-all duration-200 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </motion.button>
          )}
        </div>
      </div>

      {/* Room Name */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300 font-body">
          Room/Area Name
        </label>
        <input
          type="text"
          placeholder="Enter room name (e.g., Master Kitchen, Guest Bathroom)"
          value={room.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-slate-700/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 font-body"
        />
      </div>

      {/* Square Footage */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300 font-body flex items-center gap-2">
          <Square className="w-4 h-4 text-primary" />
          Square Footage
        </label>
        <input
          type="number"
          placeholder="Enter square footage"
          value={room.sqft || ''}
          onChange={(e) => onUpdate({ sqft: parseInt(e.target.value) || 0 })}
          className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-slate-700/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 font-body"
        />
      </div>

      {/* Material Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Material Description
        </label>
        <input
          type="text"
          placeholder="Describe materials needed (e.g., Luxury vinyl plank flooring, Quartz countertops)"
          value={room.material}
          onChange={(e) => onUpdate({ material: e.target.value })}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
        />
      </div>

      {/* Material Cost Per Sq Ft */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Material Cost ($ per sq ft)
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="Enter cost per square foot (e.g., 4.50)"
          value={room.materialCost || ''}
          onChange={(e) => onUpdate({ materialCost: e.target.value })}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
        />
        <PricingAssistant
          materialName={room.material}
          currentPrice={room.materialCost}
          onPriceSelect={(price) => onUpdate({ materialCost: price })}
        />
      </div>

      {/* Labor Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Labor Description
        </label>
        <input
          type="text"
          placeholder="Describe labor required (e.g., Installation, electrical work, plumbing)"
          value={room.labor}
          onChange={(e) => onUpdate({ labor: e.target.value })}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
        />
      </div>

      {/* Labor Hours */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Labor Hours
        </label>
        <input
          type="number"
          step="0.1"
          placeholder="Enter estimated labor hours (e.g., 8.5)"
          value={room.laborHours || ''}
          onChange={(e) => onUpdate({ laborHours: e.target.value })}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Additional Notes
        </label>
        <textarea
          placeholder="Any additional details, special requirements, or notes..."
          value={room.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          rows={3}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none resize-none"
        />
      </div>

      {/* Additional Services */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Additional Services
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={room.demo}
              onChange={(e) => onUpdate({ demo: e.target.checked })}
              className="w-4 h-4 text-neon-blue bg-gray-700 border-gray-600 rounded focus:ring-neon-blue"
            />
            <span className="text-sm">Demolition (+$0.50/sqft)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={room.trim}
              onChange={(e) => onUpdate({ trim: e.target.checked })}
              className="w-4 h-4 text-neon-blue bg-gray-700 border-gray-600 rounded focus:ring-neon-blue"
            />
            <span className="text-sm">Trim Work (+$0.75/sqft)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={room.paint}
              onChange={(e) => onUpdate({ paint: e.target.checked })}
              className="w-4 h-4 text-neon-blue bg-gray-700 border-gray-600 rounded focus:ring-neon-blue"
            />
            <span className="text-sm">Painting (+$1.00/sqft)</span>
          </label>
        </div>
      </div>
    </motion.div>
  );
});

const EstimateForm = () => {
  const navigate = useNavigate();

  // Project info state
  const [projectInfo, setProjectInfo] = useState({
    clientName: '',
    projectDescription: '',
    jobType: 'residential',
    address: '',
    phone: '',
    email: ''
  });

  // Rooms state with stable IDs
  const [rooms, setRooms] = useState([{
    id: 1,
    name: '',
    sqft: 0,
    material: '',
    materialCost: '',
    labor: '',
    laborHours: '',
    notes: '',
    demo: false,
    trim: false,
    paint: false
  }]);

  // Other state
  const [markup, setMarkup] = useState(15);
  const [estimateType, setEstimateType] = useState('detailed');
  const [showEstimate, setShowEstimate] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    recipient: '',
    subject: '',
    message: ''
  });
  const [emailStatus, setEmailStatus] = useState(null);

  const addRoom = () => {
    const newId = Math.max(...rooms.map(r => r.id), 0) + 1;
    setRooms([...rooms, {
      id: newId,
      name: '',
      sqft: 0,
      material: '',
      materialCost: '',
      labor: '',
      laborHours: '',
      notes: '',
      demo: false,
      trim: false,
      paint: false
    }]);
  };

  const updateRoom = (id, updatedData) => {
    setRooms(rooms.map(room => room.id === id ? { ...room, ...updatedData } : room));
  };

  const updateProjectInfo = (field, value) => {
    setProjectInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleLoadDemoData = () => {
    loadDemoData(setProjectInfo, setRooms, setMarkup, setEstimateType);
    setShowEstimate(false); // Reset estimate display
  };

  const removeRoom = (id) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(room => room.id !== id));
    }
  };

  // Removed getMaterialsForRoom function since we're using client-specified materials now

  const calculateRoomCost = (room) => {
    const sqft = room.sqft || 0;
    const materialCostPerSqft = parseFloat(room.materialCost) || 0;
    const laborHours = parseFloat(room.laborHours) || 0;
    const laborRate = 75; // $75/hour default

    const materialTotal = sqft * materialCostPerSqft;
    const laborTotal = laborHours * laborRate;

    // Additional services
    const addOns = (room.demo ? sqft * 0.50 : 0) +
                   (room.trim ? sqft * 0.75 : 0) +
                   (room.paint ? sqft * 1.00 : 0);

    return (materialTotal + laborTotal + addOns).toFixed(2);
  };

  const calculateSubtotal = () => {
    return rooms.reduce((total, room) => {
      return total + parseFloat(calculateRoomCost(room));
    }, 0).toFixed(2);
  };

  const calculateMarkupAmount = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal * (markup / 100)).toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const markupAmount = parseFloat(calculateMarkupAmount());
    return (subtotal + markupAmount).toFixed(2);
  };

  const handleGenerateEstimate = () => {
    setShowEstimate(true);
  };

  const handleViewResults = () => {
    navigate('/estimate-results', {
      state: {
        projectInfo,
        rooms,
        markup,
        estimateType,
        subtotal: calculateSubtotal(),
        markupAmount: calculateMarkupAmount(),
        total: calculateTotal()
      }
    });
  };

  const handleEmailQuote = async () => {
    try {
      setEmailStatus('sending');

      const response = await fetch('http://localhost:3001/api/email-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: emailData.recipient,
          subject: emailData.subject,
          message: emailData.message,
          quoteData: {
            projectInfo,
            rooms,
            markup,
            subtotal: calculateSubtotal(),
            markupAmount: calculateMarkupAmount(),
            total: calculateTotal()
          }
        })
      });

      if (response.ok) {
        setEmailStatus('success');
        setEmailData({ recipient: '', subject: '', message: '' });
        setShowEmailForm(false);

        // Log the action
        // console.log('✅ Quote emailed successfully to:', emailData.recipient);
      } else {
        setEmailStatus('error');
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      setEmailStatus('error');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Get the quote preview element
      const quoteElement = document.getElementById('quote-preview');
      if (!quoteElement) {
        console.error('Quote preview element not found');
        return;
      }

      // Create canvas from the quote element
      const canvas = await html2canvas(quoteElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: quoteElement.scrollWidth,
        height: quoteElement.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit the content
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const projectName = projectInfo.projectName || 'Project';
      const clientName = projectInfo.clientName || 'Client';
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');

      const filename = `AlphaQuote_${projectName}_${clientName}_${date}.pdf`;

      // Download the PDF
      pdf.save(filename);

      // console.log('✅ PDF generated and downloaded:', filename);
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-body overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blueprint Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] animate-pulse"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'%2314B8A6\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")'
          }}
        ></div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto p-8 space-y-8">
        {/* Premium Header */}
        <motion.div
          className="flex justify-between items-center bg-slate-950/80 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors duration-300"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body">Back to Home</span>
            </motion.button>
            <div className="w-px h-6 bg-slate-700"></div>
            <h1 className="text-3xl font-heading text-white flex items-center gap-3">
              <Calculator className="w-8 h-8 text-primary" />
              AlphaQuote Estimator
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/receipts')}
              className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded-lg text-xs transition-colors duration-200"
            >
              📄 Receipts
            </button>
            <button
              onClick={() => navigate('/vendors')}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-xs transition-colors duration-200"
            >
              🏪 Vendors
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-xs transition-colors duration-200"
            >
              📋 Projects
            </button>
          </div>
        </motion.div>

        {/* Project Information */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-neon-blue mb-4">📋 Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Client Name</label>
              <input
                type="text"
                value={projectInfo.clientName}
                onChange={(e) => updateProjectInfo('clientName', e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
              <select
                value={projectInfo.jobType}
                onChange={(e) => updateProjectInfo('jobType', e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Project Description</label>
              <textarea
                value={projectInfo.projectDescription}
                onChange={(e) => updateProjectInfo('projectDescription', e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none resize-none"
                rows={2}
                placeholder="Describe the project..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
              <input
                type="text"
                value={projectInfo.address}
                onChange={(e) => updateProjectInfo('address', e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
                placeholder="Project address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={projectInfo.phone}
                onChange={(e) => updateProjectInfo('phone', e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={projectInfo.email}
                onChange={(e) => updateProjectInfo('email', e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
                placeholder="Email address"
              />
            </div>
          </div>
        </div>

        {/* Rooms */}
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onUpdate={(data) => updateRoom(room.id, data)}
            onRemove={() => removeRoom(room.id)}
            roomCost={calculateRoomCost(room)}
            isSingle={rooms.length === 1}
          />
        ))}

        {/* Add Room Button */}
        <motion.button
          onClick={addRoom}
          className="w-full p-6 border-2 border-dashed border-slate-700/50 rounded-2xl text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 flex items-center justify-center gap-3 font-body"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Add Another Room/Area
        </motion.button>

        {/* Controls */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLoadDemoData}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                🎯 Load Demo Data
              </button>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300">Markup %:</label>
                <input
                  type="number"
                  value={markup}
                  onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                  className="w-20 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none text-center"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Subtotal: <span className="text-white font-semibold">${calculateSubtotal()}</span></div>
                <div className="text-sm text-gray-400">Markup ({markup}%): <span className="text-white font-semibold">${calculateMarkupAmount()}</span></div>
                <div className="text-lg text-neon-blue font-bold">Total: ${calculateTotal()}</div>
              </div>
              <motion.button
                onClick={handleGenerateEstimate}
                className="group relative bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Calculator className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Generate Estimate</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Estimate Results */}
        {showEstimate && (
          <div className="space-y-6">
            {/* Quote Preview */}
            <div id="quote-preview" className="bg-white text-gray-900 p-8 rounded-lg border border-gray-300 shadow-lg">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">🧮 AlphaQuote Estimate</h1>
                <p className="text-gray-600">Professional Construction Estimate</p>
                <p className="text-sm text-gray-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
              </div>

              {/* Project Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">Project Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><strong>Client:</strong> {projectInfo.clientName}</div>
                  <div><strong>Job Type:</strong> {projectInfo.jobType}</div>
                  <div><strong>Project:</strong> {projectInfo.projectDescription}</div>
                  <div><strong>Address:</strong> {projectInfo.address}</div>
                  <div><strong>Phone:</strong> {projectInfo.phone}</div>
                  <div><strong>Email:</strong> {projectInfo.email}</div>
                </div>
              </div>

              {/* Room Details Table */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">Room/Area Details</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-left">Room/Area</th>
                        <th className="border border-gray-300 p-3 text-left">Sq Ft</th>
                        <th className="border border-gray-300 p-3 text-left">Material</th>
                        <th className="border border-gray-300 p-3 text-left">Cost/SqFt</th>
                        <th className="border border-gray-300 p-3 text-left">Labor</th>
                        <th className="border border-gray-300 p-3 text-left">Hours</th>
                        <th className="border border-gray-300 p-3 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room, index) => (
                        <tr key={room.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="border border-gray-300 p-3">{room.name}</td>
                          <td className="border border-gray-300 p-3">{room.sqft}</td>
                          <td className="border border-gray-300 p-3">{room.material}</td>
                          <td className="border border-gray-300 p-3">${room.materialCost}</td>
                          <td className="border border-gray-300 p-3">{room.labor}</td>
                          <td className="border border-gray-300 p-3">{room.laborHours}</td>
                          <td className="border border-gray-300 p-3 font-semibold">${calculateRoomCost(room)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="bg-gray-100 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Cost Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Markup ({markup}%):</span>
                    <span className="font-semibold">${calculateMarkupAmount()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t border-gray-400 pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Thank you for choosing AlphaQuote for your construction needs.</p>
                <p>This estimate is valid for 30 days from the date above.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleViewResults}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                📋 View Detailed Results
              </button>
              <button
                onClick={handleDownloadPDF}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => setShowEmailForm(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                📧 Email Quote
              </button>
            </div>

            {/* Email Status Messages */}
            {emailStatus === 'success' && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                ✅ Quote emailed successfully!
              </div>
            )}
            {emailStatus === 'error' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                ❌ Failed to send email. Please try again.
              </div>
            )}
          </div>
        )}

        {/* Email Form Modal */}
        {showEmailForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-neon-blue mb-4">📧 Email Quote</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Recipient Email</label>
                  <input
                    type="email"
                    value={emailData.recipient}
                    onChange={(e) => setEmailData({...emailData, recipient: e.target.value})}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
                    placeholder="client@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none"
                    placeholder="Construction Estimate - [Project Name]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-neon-blue focus:outline-none resize-none"
                    rows={4}
                    placeholder="Please find attached your detailed construction estimate..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmailQuote}
                  disabled={!emailData.recipient || emailStatus === 'sending'}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  {emailStatus === 'sending' ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimateForm;
