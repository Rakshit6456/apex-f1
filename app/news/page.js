"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink, Clock, Newspaper, ChevronRight, Rss } from 'lucide-react';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import PageWrapper from '../components/PageWrapper';
import SpotlightCard from '../components/SpotlightCard';

function formatDate(pubDate) {
    if (!pubDate) return '';
    try {
        const date = new Date(pubDate);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

function NewsCardSkeleton() {
    return (
        <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-white/5" />
            <div className="p-6 space-y-3">
                <div className="h-2.5 w-20 bg-white/10 rounded" />
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="h-3 w-full bg-white/5 rounded mt-2" />
                <div className="h-3 w-2/3 bg-white/5 rounded" />
            </div>
        </div>
    );
}

function FeaturedCard({ article }) {
    const [imgError, setImgError] = useState(false);

    return (
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="block group">
            <SpotlightCard className="p-0 overflow-hidden rounded-3xl" spotlightColor="rgba(255, 24, 1, 0.08)">
                <div className="md:flex">
                    {/* Image */}
                    <div className="relative md:w-1/2 h-64 md:h-80 overflow-hidden flex-shrink-0">
                        {article.image && !imgError ? (
                            <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={() => setImgError(true)}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                                <Newspaper size={48} className="text-white/10" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111]/60 hidden md:block" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent md:hidden" />
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                        <div className="flex items-center space-x-3 mb-5">
                            <span className="text-[10px] uppercase tracking-widest text-[#FF1801] font-bold font-condensed border border-[#FF1801]/30 px-2 py-1 rounded-sm bg-[#FF1801]/10">
                                Featured
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-condensed flex items-center gap-1.5">
                                <Clock size={10} />
                                {formatDate(article.pubDate)}
                            </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic font-condensed tracking-tight leading-tight mb-5 group-hover:text-[#FF1801] transition-colors duration-300">
                            {article.title}
                        </h2>

                        {article.description && (
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3">
                                {article.description}
                            </p>
                        )}

                        <div className="flex items-center text-[#FF1801] text-xs font-bold uppercase font-condensed tracking-widest gap-2 group-hover:gap-3 transition-all duration-300">
                            Read Full Story
                            <ChevronRight size={14} />
                        </div>
                    </div>
                </div>
            </SpotlightCard>
        </a>
    );
}

function NewsCard({ article }) {
    const [imgError, setImgError] = useState(false);

    return (
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="block group h-full">
            <SpotlightCard className="p-0 overflow-hidden h-full flex flex-col" spotlightColor="rgba(255, 24, 1, 0.06)">
                {/* Image */}
                <div className="relative w-full h-48 overflow-hidden flex-shrink-0">
                    {article.image && !imgError ? (
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImgError(true)}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                            <Newspaper size={32} className="text-white/10" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="text-[10px] uppercase tracking-widest text-[#FF1801] font-bold font-condensed">
                            {article.category || 'Formula 1'}
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-condensed flex items-center gap-1">
                            <Clock size={9} />
                            {formatDate(article.pubDate)}
                        </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-white uppercase italic font-condensed tracking-tight leading-snug mb-3 group-hover:text-[#FF1801] transition-colors duration-300 line-clamp-3 flex-1">
                        {article.title}
                    </h3>

                    {article.description && (
                        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
                            {article.description}
                        </p>
                    )}

                    <div className="flex items-center text-[10px] text-[#FF1801] font-bold uppercase font-condensed tracking-widest gap-1.5 group-hover:gap-2.5 transition-all duration-300 mt-auto pt-2 border-t border-white/5">
                        Read More
                        <ExternalLink size={10} />
                    </div>
                </div>
            </SpotlightCard>
        </a>
    );
}

export default function NewsPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('/api/news')
            .then(res => res.json())
            .then(data => {
                setArticles(data.articles || []);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, []);

    const featured = articles[0];
    const rest = articles.slice(1);

    return (
        <main className="bg-[#0A0A0A] min-h-screen text-white font-sans selection:bg-[#FF1801]">
            <Navbar />
            <PageWrapper>
                <PageHeader
                    title="Latest"
                    subtitle="News"
                    eyebrow="F1 Paddock Coverage"
                    watermark="NEWS"
                    description="Breaking stories, race reports, and insights from the Formula 1 paddock — updated every 30 minutes."
                />

                <section className="bg-[#0A0A0A] py-12 md:py-20 px-6 md:px-12">
                    <div className="container-custom">

                        {/* Loading skeletons */}
                        {loading && (
                            <>
                                <div className="mb-10 animate-pulse">
                                    <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden md:flex" style={{ minHeight: '20rem' }}>
                                        <div className="md:w-1/2 h-64 md:h-auto bg-white/5" />
                                        <div className="p-12 md:w-1/2 space-y-4">
                                            <div className="h-3 w-24 bg-white/10 rounded" />
                                            <div className="h-8 bg-white/10 rounded" />
                                            <div className="h-8 w-3/4 bg-white/10 rounded" />
                                            <div className="h-3 w-full bg-white/5 rounded mt-4" />
                                            <div className="h-3 w-2/3 bg-white/5 rounded" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
                                </div>
                            </>
                        )}

                        {/* Error state */}
                        {!loading && error && (
                            <div className="text-center py-32">
                                <div className="text-[8rem] font-condensed font-black italic text-white/[0.03] leading-none mb-6">OFFLINE</div>
                                <p className="text-gray-500 text-sm uppercase tracking-widest font-condensed">Could not load news. Please try again later.</p>
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && !error && articles.length === 0 && (
                            <div className="text-center py-32">
                                <div className="text-[8rem] font-condensed font-black italic text-white/[0.03] leading-none mb-6">NO NEWS</div>
                                <p className="text-gray-500 text-sm uppercase tracking-widest font-condensed">No articles available right now.</p>
                            </div>
                        )}

                        {/* Content */}
                        {!loading && !error && articles.length > 0 && (
                            <>
                                {/* Featured article */}
                                {featured && (
                                    <div className="mb-12">
                                        <FeaturedCard article={featured} />
                                    </div>
                                )}

                                {/* Section label */}
                                {rest.length > 0 && (
                                    <div className="flex items-center space-x-4 mb-8">
                                        <div className="w-8 md:w-12 h-[1px] bg-[#FF1801]" />
                                        <span className="text-[#FF1801] uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold font-condensed flex items-center gap-2">
                                            <Rss size={10} />
                                            All Stories
                                        </span>
                                    </div>
                                )}

                                {/* Articles grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {rest.map((article, i) => (
                                        <NewsCard key={i} article={article} />
                                    ))}
                                </div>

                                {/* Footer source credit */}
                                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-600 text-[10px] uppercase tracking-widest font-condensed">
                                        <Rss size={10} />
                                        Source: BBC Sport F1
                                    </div>
                                    <div className="text-gray-600 text-[10px] uppercase tracking-widest font-condensed">
                                        Updated every 30 min
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </section>
            </PageWrapper>
        </main>
    );
}
