const AnimatedRipple = () => {
  return (
    <svg className='w-6 h-6' viewBox='0 0 50 50'>
      <circle
        className='ripple1'
        cx='25'
        cy='25'
        r='0'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <circle
        className='ripple2'
        cx='25'
        cy='25'
        r='0'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <circle
        className='ripple3'
        cx='25'
        cy='25'
        r='0'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      />
    </svg>
  );
};

export default AnimatedRipple;
