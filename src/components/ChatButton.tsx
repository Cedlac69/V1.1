import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // TODO: Implement chat functionality
    console.log('Message sent:', message);
    setMessage('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#00a19a] hover:bg-[#008b85] text-white p-4 rounded-full shadow-lg 
                   transition-all duration-200 z-50"
        aria-label="Ouvrir le chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 bg-[#00a19a] text-white flex items-center justify-between">
              <h3 className="font-semibold">Chat Support</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Fermer le chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-96 p-4 overflow-y-auto">
              {/* Messages will be displayed here */}
              <div className="text-center text-gray-500 text-sm">
                Comment pouvons-nous vous aider ?
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-[#00a19a]"
                />
                <button
                  type="submit"
                  className="bg-[#00a19a] hover:bg-[#008b85] text-white px-4 py-2 rounded-lg 
                           transition-colors flex items-center gap-2"
                  disabled={!message.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}