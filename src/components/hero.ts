import { heroShowcases } from '../data/heroShowcases';
import type { HeroShowcase } from '../data/heroShowcases';
import { currentForwardPlan } from '../data/reports';
import { escapeHtml } from '../utils/dom';

// YouTube IFrame API types
declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

declare namespace YT {
  class Player {
    constructor(id: string | HTMLElement, options?: PlayerOptions);
    pauseVideo(): void;
    getPlayerState(): PlayerState;
  }

  interface PlayerOptions {
    events?: {
      onReady?: (event: { target: Player }) => void;
    };
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }
}

/**
 * Checks if an iframe src is a YouTube URL
 */
function isYouTubeUrl(url: string): boolean {
  return /youtube\.com\/embed|youtu\.be/.test(url);
}

/**
 * Adds YouTube API parameters to a YouTube URL if needed
 */
function addYouTubeApiParams(url: string): string {
  if (!isYouTubeUrl(url)) return url;
  
  const urlObj = new URL(url);
  urlObj.searchParams.set('enablejsapi', '1');
  urlObj.searchParams.set('origin', window.location.origin);
  return urlObj.toString();
}

/**
 * Renders the content for a showcase slide based on its kind
 */
function renderShowcaseContent(showcase: HeroShowcase, index: number): string {
  switch (showcase.kind) {
    case 'image':
      if (!showcase.imageUrl) return '';
      return `
        <div class="bp-hero-image-container">
          <img
            src="${escapeHtml(showcase.imageUrl)}"
            alt="${escapeHtml(showcase.imageAlt ?? '')}"
            class="bp-hero-image rounded"
          />
        </div>
      `;
    case 'iframe':
      if (!showcase.iframeSrc) return '';
      const iframeSrc = isYouTubeUrl(showcase.iframeSrc)
        ? addYouTubeApiParams(showcase.iframeSrc)
        : showcase.iframeSrc;
      const iframeId = `bp-hero-iframe-${index}`;
      return `
        <div class="ratio ratio-16x9">
          <iframe
            id="${iframeId}"
            src="${escapeHtml(iframeSrc)}"
            loading="lazy"
            class="border-0 rounded w-100 h-100"
            allowfullscreen
            ${isYouTubeUrl(showcase.iframeSrc) ? 'data-youtube-iframe="true"' : ''}
          ></iframe>
        </div>
      `;
    case 'video':
      if (!showcase.videoSrc) return '';
      const videoId = `bp-hero-video-${index}`;
      return `
        <div class="ratio ratio-16x9">
          <video id="${videoId}" class="w-100 h-100 rounded" controls preload="metadata">
            <source src="${escapeHtml(showcase.videoSrc)}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      `;
    case 'html':
    default:
      return showcase.html ?? '';
  }
}

/**
 * Hero section component that renders a Bootstrap hero section
 * @param container - The container element to render the hero into
 */
