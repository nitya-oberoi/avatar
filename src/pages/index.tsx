import Head from 'next/head';
import { CreatorScreen } from '@/features/avatar/components/CreatorScreen';

export default function Home() {
  return (
    <>
      <Head>
        <title>AvatarVerse — Avatar Creator</title>
        <meta name="description" content="Create your unique avatar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <CreatorScreen />
    </>
  );
}
