import { Suspense } from 'react';
import LoginForm from '@/components/admin/auth/LoginForm';

export const metadata = {
  title: '관리자 로그인 — 펫세권',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-100 mb-4">
            <span className="text-2xl">🐾</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">펫세권 관리자</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 계정으로 로그인하세요</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <Suspense fallback={<div className="h-52 animate-pulse bg-gray-100 rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          관리자 전용 페이지입니다
        </p>
      </div>
    </div>
  );
}
