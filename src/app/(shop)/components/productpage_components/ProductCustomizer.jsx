"use client";
import { Check, Sparkles, AlertCircle, Maximize2, MoveHorizontal, MoveVertical } from "lucide-react";

const FONT_OPTIONS = [
  { id: "Bold", name: "Heavy Sans", family: "'Anton', sans-serif" }, // Extremely Bold
  { id: "Cursive", name: "Pure Script", family: "'Great Vibes', cursive" }, // Flowy Cursive
  { id: "Modern", name: "Minimalist", family: "'Montserrat', sans-serif" }, // Clean Modern
  { id: "Classic", name: "Serif Luxury", family: "'Playfair Display', serif" }, // Elegant
  { id: "Art", name: "Brush Style", family: "'Alex Brush', cursive" } // Hand-drawn
];

const SIZE_OPTIONS = [
  { id: "1inch", label: "1\" Small" },
  { id: "2inch", label: "2\" Standard" },
  { id: "3inch", label: "3\" Bold" }
];

export default function ProductCustomizer({
  customText,
  setCustomText,
  selectedFont,
  setSelectedFont,
  orientation,
  setOrientation,
  engravingSize,
  setEngravingSize,
  currentCapacity = "750ml" // Pass this from the selected variant
}) {

  // Logic mapping for character limits based on your specs
  const getLimit = () => {
    const caps = currentCapacity?.toLowerCase();
    if (orientation === "vertical") {
      if (caps.includes("500")) return 8;
      if (caps.includes("750")) return 10;
      return 12; // 1 Litre
    } else {
      if (caps.includes("500")) return 12;
      if (caps.includes("750")) return 15;
      return 15; // 1 Litre
    }
  };

  const maxChars = getLimit();

  return (
    <div className="customizer-card">
      <div className="customizer-header">
        <div className="studio-badge">
          <Sparkles size={14} />
          <span>BouncyBucket Studio</span>
        </div>
        <h3>Personalize Your Bottle</h3>
        <p>Premium laser engraving for {currentCapacity} variant.</p>
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

        {/* --- ORIENTATION & SIZE SECTION --- */}
        <div className="studio-grid-row">
          <div className="studio-input-group">
            <div className="group-label">Alignment</div>
            <div className="customization-selector">
              <button
                className={`mode-btn ${orientation === 'horizontal' ? 'active' : ''}`}
                onClick={() => setOrientation('horizontal')}
              >
                <MoveHorizontal size={16} /> <span>Horizontal</span>
              </button>
              <button
                className={`mode-btn ${orientation === 'vertical' ? 'active' : ''}`}
                onClick={() => {
                  setOrientation('vertical');
                  // Calculate the limit for the new orientation immediately
                  const limit = currentCapacity?.includes("500") ? 8 : (currentCapacity?.includes("750") ? 10 : 12);
                  if (customText.length > limit) {
                    setCustomText(customText.substring(0, limit));
                  }
                }}
              >
                <MoveVertical size={16} /> <span>Vertical</span>
              </button>
            </div>
          </div>
        </div>

        <div className="studio-input-group">
          <div className="group-label">Print Size</div>
          <div className="customization-selector">
            {SIZE_OPTIONS.map(size => (
              <button
                key={size.id}
                className={`mode-btn ${engravingSize === size.id ? 'active' : ''}`}
                onClick={() => setEngravingSize(size.id)}
              >
                {size.label}
              </button>
            ))}
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
                  Abc
                </span>
                <span className="font-name-label">{font.name}</span>
                {selectedFont === font.family && <div className="check-dot"><Check size={10} color="white" /></div>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="customizer-footer">
        <AlertCircle size={14} />
        <span>Physical print size: {orientation === 'horizontal' ? 'Max 1.5cm height' : 'Max 2cm width'}</span>
      </div>
    </div>
  );
}