import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  count?: number;
  variant?: 'text' | 'rectangular' | 'circular' | 'line';
  width?: number | string;
  height?: number | string;
}

const Skeleton = ({
  className = '',
  count = 1,
  variant = 'text',
  width,
  height
}: SkeletonProps) => {
  const baseClasses = "bg-gray-700/50 animate-pulse rounded-md";

  const dimensionValue = (value?: number | string) => {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  };

  const getVariantStyles = () => {
    const widthValue = dimensionValue(width);
    const heightValue = dimensionValue(height);

    if (widthValue || heightValue) {
      return {
        width: widthValue,
        height: heightValue,
      };
    }

    switch (variant) {
      case 'circular':
        return {
          width: '40px',
          height: '40px',
          borderRadius: '50%',
        };
      case 'rectangular':
        return {
          width: '100%',
          height: '80px',
          borderRadius: '8px',
        };
      case 'line':
        return {
          width: '100%',
          height: '16px',
          borderRadius: '4px',
        };
      case 'text':
      default:
        return {
          width: '100%',
          height: '16px',
          borderRadius: '4px',
        };
    }
  };

  const style = getVariantStyles();

  const skeletons = Array(count).fill(null).map((_, index) => {
    const skeletonKey = `skeleton-${index}-${variant}`;
    return (
      <motion.div
        key={skeletonKey}
        className={`${baseClasses} ${className}`}
        style={style}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
      />
    );
  });

  return <>{skeletons}</>;
};

export default Skeleton;
