'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    HStack,
    VStack,
    Heading,
    Text,
    Badge,
    Card,
    Button
} from '@astryxdesign/core';
import {
    FaYoutube,
    FaPlay
} from 'react-icons/fa6';
import {
    FiExternalLink,
    FiEye,
    FiCalendar,
    FiSearch
} from 'react-icons/fi';
import {
    type YouTubeVideo,
    type YouTubeChannelInfo,
    DEFAULT_HANDLE,
    DEFAULT_CHANNEL_NAME
} from '../utils/youtube';

interface VideoClientProps {
    initialVideos: YouTubeVideo[];
    channel?: YouTubeChannelInfo;
}

const CATEGORY_LABELS: Record<string, string> = {
    all: 'Semua Video',
    workshop: 'Workshop & Series',
    webinar: 'Webinar & Talkshow',
    event: 'Event & Turnamen',
    general: 'Video Lainnya',
};

export default function VideoClient({ initialVideos, channel }: VideoClientProps) {
    const channelInfo: YouTubeChannelInfo = channel || {
        id: '',
        name: DEFAULT_CHANNEL_NAME,
        handle: DEFAULT_HANDLE,
        url: `https://www.youtube.com/${DEFAULT_HANDLE}`,
        subscribeUrl: `https://www.youtube.com/${DEFAULT_HANDLE}?sub_confirmation=1`
    };

    const [videos] = useState<YouTubeVideo[]>(initialVideos);
    const [activeVideo, setActiveVideo] = useState<YouTubeVideo>(initialVideos[0] || null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFullDesc, setShowFullDesc] = useState(false);

    const availableCategories = ['all', ...Array.from(new Set(videos.map(v => v.category).filter(Boolean)))];

    const playerSectionRef = useRef<HTMLDivElement>(null);

    const handleSelectVideo = (video: YouTubeVideo) => {
        setActiveVideo(video);
        setShowFullDesc(false);
        if (playerSectionRef.current) {
            playerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const filteredVideos = videos.filter((v) => {
        const matchesCategory =
            selectedCategory === 'all' || v.category === selectedCategory;
        const matchesSearch =
            v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const formatDate = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        } catch {
            return isoString;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-body text-primary transition-colors duration-250">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <VStack gap={8} align="stretch">
                    {/* Channel Header Banner */}
                    <div className="relative rounded-3xl overflow-hidden border border-border bg-surface p-6 sm:p-8 shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-accent/5 to-transparent pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-border bg-surface shadow-md flex-shrink-0">
                                    <Image
                                        src="/hmpstrpl.webp"
                                        alt="Logo HMPS TRPL"
                                        fill
                                        sizes="96px"
                                        className="object-contain p-2"
                                        priority
                                    />
                                </div>

                                <VStack gap={1.5} align="stretch">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <Heading level={1} className="text-2xl sm:text-3xl font-bold font-sans text-primary">
                                            {channelInfo.name}
                                        </Heading>
                                        <Badge variant="red" label="YouTube Resmi" />
                                    </div>
                                    <Text type="body" color="secondary" className="font-sans text-sm">
                                        {channelInfo.handle} • Official Media &amp; Learning Hub TRPL Polmed
                                    </Text>
                                    <Text type="supporting" color="secondary" className="font-sans text-xs max-w-xl">
                                        Kanal video resmi HMPS TRPL membagikan rekaman workshop software &amp; game development, webinar teknologi, serta dokumentasi kegiatan mahasiswa.
                                    </Text>
                                </VStack>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <a
                                    href={channelInfo.subscribeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm cursor-pointer no-underline active:scale-95 font-sans"
                                >
                                    <FaYoutube className="text-lg" />
                                    <span>Subscribe</span>
                                </a>
                                <a
                                    href={channelInfo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-surface border border-border text-primary hover:bg-muted/40 transition-all cursor-pointer no-underline font-sans"
                                >
                                    <span>Buka Channel</span>
                                    <FiExternalLink className="text-xs text-secondary" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Active Embedded Player Section */}
                    {activeVideo && (
                        <div ref={playerSectionRef} className="scroll-mt-24">
                            <Card variant="default" padding={6} className="rounded-3xl border border-border bg-surface shadow-md">
                                <VStack gap={5} align="stretch">
                                    {/* 16:9 Responsive Video Embed */}
                                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-border">
                                        <iframe
                                            key={activeVideo.id}
                                            src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                                            title={activeVideo.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            className="absolute inset-0 w-full h-full border-0"
                                        />
                                    </div>

                                    {/* Video Meta Info */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-2">
                                        <VStack gap={2} align="stretch" className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-2.5 w-2.5 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                </span>
                                                <span className="text-xs font-semibold text-red-500 font-sans tracking-wide uppercase">
                                                    Sedang Diputar
                                                </span>
                                                <span className="text-xs text-secondary">•</span>
                                                <Badge
                                                    variant={activeVideo.category === 'workshop' ? 'blue' : activeVideo.category === 'webinar' ? 'purple' : 'neutral'}
                                                    label={CATEGORY_LABELS[activeVideo.category] || activeVideo.category}
                                                />
                                            </div>

                                            <Heading level={2} className="text-xl sm:text-2xl font-bold font-sans text-primary leading-snug">
                                                {activeVideo.title}
                                            </Heading>

                                            <HStack gap={4} wrap="wrap" className="text-xs text-secondary font-sans">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FiCalendar className="text-accent" />
                                                    {formatDate(activeVideo.publishedAt)}
                                                </span>
                                                {activeVideo.views > 0 && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <FiEye className="text-accent" />
                                                        {activeVideo.views.toLocaleString('id-ID')} views
                                                    </span>
                                                )}
                                            </HStack>
                                        </VStack>

                                        <a
                                            href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-primary hover:bg-muted/40 transition-colors self-start cursor-pointer no-underline font-sans"
                                        >
                                            <FaYoutube className="text-red-500 text-sm" />
                                            <span>Tonton di YouTube</span>
                                            <FiExternalLink className="text-xs text-secondary" />
                                        </a>
                                    </div>

                                    {/* Description Accordion */}
                                    {activeVideo.description && (
                                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/60">
                                            <Text
                                                type="supporting"
                                                className={`font-sans text-xs leading-relaxed text-secondary ${!showFullDesc ? 'line-clamp-2' : ''
                                                    }`}
                                            >
                                                {activeVideo.description}
                                            </Text>
                                            {activeVideo.description.length > 140 && (
                                                <button
                                                    onClick={() => setShowFullDesc((prev) => !prev)}
                                                    className="mt-2 text-xs font-semibold text-accent hover:underline bg-transparent border-0 p-0 cursor-pointer font-sans"
                                                >
                                                    {showFullDesc ? 'Sembunyikan' : 'Baca selengkapnya...'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </VStack>
                            </Card>
                        </div>
                    )}

                    {/* Filter & Search Toolbar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-6">
                        <HStack gap={2} wrap="wrap">
                            {availableCategories.map((cat) => {
                                const count = cat === 'all' ? videos.length : videos.filter((v) => v.category === cat).length;
                                const label = CATEGORY_LABELS[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
                                const isActive = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer font-sans ${
                                            isActive
                                                ? 'bg-accent text-on-accent shadow-sm'
                                                : 'bg-surface border border-border text-secondary hover:text-primary hover:bg-muted/30'
                                        }`}
                                    >
                                        {label} ({count})
                                    </button>
                                );
                            })}
                        </HStack>

                        <div className="relative min-w-[240px] sm:w-72">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-sm pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari judul video..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-surface border border-border text-primary placeholder:text-secondary/60 focus:outline-none focus:border-accent font-sans transition-colors"
                            />
                        </div>
                    </div>

                    {/* Video Grid */}
                    {filteredVideos.length === 0 ? (
                        <div className="text-center py-16 bg-surface border border-dashed border-border rounded-2xl">
                            <Text type="body" color="secondary" className="font-sans">
                                Tidak ada video yang cocok dengan pencarian Anda.
                            </Text>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVideos.map((video) => {
                                const isCurrent = activeVideo?.id === video.id;
                                return (
                                    <div
                                        key={video.id}
                                        onClick={() => handleSelectVideo(video)}
                                        className={`group flex flex-col justify-between rounded-2xl overflow-hidden border bg-surface transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:border-accent/50 ${isCurrent ? 'ring-2 ring-accent border-accent' : 'border-border'
                                            }`}
                                    >
                                        <VStack gap={0} align="stretch">
                                            {/* Thumbnail with hover play overlay */}
                                            <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
                                                <Image
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                                        <FaPlay className="text-sm ml-0.5" />
                                                    </div>
                                                </div>

                                                {isCurrent && (
                                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider font-sans">
                                                        Sedang Diputar
                                                    </div>
                                                )}

                                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs font-sans">
                                                    {video.category === 'workshop' ? 'Series' : 'Video'}
                                                </div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-4 flex flex-col justify-between flex-1">
                                                <VStack gap={2} align="stretch">
                                                    <Text
                                                        type="body"
                                                        weight="bold"
                                                        className="font-sans text-sm line-clamp-2 text-primary group-hover:text-accent transition-colors leading-snug"
                                                    >
                                                        {video.title}
                                                    </Text>

                                                    <Text
                                                        type="supporting"
                                                        color="secondary"
                                                        className="font-sans text-xs line-clamp-2"
                                                    >
                                                        {video.description || 'Tonton video selengkapnya di channel HMPS TRPL POLMED.'}
                                                    </Text>
                                                </VStack>

                                                <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/60 text-[11px] text-secondary font-sans">
                                                    <span className="inline-flex items-center gap-1">
                                                        <FiCalendar />
                                                        {formatDate(video.publishedAt)}
                                                    </span>
                                                    {video.views > 0 && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <FiEye />
                                                            {video.views} views
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </VStack>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </VStack>
            </main>

            <Footer />
        </div>
    );
}
