'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Place, BlogReview } from '@/types';
import { SkeletonBox } from '@/components/ui/Skeleton';
import { fetchReviews, createReview } from '@/lib/api';

export default function BlogReviewSection({ place }: { place: Place }) {
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<BlogReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchReviews(place.id)
      .then((data) => { if (!cancelled) { setReviews(data); setIsLoading(false); } })
      .catch(() => { if (!cancelled) { setReviews([]); setIsLoading(false); } });
    return () => { cancelled = true; };
  }, [place.id]);

  const resetForm = useCallback(() => { setAuthor(''); setSummary(''); setContent(''); setSubmitError(null); }, []);

  const handleSubmit = useCallback(async () => {
    if (!summary.trim() || !content.trim() || !author.trim()) { setSubmitError('모든 항목을 입력해주세요.'); return; }
    if (summary.trim().length > 100) { setSubmitError('제목은 100자 이내로 작성해주세요.'); return; }
    if (content.trim().length > 2000) { setSubmitError('내용은 2000자 이내로 작성해주세요.'); return; }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const newReview = await createReview(place.id, { summary: summary.trim(), content: content.trim(), author: author.trim() });
      setReviews((prev) => [newReview, ...prev]);
      setShowForm(false);
      resetForm();
    } catch {
      setSubmitError('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [place.id, summary, content, author, resetForm]);

  const canSubmit = summary.trim() && content.trim() && author.trim() && !isSubmitting;

  return (
    <div>
      <h3 className="font-bold text-[15px] text-warm-900 mb-3 flex items-center gap-2">
        <span className="text-lg">📝</span>블로그 후기
        {!isLoading && <span className="text-xs text-warm-300 font-normal ml-auto">{reviews.length}건</span>}
      </h3>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (<div key={i} className="border border-warm-50 rounded-xl p-3.5"><SkeletonBox className="w-3/4 h-4 mb-2" /><SkeletonBox className="w-full h-3 mb-1.5" /><SkeletonBox className="w-2/3 h-3" /></div>))}
        </div>
      ) : reviews.length === 0 && !showForm ? (
        <div className="bg-warm-50 rounded-xl p-8 text-center border border-warm-50">
          <span className="text-3xl block mb-2">📭</span>
          <p className="text-sm text-warm-500 font-medium">아직 후기가 없습니다</p>
          <p className="text-xs text-warm-300 mt-1">첫 번째 후기를 남겨주세요!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {reviews.map((review) => {
            const hasLink = review.source_url && review.source_url !== '#';
            const reviewContent = (
              <>
                <p className="font-semibold text-[13px] text-warm-900 mb-1.5 line-clamp-1">{review.summary}</p>
                <p className="text-xs text-warm-500 line-clamp-2 leading-relaxed">{review.content}</p>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-warm-50">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${review.source === '네이버블로그' ? 'bg-green-50 text-green-600 border border-green-100' : review.source === '사용자 리뷰' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>{review.source}</span>
                    <span className="text-[11px] text-warm-400">{review.author}</span>
                  </div>
                  <span className="text-[11px] text-warm-300">{review.date}</span>
                </div>
              </>
            );
            return hasLink ? (
              <a key={review.id} href={review.source_url} target="_blank" rel="noopener noreferrer" className="block bg-warm-50 rounded-xl p-3.5 hover:bg-warm-100 transition-colors">{reviewContent}</a>
            ) : (
              <div key={review.id} className="bg-warm-50 rounded-xl p-3.5">{reviewContent}</div>
            );
          })}
        </div>
      )}
      {showForm && (
        <div className="mt-4 bg-warm-50 rounded-2xl p-4 border border-warm-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-warm-900">리뷰 작성</h4>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="w-8 h-8 flex items-center justify-center text-warm-300 hover:text-warm-500 rounded-full hover:bg-warm-100 transition-colors" aria-label="닫기"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
          <div className="flex flex-col gap-3">
            <div><label htmlFor="review-author" className="block text-xs font-semibold text-warm-500 mb-1">닉네임</label><input id="review-author" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="닉네임을 입력하세요" maxLength={30} className="w-full text-sm bg-surface rounded-lg px-3 py-2.5 border border-warm-100 focus:border-primary focus:outline-none transition-colors placeholder:text-warm-300" /></div>
            <div><label htmlFor="review-summary" className="block text-xs font-semibold text-warm-500 mb-1">제목</label><input id="review-summary" type="text" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="한 줄 요약" maxLength={100} className="w-full text-sm bg-surface rounded-lg px-3 py-2.5 border border-warm-100 focus:border-primary focus:outline-none transition-colors placeholder:text-warm-300" /></div>
            <div><label htmlFor="review-content" className="block text-xs font-semibold text-warm-500 mb-1">내용 <span className="text-warm-300 font-normal ml-1">{content.length}/2000</span></label><textarea id="review-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="방문 후기를 자유롭게 작성해주세요" maxLength={2000} rows={4} className="w-full text-sm bg-surface rounded-lg px-3 py-2.5 border border-warm-100 focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-warm-300" /></div>
          </div>
          {submitError && <p className="text-xs text-accent-rose mt-2">{submitError}</p>}
          <button onClick={handleSubmit} disabled={!canSubmit} className={`w-full mt-3 py-3 rounded-xl text-sm font-bold transition-colors ${canSubmit ? 'bg-primary text-white hover:bg-primary/90 press-scale' : 'bg-warm-200 text-warm-400 cursor-not-allowed'}`}>{isSubmitting ? '등록 중...' : '리뷰 등록'}</button>
        </div>
      )}
      {!showForm && !isLoading && (
        <button onClick={() => { setShowForm(true); setSubmitError(null); }} className="w-full mt-4 py-3 bg-surface border-2 border-dashed border-warm-200 rounded-xl text-sm font-semibold text-warm-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors press-scale flex items-center justify-center gap-2">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>리뷰 작성하기
        </button>
      )}
    </div>
  );
}
