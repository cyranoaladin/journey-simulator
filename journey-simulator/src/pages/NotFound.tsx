import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md"
      >
        {/* Glitch number */}
        <motion.p 
          className="text-[120px] font-display font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-gold-300 to-gold-500 opacity-30 select-none mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          404
        </motion.p>
        <h1 className="text-2xl font-display font-bold text-ink-50 mb-3">
          Protocol Not Found
        </h1>
        <p className="text-sm text-ink-400 mb-8 leading-relaxed">
          This address does not exist in the MFAI protocol.
          Return to dashboard to continue your journey.
        </p>
        <div className="flex gap-3 justify-center">
          <Button 
            variant="gold" 
            leftIcon={<Home size={14} />} 
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            leftIcon={<ArrowLeft size={14} />} 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFound;
