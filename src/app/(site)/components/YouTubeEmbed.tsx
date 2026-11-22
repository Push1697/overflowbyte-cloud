'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import type { Video } from '../lib/youtube';

/**
 * Click-to-load YouTube player. Until the reader presses play it is just a
 * thumbnail, so pages stay fast and nothing from YouTube loads or tracks.
 * The player itself comes from youtube-nocookie.com.
 */
export default function YouTubeEmbed({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <figure className="video-embed">
      <div className="video-embed-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="video-embed-poster"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${video.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className="video-embed-play" aria-hidden="true">
              <FontAwesomeIcon icon={faPlay} />
            </span>
          </button>
        )}
      </div>
      <figcaption>
        <FontAwesomeIcon icon={faYoutube} className="fa-ico" style={{ color: '#ff0033' }} />
        <a href={watchUrl} target="_blank" rel="noopener noreferrer">
          {video.title}
        </a>
      </figcaption>
    </figure>
  );
}