export function renderHero(container: HTMLElement): void {
  const indicators = heroShowcases
    .map(
      (item, index) => `
        <button
          type="button"
          data-bs-target="#bp-hero-carousel"
          data-bs-slide-to="${index}"
          ${index === 0 ? 'class="active" aria-current="true"' : ''}
          aria-label="${escapeHtml(item.title)}"
        ></button>
      `
    )
    .join('');

  const slides = heroShowcases
    .map(
      (item, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}" data-showcase-id="${escapeHtml(item.id)}">
          <div class="bp-hero-slide p-3 p-lg-4 bg-white border rounded-3 shadow-sm">
            <h2 class="h5 mb-2">${escapeHtml(item.title)}</h2>
            <p class="small text-muted mb-3">${escapeHtml(item.summary)}</p>
            ${renderShowcaseContent(item, index)}
            ${
              item.ctaLabel && item.ctaHref
                ? `
                  <div class="mt-3">
                    <a href="${escapeHtml(item.ctaHref)}" class="btn btn-outline-primary btn-sm">
                      ${escapeHtml(item.ctaLabel)}
                    </a>
                  </div>
                `
                : ''
            }
          </div>
        </div>
      `
    )
    .join('');

  container.innerHTML = `
    <section class="hero-section bg-light py-5">
      <div class="container">
        <div class="row align-items-stretch">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">Beyond Prediction: explanatory and transparent data science </h1>
            <p class="lead mb-4">
              Developing explainable, auditable data science methods for Aotearoa New Zealand's environment, health and society.
            </p>
            <p class="small text-muted mb-4">
              Funded through <a href="https://www.mbie.govt.nz/science-and-technology/science-and-innovation/funding-information-and-opportunities/investment-funds/strategic-science-investment-fund" target="_blank" rel="noopener noreferrer" class="text-decoration-underline text-muted">MBIE's Strategic Science Investment Fund (SSIF)</a> as part of the <a href="https://www.mbie.govt.nz/science-and-technology/science-and-innovation/funding-information-and-opportunities/investment-funds/strategic-science-investment-fund/ssif-funded-programmes/data-science-platform" target="_blank" rel="noopener noreferrer" class="text-decoration-underline text-muted">National Data Science Initiative</a>.
            </p>
            <div class="alert alert-primary d-flex flex-wrap align-items-center justify-content-between mb-0" role="alert">
              <div class="me-3">
                <strong>${currentForwardPlan.fromYear}–${currentForwardPlan.toYear} Forward Plan</strong><br />
                <span class="small">Read our current priorities and goals for the coming year.</span>
              </div>
              <a href="/forward-plan.html" class="btn btn-light btn-sm mt-2 mt-md-0">
                View forward plan
            </a>
            </div>
          </div>
          <div class="col-lg-6 d-flex">
            <div id="bp-hero-carousel" class="carousel carousel-dark slide carousel-fade w-100 d-flex flex-column">
              <div class="carousel-indicators">
                ${indicators}
              </div>
              <div class="carousel-inner">
                ${slides}
              </div>
              <button
                class="carousel-control-prev"
                type="button"
                data-bs-target="#bp-hero-carousel"
                data-bs-slide="prev"
              >
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button
                class="carousel-control-next"
                type="button"
                data-bs-target="#bp-hero-carousel"
                data-bs-slide="next"
              >
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Set up video pausing on carousel slide change
  setupCarouselVideoControl();
}

/**
 * Sets up video pausing when carousel slides change
 */
function setupCarouselVideoControl(): void {
  const carousel = document.querySelector<HTMLElement>('#bp-hero-carousel');
  if (!carousel) return;

  // Track YouTube players
  const youtubePlayers = new Map<string, YT.Player>();

  // Load YouTube IFrame API
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Set up callback for when YouTube API is ready
    (window as unknown as { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady = () => {
      initializeYouTubePlayers();
    };
  } else {
    // API already loaded, initialize players
    setTimeout(initializeYouTubePlayers, 100);
  }

  /**
   * Initialize YouTube player instances for all YouTube iframes
   */
  function initializeYouTubePlayers(): void {
    const carouselEl = document.querySelector<HTMLElement>('#bp-hero-carousel');
    if (!carouselEl) return;

    const iframes = carouselEl.querySelectorAll<HTMLIFrameElement>('iframe[data-youtube-iframe="true"]');
    iframes.forEach((iframe) => {
      const iframeId = iframe.id;
      if (!iframeId || youtubePlayers.has(iframeId)) return;

      try {
        const player = new YT.Player(iframeId, {
          events: {
            onReady: () => {
              // Player is ready
            },
          },
        });
        youtubePlayers.set(iframeId, player);
      } catch (error) {
        console.warn('Failed to initialize YouTube player for', iframeId, error);
      }
    });
  }

  /**
   * Pause all videos (both YouTube and HTML5)
   */
  function pauseAllVideos(): void {
    const carouselEl = document.querySelector<HTMLElement>('#bp-hero-carousel');
    if (!carouselEl) return;

    // Pause all YouTube players
    youtubePlayers.forEach((player) => {
      try {
        if (player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING) {
          player.pauseVideo();
        }
      } catch (error) {
        // Player might not be ready yet
      }
    });

    // Pause all HTML5 video elements
    const videos = carouselEl.querySelectorAll<HTMLVideoElement>('video');
    videos.forEach((video) => {
      if (!video.paused) {
        video.pause();
      }
    });
  }

  // Listen to Bootstrap carousel slide events
  carousel.addEventListener('slide.bs.carousel', () => {
    // Pause videos when slide starts changing
    pauseAllVideos();
  });

  carousel.addEventListener('slid.bs.carousel', () => {
    // Also pause after slide completes (in case video started during transition)
    pauseAllVideos();
  });
}
