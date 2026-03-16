import { create } from 'zustand';

export interface MagazinePlace {
  id: string;
  name: string;
  address: string;
  category: string;
  sub_category: string;
  tags: string[];
  phone: string;
  lat: number;
  lng: number;
}

export interface MagazinePost {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  emoji: string;
  gradient: string;
  accent_color: string;
  cover_image: string;
  author: string;
  tags: string[];
  read_time: string;
  like_count: number;
  is_featured: boolean;
  created_at: string;
  places: MagazinePlace[];
}

interface MagazineState {
  posts: MagazinePost[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  loadPosts: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5분

export const useMagazineStore = create<MagazineState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  loadPosts: async () => {
    const { lastFetchedAt, posts, isLoading } = get();
    if (isLoading) return;
    if (lastFetchedAt && posts.length > 0 && Date.now() - lastFetchedAt < CACHE_DURATION) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/magazine/posts');
      const data = await res.json();
      set({ posts: data.posts ?? [], isLoading: false, lastFetchedAt: Date.now() });
    } catch {
      set({ error: '매거진을 불러오지 못했습니다.', isLoading: false });
    }
  },
}));
