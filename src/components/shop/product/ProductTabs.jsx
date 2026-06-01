"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Settings, RotateCcw, Zap } from "lucide-react";

export default function ProductTabs({ product }) {
  const [openSection, setOpenSection] = useState("description");

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  console.log(product)

  // Helper function to render spec rows only if they have a value
  const renderSpecRow = (label, value) => {
    if (value === undefined || value === null || value === "" || value === false) return null;
    
    // Convert boolean true to "Yes"
    const displayValue = value === true ? "Yes" : Array.isArray(value) ? value.join(", ") : value;

    return (
      <div className="spec-item" key={label}>
        <span className="spec-label">{label}:</span>
        <span className="spec-value">{displayValue}</span>
      </div>
    );
  };

  const sections = [
    {
      id: "description",
      label: "Description",
      icon: <FileText size={18} />,
      content: <p className="tab-text-content">{product.description}</p>,
    },
    {
      id: "specs",
      label: "Specifications",
      icon: <Settings size={18} />,
      content: (
        <div className="specs-container">
          {product.specifications ? (
            <>
              {/* Basic Section */}
              <div className="spec-group">
                <h4>Basic Details</h4>
                {renderSpecRow("Type", product.specifications.type)}
                {renderSpecRow("Material", product.specifications.material)}
                {renderSpecRow("Weight", product.specifications.weight)}
                {renderSpecRow("Dimensions", product.specifications.dimensions)}
                {renderSpecRow("Finish", product.specifications.finish)}
              </div>

              {/* Performance Section */}
              <div className="spec-group">
                <h4>Performance</h4>
                {renderSpecRow("Insulation", product.specifications.insulation)}
                {renderSpecRow("Hot Retention", product.specifications.hotRetention)}
                {renderSpecRow("Cold Retention", product.specifications.coldRetention)}
                {renderSpecRow("Leakproof", product.specifications.leakproof)}
                {renderSpecRow("Rust Proof", product.specifications.rustProof)}
              </div>

              {/* Personalization Section (Pulled from your existing Schema) */}
              {product.isCustomizable && (
                <div className="spec-group personalization">
                  <h4><Zap size={14} style={{display:'inline', marginRight: '5px'}}/> Personalization</h4>
                  {renderSpecRow("Custom Engraving", true)}
                  {renderSpecRow("Max Characters", product.customizationOptions?.maxChars)}
                  {renderSpecRow("Available Fonts", product.customizationOptions?.allowedFonts)}
                </div>
              )}
            </>
          ) : (
            <p className="tab-text-content">Specifications coming soon.</p>
          )}
        </div>
      ),
    },
    {
      id: "policy",
      label: "Returns & Shipping",
      icon: <RotateCcw size={18} />,
      content: (
        <div className="tab-text-content">
          <p><strong>7-Day Replacement:</strong> Eligible for free replacement if damaged or defective.</p>
          <p style={{ marginTop: '10px' }}><strong>Free Shipping:</strong> Automatically applied on orders above ₹999.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="details-accordion">
      {sections.map((section) => (
        <div key={section.id} className={`accordion-item ${openSection === section.id ? "active" : ""}`}>
          <button className="accordion-header" onClick={() => toggleSection(section.id)}>
            <div className="header-left">
              {section.icon}
              <span>{section.label}</span>
            </div>
            {openSection === section.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <div className="accordion-body">
            <div className="accordion-content-inner">{section.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}