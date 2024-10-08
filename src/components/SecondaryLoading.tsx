export default function SecondaryLoading() {
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#0077B6] to-[#00B2FF] px-4'>
      <div className='flex flex-col items-center justify-center space-y-4'>
        <div className='relative h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent' />
        <div className='text-2xl font-bold text-white'>Loading...</div>
        <div className='text-lg text-white'>Get ready to crush your goals!</div>
        <div className='text-sm text-white'>Powered by Goal Rush</div>
      </div>
    </div>
  );
}
