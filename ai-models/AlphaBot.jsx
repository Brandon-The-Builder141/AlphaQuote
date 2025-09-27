import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import getProfileData from './utils/getProfileData';
import streamAlpha from './core/streamAlpha';
import { saveEstimateToMemory } from './core/alphaMemory';
import { demoAIEstimate } from './utils/demoData';

export default function AlphaBot() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    roomType: '',
    squareFootage: '',
    notes: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedEstimate, setStreamedEstimate] = useState("");
  const [showEstimate, setShowEstimate] = useState(false);
  
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          addToChatLog('user', transcript);
          setTranscript('');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, [transcript]);

  const addToChatLog = (sender, message) => {
    setChatLog(prev => [...prev, {
      id: Date.now(),
      sender,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (images.length + validFiles.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSmartEstimate = async () => {
    setIsGenerating(true);
    setShowEstimate(true);
    setStreamedEstimate("");
    
    try {
      // Get user profile data
      const profile = getProfileData();
      
      // Prepare transcript from chat log
      const fullTranscript = chatLog.filter(msg => msg.sender === 'user').map(msg => msg.message).join(' ');
      
      // Call the streaming AI service
      const finalEstimate = await streamAlpha({
        transcript: fullTranscript,
        formData: {
          roomType: formData.roomType,
          squareFootage: formData.squareFootage,
          notes: formData.notes,
        },
        profile,
        onUpdate: (partialResult) => {
          setStreamedEstimate(partialResult);
        },
      });
      
      // Save estimate to memory
      saveEstimateToMemory({
        roomType: formData.roomType || 'Unknown',
        sqft: formData.squareFootage || 'Unknown',
        materialType: 'AI Generated',
        laborType: 'AI Generated',
        markup: profile.markup || 15,
        totalEstimate: 'See AI Estimate Above',
        timestamp: new Date().toISOString(),
        aiResponse: finalEstimate
      });
      
      // Add AI response to chat log
      addToChatLog('assistant', 'I\'ve generated a smart estimate for your project. Check the estimate panel on the right.');
      
    } catch (error) {
      console.error('Error generating smart estimate:', error);
      addToChatLog('assistant', `Sorry, I encountered an error while generating your estimate: ${error.message}`);
      setShowEstimate(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportAIPDF = () => {
    if (!streamedEstimate) {
      alert('Please generate an AI estimate first before exporting.');
      return;
    }

    const profile = getProfileData();
    const doc = new jsPDF();
    
    // Header with business branding
    doc.setFontSize(20);
    doc.setTextColor(0, 212, 255); // neon blue
    doc.text("AI-Powered Professional Estimate", 14, 22);
    
    doc.setTextColor(0, 0, 0); // reset to black
    doc.setFontSize(14);
    doc.text(profile.businessName || "AlphaQuote Professional", 14, 35);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 45);
    doc.text(`Project Type: ${formData.roomType || 'General Project'}`, 14, 52);
    if (formData.squareFootage) {
      doc.text(`Square Footage: ${formData.squareFootage} sqft`, 14, 59);
    }
    
    // Add business contact info if available
    let contactY = 70;
    if (profile.phone) {
      doc.text(`Phone: ${profile.phone}`, 14, contactY);
      contactY += 7;
    }
    if (profile.email) {
      doc.text(`Email: ${profile.email}`, 14, contactY);
      contactY += 7;
    }
    
    // Add separator line
    doc.setDrawColor(0, 212, 255);
    doc.line(14, contactY + 5, 196, contactY + 5);
    
    // Process AI estimate content
    const estimateLines = streamedEstimate.split('\n');
    let currentY = contactY + 15;
    const pageHeight = doc.internal.pageSize.height;
    const marginBottom = 20;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Parse and format the AI estimate
    let inTable = false;
    let tableData = [];
    let currentSection = '';
    
    for (let line of estimateLines) {
      // Check if we need a new page
      if (currentY > pageHeight - marginBottom) {
        doc.addPage();
        currentY = 20;
      }
      
      line = line.trim();
      if (!line) {
        currentY += 4;
        continue;
      }
      
      // Handle markdown-style headers
      if (line.startsWith('# ')) {
        doc.setFontSize(16);
        doc.setTextColor(0, 212, 255);
        doc.text(line.substring(2), 14, currentY);
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        currentY += 12;
      } else if (line.startsWith('## ')) {
        doc.setFontSize(14);
        doc.setTextColor(0, 150, 200);
        doc.text(line.substring(3), 14, currentY);
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        currentY += 10;
        currentSection = line.substring(3);
      } else if (line.startsWith('### ')) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(line.substring(4), 14, currentY);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        currentY += 8;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // Handle bullet points
        const bulletText = line.substring(2);
        const wrappedText = doc.splitTextToSize(bulletText, 170);
        doc.text('•', 14, currentY);
        doc.text(wrappedText, 20, currentY);
        currentY += wrappedText.length * 5;
      } else if (line.includes('$') && (line.includes(':') || line.includes('-'))) {
        // Handle cost lines - try to format as a simple table
        if (!inTable && currentSection.toLowerCase().includes('cost')) {
          inTable = true;
          tableData = [];
        }
        
        if (inTable) {
          const parts = line.split(/[:|-]/);
          if (parts.length >= 2) {
            const description = parts[0].trim().replace(/^\*\*|\*\*$/g, '');
            const amount = parts[1].trim().replace(/^\*\*|\*\*$/g, '');
            tableData.push([description, amount]);
          }
        } else {
          // Regular cost line
          const wrappedText = doc.splitTextToSize(line, 180);
          doc.text(wrappedText, 14, currentY);
          currentY += wrappedText.length * 5;
        }
      } else {
        // Regular text
        if (inTable && tableData.length > 0) {
          // Output accumulated table data
          autoTable(doc, {
            startY: currentY,
            head: [['Description', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [0, 212, 255] },
            margin: { left: 14 }
          });
          currentY = doc.lastAutoTable.finalY + 10;
          inTable = false;
          tableData = [];
        }
        
        const wrappedText = doc.splitTextToSize(line, 180);
        doc.text(wrappedText, 14, currentY);
        currentY += wrappedText.length * 5;
      }
    }
    
    // Output any remaining table data
    if (inTable && tableData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Description', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 212, 255] },
        margin: { left: 14 }
      });
      currentY = doc.lastAutoTable.finalY + 10;
    }
    
    // Add chat context if available
    const userMessages = chatLog.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      // Check if we need a new page
      if (currentY > pageHeight - 100) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(0, 150, 200);
      doc.text('Project Discussion Summary:', 14, currentY);
      currentY += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      userMessages.slice(-3).forEach((msg, index) => { // Last 3 messages
        const wrappedText = doc.splitTextToSize(`• ${msg.message}`, 170);
        doc.text(wrappedText, 14, currentY);
        currentY += wrappedText.length * 4;
      });
    }
    
    // Footer
    const finalPageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by AlphaQuote AI Assistant - Professional Estimation Software', 14, finalPageHeight - 20);
    doc.text(`Contact: ${profile.phone || 'N/A'} | Email: ${profile.email || 'N/A'}`, 14, finalPageHeight - 10);
    
    // Save the PDF
    const fileName = `AlphaQuote_AI_Estimate_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const loadDemoAIEstimate = () => {
    setStreamedEstimate(demoAIEstimate);
    setShowEstimate(true);
    setFormData({
      roomType: 'Kitchen & Bathroom Renovation',
      squareFootage: '400',
      notes: 'Complete renovation with high-end materials and custom features'
    });
    addToChatLog('assistant', 'Demo AI estimate loaded! You can now export it as a PDF to see the formatting.');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-neon-blue hover:text-blue-400 transition-colors duration-200"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-bold text-neon-blue">🤖 AlphaBot AI Assistant</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadDemoAIEstimate}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
            >
              📝 Load Demo AI Estimate
            </button>
            <div className="text-sm text-gray-400">
              AI-Powered Smart Estimates
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          
          {/* Left Panel - Chat & Voice */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-neon-blue mb-2">Voice Input & Chat</h2>
              <div className="flex items-center space-x-4">
                <button
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-neon-blue hover:bg-blue-500'
                  }`}
                >
                  <span className="text-xl">
                    {isListening ? '🔴' : '🎤'}
                  </span>
                  <span>{isListening ? 'Listening...' : 'Hold to Talk'}</span>
                </button>
                {transcript && (
                  <div className="text-sm text-gray-300">
                    "{transcript}"
                  </div>
                )}
              </div>
            </div>

            {/* Chat Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatLog.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-4xl mb-2">🎤</div>
                  <p>Hold the mic button and describe your project</p>
                  <p className="text-sm">"I need to remodel my kitchen, about 200 square feet..."</p>
                </div>
              ) : (
                chatLog.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-neon-blue text-white'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Form & Uploads */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-neon-blue mb-2">Project Details & Images</h2>
            </div>

                         <div className="flex-1 overflow-y-auto p-4 space-y-6">
               
                               {/* AI Estimate Display */}
                {showEstimate && (
                  <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">
                      🤖 AI Generated Estimate {isGenerating && <span className="text-yellow-400">(Live Streaming...)</span>}
                    </h3>
                    <div className="bg-black text-green-400 p-4 font-mono whitespace-pre-wrap rounded-md shadow-md max-h-64 overflow-y-auto">
                      {streamedEstimate || (isGenerating ? "Waiting for estimate..." : "No estimate generated yet")}
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
                      <button
                        onClick={handleExportAIPDF}
                        disabled={!streamedEstimate || isGenerating}
                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                      >
                        <span className="mr-2">📄</span>
                        Export AI Estimate as PDF
                      </button>
                      <button
                        onClick={() => setShowEstimate(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Hide Estimate
                      </button>
                      <button
                        onClick={() => navigate('/estimate')}
                        className="flex-1 bg-neon-blue hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Create Manual Estimate
                      </button>
                    </div>
                  </div>
                )}

               {/* Image Upload */}
               <div>
                 <h3 className="text-md font-medium text-white mb-3">📸 Upload Images (Max 5)</h3>
                 <div className="space-y-3">
                   <input
                     ref={fileInputRef}
                     type="file"
                     multiple
                     accept="image/*"
                     onChange={handleImageUpload}
                     className="hidden"
                   />
                   <button
                     onClick={() => fileInputRef.current?.click()}
                     disabled={images.length >= 5}
                     className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 border border-gray-600 rounded-lg px-4 py-3 transition-colors duration-200"
                   >
                     {images.length >= 5 ? 'Maximum images reached' : 'Choose Images'}
                   </button>
                   
                   {/* Image Previews */}
                   {images.length > 0 && (
                     <div className="grid grid-cols-2 gap-3 mt-3">
                       {images.map((image) => (
                         <div key={image.id} className="relative">
                           <img
                             src={image.preview}
                             alt="Preview"
                             className="w-full h-24 object-cover rounded-lg border border-gray-600"
                           />
                           <button
                             onClick={() => removeImage(image.id)}
                             className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                           >
                             ×
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>

               {/* Short Form */}
               <div className="space-y-4">
                 <h3 className="text-md font-medium text-white">📝 Project Information</h3>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     Room Type
                   </label>
                   <select
                     name="roomType"
                     value={formData.roomType}
                     onChange={handleFormChange}
                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                   >
                     <option value="">Select Room Type</option>
                     <option value="Kitchen">Kitchen</option>
                     <option value="Bathroom">Bathroom</option>
                     <option value="Bedroom">Bedroom</option>
                     <option value="Living Room">Living Room</option>
                     <option value="Basement">Basement</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     Approximate Square Footage
                   </label>
                   <input
                     type="number"
                     name="squareFootage"
                     value={formData.squareFootage}
                     onChange={handleFormChange}
                     placeholder="e.g., 200"
                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     Additional Notes
                   </label>
                   <textarea
                     name="notes"
                     value={formData.notes}
                     onChange={handleFormChange}
                     rows="3"
                     placeholder="Any additional details about your project..."
                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent resize-none"
                   />
                 </div>
               </div>

               {/* Generate Button */}
               <div className="pt-4">
                 <button
                   onClick={generateSmartEstimate}
                   disabled={isGenerating || (chatLog.length === 0 && images.length === 0 && !formData.roomType)}
                   className="w-full bg-gradient-to-r from-neon-blue to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                 >
                   {isGenerating ? (
                     <div className="flex items-center justify-center space-x-2">
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                       <span>Generating Smart Estimate...</span>
                     </div>
                   ) : (
                     <div className="flex items-center justify-center space-x-2">
                       <span>🧠</span>
                       <span>Generate Smart Estimate with AI</span>
                     </div>
                   )}
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
