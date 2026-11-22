import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import YouTubeEmbed from './YouTubeEmbed';
import { YOUTUBE_CHANNEL, type Video } from '../lib/youtube';

/** "Watch the video" block for an article; renders nothing without videos. */
export default function VideoSection({
  videos,
  heading = videos.length > 1 ? 'Watch the videos' : 'Watch the video',
}: {
  videos: Video[];
  heading?: string;
}) {
  if (videos.length === 0) return null;

  return (
    <section className="video-section" aria-label={heading}>
      <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ fontSize: 'var(--step-1)', margin: 0 }}>
          <FontAwesomeIcon icon={faYoutube} className="fa-ico" style={{ color: '#ff0033' }} />
          {heading}
        </h2>
        <a className="action-link" href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer">
          More on the channel
        </a>
      </div>
      <div className={videos.length > 1 ? 'video-grid' : undefined}>
        {videos.map((v) => (
          <YouTubeEmbed key={v.id} video={v} />
        ))}
      </div>
    </section>
  );
}
