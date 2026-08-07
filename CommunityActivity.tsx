'use client';

import {
  Users,
  Store,
  Package,
  MapPin,
  BadgeCheck,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming path
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; // Assuming path
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Assuming path
import Link from 'next/link';

// As per backend integration plan, this type matches the proposed API response.
interface CommunityActivityData {
  stats: {
    members: number;
    stores: number;
    products: number;
    cities: number;
  };
  recent_members: {
    id: number;
    name: string;
    role: 'Seller' | 'Buyer';
    verified: boolean;
    location: string;
    joined: string; // e.g., "2026-07-27"
    avatar: string | null;
  }[];
}

// This function would live in `frontend/src/lib/api.ts`
// For demonstration, it's included here.
async function getCommunityActivity(): Promise<CommunityActivityData> {
  // In a real scenario, this would fetch from your backend.
  // const res = await fetch('/api/community/');
  // if (!res.ok) {
  //   throw new Error('Failed to fetch community data');
  // }
  // return res.json();

  // Returning mock data for demonstration as per prompt's example response.
  // In production, the fetch call above would be used.
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          stats: {
            members: 127,
            stores: 38,
            products: 214,
            cities: 5,
          },
          recent_members: [
            {
              id: 1,
              name: 'Jean Bosco',
              role: 'Seller',
              verified: true,
              location: 'Nairobi',
              joined: '2026-07-27',
              avatar: null,
            },
            {
              id: 2,
              name: 'Aline Gahongayire',
              role: 'Buyer',
              verified: false,
              location: 'Kigali',
              joined: '2026-07-26',
              avatar: 'https://i.pravatar.cc/150?u=aline',
            },
            {
              id: 3,
              name: 'Manasseh Shema',
              role: 'Seller',
              verified: false,
              location: 'Nairobi',
              joined: '2026-07-25',
              avatar: 'https://i.pravatar.cc/150?u=manasseh',
            },
          ],
        }),
      1500
    )
  );
}

// Helper to format join date
function formatJoinDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Joined today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Joined yesterday';
  }
  return `Joined on ${date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })}`;
}

// --- Skeleton Loaders ---

const StatCardSkeleton = () => (
  <Card className="bg-gray-800/50 border-gray-700 animate-pulse">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-6 w-6 bg-gray-700 rounded"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-1/2 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
    </CardContent>
  </Card>
);

const MemberCardSkeleton = () => (
  <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700 animate-pulse">
    <div className="h-12 w-12 rounded-full bg-gray-700"></div>
    <div className="space-y-2 flex-1">
      <div className="h-5 w-3/4 bg-gray-700 rounded"></div>
      <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
    </div>
  </div>
);

// --- Main Component ---

export default function CommunityActivity() {
  const [data, setData] = useState<CommunityActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCommunityActivity()
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        setError('Could not load community activity at this time.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const stats = [
    { icon: Users, label: 'Community Members', value: data?.stats.members },
    { icon: Store, label: 'Registered Stores', value: data?.stats.stores },
    { icon: Package, label: 'Products Listed', value: data?.stats.products },
    { icon: MapPin, label: 'Cities Represented', value: data?.stats.cities },
  ];

  if (error) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 text-white">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-amber-400">{error}</p>
        </div>
      </section>
    );
  }

  if (!isLoading && (!data || !data.recent_members || data.recent_members.length === 0)) {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 text-white">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-amber-400">
                        You're Among the First
                    </h2>
                    <p className="mx-auto max-w-[600px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Welcome to the Nyakizu community. You're one of our founding members.
                    </p>
                </div>
                <div className="mx-auto max-w-sm space-y-2">
                    <ul className="grid gap-2 text-left text-gray-300">
                        <li className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-green-500" /><span>Join today and help shape the marketplace.</span></li>
                        <li className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-green-500" /><span>Be the first to list products and build your store.</span></li>
                        <li className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-green-500" /><span>Invite other trusted traders to grow our network.</span></li>
                    </ul>
                </div>
                <div className="mt-6">
                    <Link href="/register"><Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold">Create Your Free Account</Button></Link>
                </div>
            </div>
        </section>
    );
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 text-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-amber-400">Meet Our Community</h2>
            <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">Join traders who are already building trusted businesses through Nyakizu.</p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 py-12 sm:grid-cols-2 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : stats.map((stat) => (
                <Card key={stat.label} className="bg-gray-800/50 border-gray-700 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">{stat.label}</CardTitle>
                    <stat.icon className="h-5 w-5 text-amber-400" />
                  </CardHeader>
                  <CardContent><div className="text-4xl font-bold text-amber-400">{stat.value?.toLocaleString() ?? '...'}</div></CardContent>
                </Card>
              ))}
        </div>

        <div className="mx-auto max-w-5xl py-12">
            <h3 className="text-2xl font-bold tracking-tighter text-center mb-8">Recently Joined Members</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => <MemberCardSkeleton key={i} />)
                    : data?.recent_members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-amber-400 transition-colors">
                            <Avatar className="h-12 w-12 border-2 border-gray-600"><AvatarImage src={member.avatar ?? undefined} alt={member.name} /><AvatarFallback className="bg-gray-700 text-amber-400"><User className="h-6 w-6" /></AvatarFallback></Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2"><p className="font-semibold text-lg">{member.name}</p>{member.verified && <BadgeCheck className="h-5 w-5 text-blue-500" title="Verified Seller" />}</div>
                                <div className="text-sm text-gray-400 flex items-center gap-4"><span>{member.role}</span><span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {member.location}</span></div>
                                <p className="text-xs text-gray-500 mt-1">{formatJoinDate(member.joined)}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>

        <div className="mt-12 text-center">
            <p className="text-lg text-gray-300 mb-4">Become part of our growing business community.</p>
            <Link href="/register"><Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-lg px-8 py-6">Create Free Account</Button></Link>
        </div>
      </div>
    </section>
  );
}