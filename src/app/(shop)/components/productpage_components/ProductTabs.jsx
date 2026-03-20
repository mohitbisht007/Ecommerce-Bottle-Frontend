export default function ProductTabs({ activeTab, setActiveTab, product }) {
  return (
    <div className="details-tabs">
      <div className="tab-headers">
        <button
          className={activeTab === "description" ? "active" : ""}
          onClick={() => setActiveTab("description")}
        >
          Description
        </button>
        <button
          className={activeTab === "shipping" ? "active" : ""}
          onClick={() => setActiveTab("shipping")}
        >
          Policy
        </button>
      </div>

      <div className="tab-body">
        {activeTab === "description" ? (
          <p>{product.description}</p>
        ) : (
          <p>
            Free shipping on orders above ₹999. 7-day return policy available.
          </p>
        )}
      </div>
    </div>
  );
}