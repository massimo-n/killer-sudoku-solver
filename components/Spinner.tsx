import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center" aria-label="Caricamento in corso">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
};

export default Spinner;
