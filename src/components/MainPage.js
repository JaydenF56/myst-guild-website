import React, { useEffect, useState, useMemo, useRef } from 'react';
import Slider from "react-slick";
import './MainPage.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import RaidCountdown from './RaidTimer'; // Adjust the path if needed
const MainPage = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [offlineStreams, setOfflineStreams] = useState([]);
  const [isOfflineExpanded, setIsOfflineExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0); // Track current slide index
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false); // Track video modal visibility
  const [currentVideo, setCurrentVideo] = useState(null);
  const offlineSectionRef = useRef(null);
  const sliderRef = useRef(null);

  const CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
  const OAUTH_TOKEN = process.env.REACT_APP_TWITCH_OAUTH_TOKEN;

  // Memoizing the twitchChannels array to avoid it changing on each render
  const twitchChannels = useMemo(() => [
    'silkiverse',
    'itsshynie',
    'Raxity1',

  ], []);

  // Updated Mapping for Display Names
  const displayNames = {
    'itsshynie': 'Shynie',
    'silkiverse': 'Silky',
    'Steel': 'Coony',
    'Raxity1': 'Rax',
  };

  // Updated Mapping for Role Icons
  const roleMappings = {
    'itsshynie': `${process.env.PUBLIC_URL}/Icon-class-role-healer-42x42.webp`,
    'silkiverse': `${process.env.PUBLIC_URL}/Icon-class-role-tank-42x42.webp`,
    'Steel': `${process.env.PUBLIC_URL}/Icon-class-role-dealer-42x42.webp`,
    'Raxity1': `${process.env.PUBLIC_URL}/Icon-class-role-dealer-42x42.webp`,

  };

  // Role priority to help sorting offline streams by role
  const rolePriority = {
    'Icon-class-role-tank-42x42.webp': 1,
    'Icon-class-role-healer-42x42.webp': 2,
    'Icon-class-role-dealer-42x42.webp': 3,
  };

  // Sample images for carousel
  const carouselImages = [
    {
      image: `${process.env.PUBLIC_URL}/Nefarian.png`,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      overlayText: 'Defeats Heroic: Nefarian'
    },
    {
      image: `${process.env.PUBLIC_URL}/Sinestra.png`,
      overlayText: 'Defeats Heroic: Sinestra'
    },
  ];

  // Slider settings for react-slick
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
    ref: sliderRef,
  };

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${twitchChannels.join('&user_login=')}`, {
          headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${OAUTH_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const liveUsernames = data.data.map(stream => stream.user_name);
        setLiveStreams(data.data.sort((a, b) => b.viewer_count - a.viewer_count));

        const offlineChannels = twitchChannels.filter(channel => !liveUsernames.includes(channel));
        const offlineStreamsData = await Promise.all(
          offlineChannels.map(async (channel) => {
            const profileResponse = await fetch(`https://api.twitch.tv/helix/users?login=${channel}`, {
              headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${OAUTH_TOKEN}`,
              },
            });

            if (!profileResponse.ok) {
              throw new Error(`HTTP error fetching user! status: ${profileResponse.status}`);
            }

            const profileData = await profileResponse.json();
            const profileImage = profileData.data.length > 0 ? profileData.data[0].profile_image_url : '';

            return {
              user_name: channel,
              thumbnail_url: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}.jpg`,
              profile_image: profileImage,
              role_icon: roleMappings[channel],
            };
          })
        );

        const sortedOfflineStreams = offlineStreamsData.sort((a, b) => {
          return rolePriority[a.role_icon] - rolePriority[b.role_icon];
        });

        setOfflineStreams(sortedOfflineStreams);

      } catch (error) {
        console.error('Error fetching streams:', error);
      }
    };

    fetchStreams();
  }, [twitchChannels]);

  // Function to toggle offline section visibility and scroll into view
  const toggleOfflineSection = () => {
    setIsOfflineExpanded(prevState => !prevState);

    // Scroll into view only if expanding
    if (!isOfflineExpanded && offlineSectionRef.current) {
      setTimeout(() => {
        offlineSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // Adjust the delay to match the CSS transition timing
    }
  };


  // Function to open the YouTube video modal
  const openYouTubeModal = (videoUrl) => {
    setCurrentVideo({ type: 'youtube', url: videoUrl });
    setIsVideoModalOpen(true);
    if (sliderRef.current) {
      sliderRef.current.slickPause();
    }
  };

  // Function to open the Twitch video modal
  const openTwitchModal = (channel) => {
    const parentDomain = window.location.hostname; // Get the domain from the current hostname
    setCurrentVideo({
      type: 'twitch',
      url: `https://player.twitch.tv/?channel=${channel}&parent=${parentDomain}`
    });
    setIsVideoModalOpen(true);
    if (sliderRef.current) {
      sliderRef.current.slickPause();
    }
  };

  // Function to close the video modal
  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideo(null);
    if (sliderRef.current) {
      sliderRef.current.slickPlay();
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <img src={`${process.env.PUBLIC_URL}/MystLogo.png`} alt="Left Image" className="header-image left" />
          </div>
          <div className="header-center">
            <span></span>
          </div>
          <div className="header-right">
          <RaidCountdown />
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="main-content">
        <div className="latest-kill-carousel">
          <div className="carousel-container">
            <Slider ref={sliderRef} {...sliderSettings}>
              {carouselImages.map((item, index) => (
                <div key={index} className="carousel-image-container">
                  <img src={item.image} alt={`Slide ${index + 1}`} className="carousel-image" />
                </div>
              ))}
            </Slider>
            {/* Overlay that appears on top of the image */}
            <div className="carousel-bottom-overlay">
              <img src={`${process.env.PUBLIC_URL}/MystLogo.png`} alt="Logo" className="overlay-logo-left" />
              <h2 className="overlay-text-right">
                {carouselImages[currentSlide].overlayText}
              </h2>
              {carouselImages[currentSlide].videoUrl && (
                <img
                  src={`${process.env.PUBLIC_URL}/youtube-icon.png`}
                  alt="Watch Video"
                  className="overlay-youtube-icon"
                  onClick={() => openYouTubeModal(carouselImages[currentSlide].videoUrl)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Video Modal */}
        {isVideoModalOpen && (
          <div className="video-modal" onClick={closeVideoModal}>
            <div className="video-container" onClick={(e) => e.stopPropagation()}>
              {currentVideo.type === 'youtube' && (
                <iframe
                  width="100%"
                  height="100%"
                  src={`${currentVideo.url}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
              {currentVideo.type === 'twitch' && (
                <iframe
                  src={`${currentVideo.url}&autoplay=true`}
                  height="100%"
                  width="100%"
                  frameBorder="0"
                  allowFullScreen={true}
                  scrolling="no"
                  title="Twitch Stream Player"
                ></iframe>
              )}
            </div>
          </div>
        )}


        {/* Container for Recruitment and Live Streams */}
        <div className="recruitment-streams-container">
          {/* Recruitment Section */}
          <div className="recruitment-section">
            <h2>We Are Recruiting</h2>
            <div className="button-container">
              <button className="apply-button" onClick={() => window.open('https://discord.com/invite/WpwfdWrmWh')}>
                <span>     <i className="fa-brands fa-discord"></i> Apply Now</span>
                <div className="top"></div>
                <div className="left"></div>
                <div className="bottom"></div>
                <div className="right"></div>
              </button>
            </div>
            <div className="recruitment-info">
              <div className="recruitment-item">
                <img src={`${process.env.PUBLIC_URL}/balancedruid.webp`} alt="Balance Druid" className="class-icon" />
                <span className="class-name">Balance Druid</span>
                <span className="priority high-priority">HIGH</span>
              </div>
              <div className="recruitment-item">
                <img src={`${process.env.PUBLIC_URL}/demonologywarlock.jpg`} alt="Demonology Warlock" className="class-icon" />
                <span className="class-name">Demonology Warlock</span>
                <span className="priority low-priority">LOW</span>
              </div>
            </div>
          </div>

          {/* Streams Section */}
          <div className="streams-section">
            <h2>Live Streams</h2>
            <div className="streams-section-info">
              {liveStreams.length > 0 ? (
                liveStreams.map((stream) => (
                  <div
                    className="stream-item"
                    key={stream.id}
                    onClick={() => openTwitchModal(stream.user_name)}
                  >
                    <img
                      src={stream.thumbnail_url.replace('{width}', '300').replace('{height}', '200')}
                      alt={stream.title}
                      className="stream-thumbnail"
                    />
                    <div className="stream-details">
                      <div className="stream-info">
                        <img
                          src={roleMappings[stream.user_name]}
                          alt={`${stream.user_name} Role Icon`}
                          className="role-icon"
                        />
                        <h3>{displayNames[stream.user_name] || stream.user_name}</h3>
                      </div>
                      <span className="stream-viewers">{stream.viewer_count} viewers</span>
                      {/* Watch Live Button that opens in a new tab without triggering the modal */}
                      <a
                        href={`https://www.twitch.tv/${stream.user_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="twitch-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Watch on Twitch
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p>Everyone is Offline.</p>
              )}


              {/* Offline Section */}
              <div className="offline-section" ref={offlineSectionRef}>
                <h3 className="offline-header">
                  {offlineStreams.length} Offline
                  <button className="expand-button" onClick={toggleOfflineSection}>
                    {isOfflineExpanded ? '-' : '+'}
                  </button>
                </h3>
                {isOfflineExpanded && offlineStreams.length > 0 && (
                  offlineStreams.map((channel, index) => (
                    <div className="stream-item" key={index}>
                      <img
                        src={channel.profile_image}
                        alt={`${channel.user_name} Offline`}
                        className="stream-thumbnail"
                      />
                      <div className="stream-details">
                        <div className="stream-info">
                          <img
                            src={roleMappings[channel.user_name]}
                            alt={`${channel.user_name} Role Icon`}
                            className="role-icon"
                          />
                          <h3>{displayNames[channel.user_name] || channel.user_name}</h3>
                        </div>
                        <span className="stream-viewers">Offline</span>
                        <a
                          href={`https://www.twitch.tv/${channel.user_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="go-to-channel"
                        >
                          Go to Channel
                        </a>
                      </div>
                    </div>
                  ))
                )}
                {isOfflineExpanded && offlineStreams.length === 0 && (
                  <p>No offline channels available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
