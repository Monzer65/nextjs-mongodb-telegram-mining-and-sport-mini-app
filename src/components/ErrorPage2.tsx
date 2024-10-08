import Link from "next/link";

export default function ErrorPage2() {
  return (
    <div className='flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-md text-center'>
        <div className='mx-auto h-12 w-12 text-red-500' />
        <h1 className='mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
          Oops, there was an error fetching data!
        </h1>
        <p className='mt-4 text-lg text-muted-foreground'>
          We&apos;re sorry, but an unexpected error occurred while fetching
          data. Please try again later or contact support if the issue persists.
        </p>
        <div className='mt-6'>
          <Link
            href='#'
            className='inline-flex items-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-red-50 shadow-sm transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            prefetch={false}
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
