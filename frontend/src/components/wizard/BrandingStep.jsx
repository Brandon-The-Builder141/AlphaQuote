import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Eye,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const BrandingStep = ({ data, onDataChange, onNext, onBack }) => {
  const [brandingData, setBrandingData] = useState(data.brandingData || {
    primaryColor: '#14B8A6',
    secondaryColor: '#0F172A',
    accentColor: '#F97316',
    logoPlacement: 'header',
    reportStyle: 'modern',
    customColors: false
  });

  const [previewColors, setPreviewColors] = useState({
    primary: brandingData.primaryColor,
    secondary: brandingData.secondaryColor,
    accent: brandingData.accentColor
  });

  const presetThemes = [
    {
      name: 'AlphaQuote Default',
      primary: '#14B8A6',
      secondary: '#0F172A',
      accent: '#F97316',
      description: 'Professional teal and orange'
    },
    {
      name: 'Construction Blue',
      primary: '#3B82F6',
      secondary: '#1E293B',
      accent: '#F59E0B',
      description: 'Classic construction colors'
    },
    {
      name: 'Modern Dark',
      primary: '#8B5CF6',
      secondary: '#111827',
      accent: '#10B981',
      description: 'Sleek purple and green'
    },
    {
      name: 'Warm Orange',
      primary: '#F97316',
      secondary: '#1C1917',
      accent: '#EF4444',
      description: 'Bold orange and red'
    }
  ];

  const reportStyles = [
    { id: 'modern', name: 'Modern', description: 'Clean lines, minimal design' },
    { id: 'professional', name: 'Professional', description: 'Corporate look with headers' },
    { id: 'creative', name: 'Creative', description: 'Colorful and dynamic' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and clean' }
  ];

  useEffect(() => {
    onDataChange({ brandingData });
  }, [brandingData, onDataChange]);

  const handleColorChange = (colorType, color) => {
    setBrandingData(prev => ({
      ...prev,
      [colorType]: color,
      customColors: true
    }));
    setPreviewColors(prev => ({
      ...prev,
      [colorType]: color
    }));
  };

  const applyPresetTheme = (theme) => {
    setBrandingData(prev => ({
      ...prev,
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      accentColor: theme.accent,
      customColors: false
    }));
    setPreviewColors({
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent
    });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <motion.div
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Palette className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-heading text-white mb-2">Branding & Style</h2>
        <p className="text-slate-300 font-body">Customize your AlphaQuote experience</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Color Customization */}
        <div className="space-y-6">
          <h3 className="text-xl font-heading text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Brand Colors
          </h3>

          {/* Preset Themes */}
          <div className="space-y-4">
            <h4 className="text-lg font-heading text-white">Quick Themes</h4>
            <div className="grid grid-cols-2 gap-3">
              {presetThemes.map((theme, index) => (
                <motion.button
                  key={theme.name}
                  onClick={() => applyPresetTheme(theme)}
                  className="p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all duration-200 text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.secondary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                  </div>
                  <h5 className="font-heading text-white text-sm">{theme.name}</h5>
                  <p className="text-slate-400 text-xs font-body">{theme.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="space-y-4">
            <h4 className="text-lg font-heading text-white">Custom Colors</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 font-body mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={previewColors.primary}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-slate-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={previewColors.primary}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white font-mono text-sm"
                    placeholder="#14B8A6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 font-body mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={previewColors.secondary}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-slate-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={previewColors.secondary}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white font-mono text-sm"
                    placeholder="#0F172A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 font-body mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={previewColors.accent}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-slate-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={previewColors.accent}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white font-mono text-sm"
                    placeholder="#F97316"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <h3 className="text-xl font-heading text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Live Preview
          </h3>

          {/* Preview Card */}
          <motion.div
            className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
            style={{
              '--preview-primary': previewColors.primary,
              '--preview-secondary': previewColors.secondary,
              '--preview-accent': previewColors.accent
            }}
          >
            <div className="space-y-4">
              {/* Header Preview */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: previewColors.secondary }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: previewColors.primary }}
                    >
                      <span className="text-white text-sm font-bold">AQ</span>
                    </div>
                    <span className="text-white font-heading">AlphaQuote</span>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-body"
                    style={{
                      backgroundColor: previewColors.accent,
                      color: 'white'
                    }}
                  >
                    Online
                  </div>
                </div>
              </div>

              {/* Button Preview */}
              <div className="space-y-3">
                <button
                  className="w-full py-2 px-4 rounded-xl text-white font-body transition-all duration-200"
                  style={{ backgroundColor: previewColors.primary }}
                >
                  Primary Button
                </button>
                <button
                  className="w-full py-2 px-4 rounded-xl border-2 font-body transition-all duration-200"
                  style={{
                    borderColor: previewColors.accent,
                    color: previewColors.accent
                  }}
                >
                  Secondary Button
                </button>
              </div>

              {/* Report Style Selection */}
              <div className="space-y-3">
                <h4 className="text-lg font-heading text-white">Report Style</h4>
                <div className="space-y-2">
                  {reportStyles.map((style) => (
                    <label key={style.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="reportStyle"
                        value={style.id}
                        checked={brandingData.reportStyle === style.id}
                        onChange={(e) => setBrandingData(prev => ({ ...prev, reportStyle: e.target.value }))}
                        className="w-4 h-4 text-primary bg-slate-800 border-slate-600 focus:ring-primary"
                      />
                      <div>
                        <div className="font-body text-white">{style.name}</div>
                        <div className="text-sm text-slate-400 font-body">{style.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-body transition-all duration-200 border border-slate-600/50 hover:border-slate-500"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-xl font-body transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BrandingStep;
