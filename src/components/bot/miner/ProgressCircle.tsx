const ProgressCircle = ({ progress }: { progress: number }) => {
  const radius = 88;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg className='w-full h-full transform -rotate-90'>
      <circle
        className='text-muted-foreground'
        strokeWidth='8'
        stroke='currentColor'
        fill='transparent'
        r={radius}
        cx='96'
        cy='96'
      />
      <circle
        className='text-primary'
        strokeWidth='8'
        strokeDasharray={circumference}
        strokeDashoffset={circumference * ((100 - progress) / 100)}
        strokeLinecap='round'
        stroke='currentColor'
        fill='transparent'
        r={radius}
        cx='96'
        cy='96'
      />
    </svg>
  );
};

export default ProgressCircle;
