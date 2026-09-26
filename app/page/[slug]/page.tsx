import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Card
} from '@astryxdesign/core';
import { apiFetch, mockPages, type PageData } from '../../utils/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default async function StaticPageDetail({ params }: PageProps) {
  const { slug } = await params;

  // Fetch the page details
  const fallbackPage = mockPages[slug] || mockPages['visi-misi'];
  const page = await apiFetch<PageData>(`/pages/${slug}`, fallbackPage);

  const isVisiMisi = slug === 'visi-misi';
  const isSejarah = slug === 'sejarah-hmps';

  const misiItems = [
    'Menyelenggarakan program kerja yang inovatif, aplikatif, dan mampu mengembangkan keterampilan akademik maupun non-akademik mahasiswa TRPL.',
    'Membangun lingkungan organisasi yang suportif, progresif, dan terbuka terhadap kreativitas serta partisipasi aktif seluruh mahasiswa TRPL.',
    'Mendorong mahasiswa untuk bertransformasi melalui pengembangan potensi, kepemimpinan, kerja sama tim, dan pengalaman organisasi yang berdampak nyata.',
    'Menghadirkan HMPS TRPL yang relevan terhadap perkembangan teknologi serta menjadi wadah aspirasi, kolaborasi, dan kontribusi bagi mahasiswa maupun program studi.'
  ];

  return (
    <div className="flex flex-col min-h-screen bg-body text-primary transition-colors duration-250">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
        <VStack gap={6} align="stretch">
          
          {/* Back link */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-sans text-secondary hover:text-primary transition-colors group decoration-none"
            >
              <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          {/* Header */}
          <VStack gap={4} className="border-b border-border pb-6">
            <HStack gap={2} wrap="wrap">
              <Badge variant="blue" label="Profil Organisasi" />
              {isVisiMisi && <Badge variant="neutral" label="Kabinet Codevolution" />}
              {isSejarah && <Badge variant="neutral" label="Kilas Sejarah" />}
            </HStack>
            <Heading level={1} type="display-2" className="text-primary font-sans leading-tight tracking-tight">
              {page.title}
            </Heading>
            <Text type="supporting" color="secondary" className="text-xs font-sans">
              Terakhir diperbarui &bull; Dilihat {page.views || 0} kali
            </Text>
          </VStack>

          {/* Page Image if available */}
          {page.featured_img && (
            <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden border border-border relative bg-muted/20">
              <img
                src={page.featured_img}
                alt={page.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Dedicated UI for Visi & Misi */}
          {isVisiMisi && (
            <VStack gap={6} align="stretch" className="py-2">
              {/* Slogan Banner */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
                <VStack gap={2} align="start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                      Slogan Kabinet
                    </span>
                    <Badge variant="blue" label="Codevolution" />
                  </div>
                  <blockquote className="text-xl md:text-2xl font-sans font-bold text-primary tracking-tight">
                    &ldquo;Bertransformasi menuju aksi&rdquo;
                  </blockquote>
                  <Text type="body" color="secondary" className="text-xs md:text-sm font-sans mt-1">
                    Semangat transformasi aktif seluruh mahasiswa TRPL untuk berkolaborasi, berinovasi, dan melahirkan aksi nyata yang berdampak langsung bagi perkembangan teknologi.
                  </Text>
                </VStack>
              </div>

              {/* Visi Card */}
              <Card variant="default" padding={6} className="border-l-4 border-l-accent shadow-sm">
                <VStack gap={3} align="start">
                  <div className="flex items-center gap-2">
                    <Badge variant="info" label="Visi Utama" />
                    <span className="text-xs text-secondary font-mono">Pilar Arah Organisasi</span>
                  </div>
                  <Heading level={2} className="text-primary font-sans text-lg md:text-xl mt-1">
                    Visi HMPS TRPL
                  </Heading>
                  <Text type="body" color="secondary" className="font-sans text-sm md:text-base leading-relaxed text-justify">
                    Mewujudkan HMPS TRPL sebagai wadah transformasi mahasiswa yang adaptif, inovatif, dan kolaboratif dalam menciptakan aksi nyata serta karya yang berdampak bagi mahasiswa maupun perkembangan teknologi.
                  </Text>
                </VStack>
              </Card>

              {/* Misi Section */}
              <VStack gap={4} align="stretch" className="mt-2">
                <div className="flex items-center justify-between">
                  <Heading level={2} className="text-primary font-sans text-lg md:text-xl">
                    Misi Strategis
                  </Heading>
                  <Badge variant="neutral" label="4 Butir Misi" />
                </div>
                <div className="grid grid-cols-1 gap-3.5">
                  {misiItems.map((item, idx) => (
                    <Card key={idx} variant="default" padding={5} className="transition-all hover:border-accent/40">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-accent/10 text-accent font-mono font-bold flex items-center justify-center text-sm border border-accent/20">
                          {idx + 1}
                        </div>
                        <Text type="body" color="secondary" className="font-sans text-sm md:text-base leading-relaxed pt-0.5 text-justify">
                          {item}
                        </Text>
                      </div>
                    </Card>
                  ))}
                </div>
              </VStack>
            </VStack>
          )}

          {/* Dedicated UI for Sejarah HMPS */}
          {isSejarah && (
            <VStack gap={6} align="stretch" className="py-2">
              {/* Origin / Awal Mula */}
              <Card variant="default" padding={6} className="shadow-sm">
                <VStack gap={3} align="start">
                  <Badge variant="blue" label="Tahun 2021" />
                  <Heading level={2} className="text-primary font-sans text-lg md:text-xl">
                    Awal Mula Berdirinya Himpunan
                  </Heading>
                  <div className="space-y-3 font-sans text-secondary text-sm md:text-base leading-relaxed text-justify">
                    <p>
                      Himpunan Mahasiswa Program Studi Teknologi Rekayasa Perangkat Lunak Politeknik Negeri Medan (HMPS TRPL) didirikan pada tahun 2021 seiring dengan dibukanya program studi Diploma IV TRPL di bawah naungan Jurusan Teknik Elektro.
                    </p>
                    <p>
                      Pendirian himpunan ini diinisiasi oleh sekelompok mahasiswa angkatan pertama bersama dosen-dosen pembina prodi dengan visi mendirikan sebuah organisasi mahasiswa yang adaptif, inovatif, serta fokus menyalurkan bakat minat mahasiswa di bidang rekayasa perangkat lunak (software engineering).
                    </p>
                  </div>
                </VStack>
              </Card>

              {/* Timeline Perkembangan */}
              <VStack gap={4} align="stretch" className="mt-2">
                <div className="flex items-center justify-between">
                  <Heading level={2} className="text-primary font-sans text-lg md:text-xl">
                    Perkembangan Kepengurusan
                  </Heading>
                  <Badge variant="neutral" label="Milestone Perjalanan" />
                </div>

                <div className="relative pl-6 md:pl-8 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                  {/* Milestone 1 */}
                  <div className="relative">
                    <div className="absolute -left-[19px] md:-left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-accent border-2 border-body" />
                    <Card variant="default" padding={5}>
                      <VStack gap={2} align="start">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-accent">Tahun 2021 - 2022</span>
                          <Badge variant="neutral" label="Fondasi Organisasi" />
                        </div>
                        <Text type="body" color="secondary" className="font-sans text-sm md:text-base leading-relaxed text-justify">
                          Kepengurusan transisi difokuskan pada perumusan Anggaran Dasar &amp; Anggaran Rumah Tangga (AD/ART) serta program pengenalan dasar organisasi bagi mahasiswa angkatan awal.
                        </Text>
                      </VStack>
                    </Card>
                  </div>

                  {/* Milestone 2 */}
                  <div className="relative">
                    <div className="absolute -left-[19px] md:-left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-accent border-2 border-body" />
                    <Card variant="default" padding={5}>
                      <VStack gap={2} align="start">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-accent">Tahun 2023 - 2024</span>
                          <Badge variant="neutral" label="Ekspansi &amp; Kolaborasi" />
                        </div>
                        <Text type="body" color="secondary" className="font-sans text-sm md:text-base leading-relaxed text-justify">
                          HMPS mulai mengadakan kolaborasi eksternal secara aktif, termasuk penyelenggaraan bootcamp pemrograman intensif dan workshop teknologi bekerjasama dengan industri nasional.
                        </Text>
                      </VStack>
                    </Card>
                  </div>

                  {/* Milestone 3 */}
                  <div className="relative">
                    <div className="absolute -left-[19px] md:-left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-accent border-2 border-body" />
                    <Card variant="default" padding={5} className="border-l-4 border-l-accent">
                      <VStack gap={2} align="start">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-accent">Tahun 2024 - Sekarang</span>
                          <Badge variant="blue" label="Era Digitalisasi" />
                        </div>
                        <Text type="body" color="secondary" className="font-sans text-sm md:text-base leading-relaxed text-justify">
                          Digitalisasi administrasi secara penuh, peluncuran situs portal resmi dan platform showcase karya mahasiswa TRPL untuk memperluas kontribusi nyata.
                        </Text>
                      </VStack>
                    </Card>
                  </div>
                </div>
              </VStack>
            </VStack>
          )}

          {/* Fallback parser for any dynamic / other pages */}
          {!isVisiMisi && !isSejarah && (
            <article className="prose dark:prose-invert max-w-none py-4 font-sans text-primary leading-relaxed text-base">
              {page.body
                .replace(/\r\n/g, '\n')
                .split(/\n\s*\n/)
                .map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith('### ')) {
                    const lines = trimmed.split('\n');
                    const headingText = lines[0].replace('### ', '');
                    const restLines = lines.slice(1).join('\n').trim();
                    return (
                      <React.Fragment key={index}>
                        <Heading level={3} className="text-primary font-sans mt-8 mb-4">
                          {headingText}
                        </Heading>
                        {restLines && (
                          <p className="text-secondary font-sans mb-4 text-justify">
                            {renderInlineFormatting(restLines)}
                          </p>
                        )}
                      </React.Fragment>
                    );
                  }

                  if (trimmed.startsWith('## ')) {
                    const lines = trimmed.split('\n');
                    const headingText = lines[0].replace('## ', '');
                    const restLines = lines.slice(1).join('\n').trim();
                    return (
                      <React.Fragment key={index}>
                        <Heading level={2} className="text-primary font-sans mt-8 mb-4">
                          {headingText}
                        </Heading>
                        {restLines && (
                          <p className="text-secondary font-sans mb-4 text-justify">
                            {renderInlineFormatting(restLines)}
                          </p>
                        )}
                      </React.Fragment>
                    );
                  }

                  if (trimmed.startsWith('- ')) {
                    return (
                      <ul key={index} className="list-disc pl-6 mb-4 space-y-1">
                        {trimmed.split('\n').map((item, itemIdx) => (
                          <li key={itemIdx} className="text-secondary font-sans">
                            {renderInlineFormatting(item.replace(/^[-\*]\s*/, ''))}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  if (/^\d+\.\s+/.test(trimmed)) {
                    return (
                      <ol key={index} className="list-decimal pl-6 mb-4 space-y-1">
                        {trimmed.split('\n').map((item, itemIdx) => (
                          <li key={itemIdx} className="text-secondary font-sans">
                            {renderInlineFormatting(item.replace(/^\d+\.\s*/, ''))}
                          </li>
                        ))}
                      </ol>
                    );
                  }

                  return (
                    <p key={index} className="text-secondary font-sans mb-4 text-justify">
                      {renderInlineFormatting(trimmed)}
                    </p>
                  );
                })}
            </article>
          )}

          {/* Bottom Navigation Links */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border mt-6">
            <Link
              href="/"
              className="text-xs font-sans text-secondary hover:text-primary transition-colors flex items-center gap-1 decoration-none"
            >
              &larr; Beranda Utama
            </Link>
            <div className="flex items-center gap-4">
              {isVisiMisi ? (
                <Link
                  href="/page/sejarah-hmps"
                  className="text-xs font-sans font-semibold text-accent hover:text-primary transition-colors decoration-none"
                >
                  Baca Sejarah HMPS &rarr;
                </Link>
              ) : isSejarah ? (
                <Link
                  href="/page/visi-misi"
                  className="text-xs font-sans font-semibold text-accent hover:text-primary transition-colors decoration-none"
                >
                  Lihat Visi &amp; Misi &rarr;
                </Link>
              ) : null}
            </div>
          </div>

        </VStack>
      </main>

      <Footer />
    </div>
  );
}
