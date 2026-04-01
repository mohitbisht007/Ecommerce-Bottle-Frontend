"use client";
import { Type, Check, Sparkles, AlertCircle } from "lucide-react";

const FONT_OPTIONS = [
  { id: "Modern", name: "Modern Sans", family: "'Inter', sans-serif" },
  { id: "Elegant", name: "Classic Serif", family: "'Playfair Display', serif" },
  { id: "Sport", name: "Athletic Bold", family: "'Anton', sans-serif" },
  { id: "Script", name: "Handwritten", family: "'Dancing Script', cursive" }
];

export default function ProductCustomizer({ 
  customText, 
  setCustomText, 
  selectedFont, 
  setSelectedFont, 
  maxChars = 12 
}) {
  return (
    <div className="customizer-card">
      {/* Header with icon badge */}
      <div className="customizer-header">
        <div className="studio-badge">
          <Sparkles size={14} />
          <span>BouncyBucket Studio</span>
        </div>
        <h3>Personalize Your Bottle</h3>
        <p>Premium laser engraving that never fades.</p>
      </div>

      <div className="customizer-body">
        {/* --- INPUT SECTION --- */}
        <div className="studio-input-group">
          <div className="group-label">
            <span>Engraving Text</span>
            <span className={customText.length >= maxChars ? "limit-reached" : ""}>
              {customText.length} / {maxChars}
            </span>
          </div>
          
          <div className="input-container">
            <input
              type="text"
              placeholder="YOUR NAME..."
              value={customText}
              maxLength={maxChars}
              onChange={(e) => setCustomText(e.target.value.toUpperCase())}
              className="studio-input"
            />
            <div className="input-focus-line"></div>
          </div>
        </div>

        {/* --- FONT SECTION --- */}
        <div className="studio-input-group">
          <div className="group-label">Choose Font Style</div>
          <div className="font-selection-grid">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.id}
                className={`font-chip ${selectedFont === font.family ? "is-selected" : ""}`}
                onClick={() => setSelectedFont(font.family)}
              >
                <span className="font-preview" style={{ fontFamily: font.family }}>
                  {font.id}
                </span>
                {selectedFont === font.family && <Check size={14} className="check-mark" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="customizer-footer">
        <AlertCircle size={14} />
        <span>Personalized items are final sale. +2 days shipping.</span>
      </div>
    </div>
  );
}