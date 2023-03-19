import Link from 'next/link';

const Index = () => {
  return (
    <div>
      <p>Convert Bilibili to podcast.</p>
      <p>
        example:{' '}
        <Link href="/api/podcast/bilibili/users/70666/videos">舍长驾到</Link>
      </p>
    </div>
  );
};

export default Index;
