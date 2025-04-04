import { motion } from 'framer-motion';

export function CatImage() {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <img
        src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=faces&auto=format&q=80"
        alt="Cute cat"
        className="w-24 h-24 rounded-full shadow-lg border-4 border-white"
      />
    </motion.div>
  );
}