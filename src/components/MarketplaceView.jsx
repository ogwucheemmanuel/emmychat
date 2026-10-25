import React, { useState } from "react";
import { Search, Store, ShoppingBag, Tag, MessageCircle } from "lucide-react";

export default function MarketplaceView({ darkMode }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const items = [
    {
      id: 1,
      title: 'MacBook Pro 16" M1 Max',
      price: "$1,250",
      location: "Lagos, NG",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    },
    {
      id: 2,
      title: "Ergonomic Mechanical Keyboard",
      price: "$120",
      location: "Abuja, NG",
      image:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
    },
    {
      id: 3,
      title: "Sony WH-1000XM4 Headphones",
      price: "$210",
      location: "Port Harcourt, NG",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    },
    {
      id: 4,
      title: 'UltraWide 34" Gaming Monitor',
      price: "$450",
      location: "Lagos, NG",
      image:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Store className="text-emerald-600" /> Marketplace
        </h2>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className={`rounded-2xl overflow-hidden border shadow-sm cursor-pointer group transition-transform hover:scale-[1.01] ${
              darkMode
                ? "bg-gray-900 border-gray-800 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <p className="font-bold text-base text-emerald-600">
                {item.price}
              </p>
              <h3 className="font-medium text-sm truncate mt-0.5">
                {item.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{item.location}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Seller Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl space-y-4 ${
              darkMode
                ? "bg-gray-900 border-gray-800 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <h3 className="text-lg font-bold">Contact Seller</h3>
            <div className="flex gap-3 items-center">
              <img
                src={selectedItem.image}
                alt=""
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <p className="font-semibold text-sm">{selectedItem.title}</p>
                <p className="font-bold text-emerald-600 text-sm">
                  {selectedItem.price}
                </p>
              </div>
            </div>
            <textarea
              placeholder="Hi, is this still available?"
              rows={3}
              className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none text-xs"
            ></textarea>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Message sent to seller!");
                  setSelectedItem(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <MessageCircle size={16} /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
