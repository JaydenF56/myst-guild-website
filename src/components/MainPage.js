import React, { useEffect, useState, useMemo, useRef } from 'react';
import Slider from "react-slick"; 
import './MainPage.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 

const MainPage = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [offlineStreams, setOfflineStreams] = useState([]);
  const [isOfflineExpanded, setIsOfflineExpanded] = useState(false);
  const offlineSectionRef = useRef(null); // Create a ref for the offline section

  const CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
  const OAUTH_TOKEN = process.env.REACT_APP_TWITCH_OAUTH_TOKEN;

  // Memoizing the twitchChannels array to avoid it changing on each render
  const twitchChannels = useMemo(() => [
    'silkiverse',
    'itsshynie',
    'Raxity1'
  ], []);

  // Updated Mapping for Display Names
  const displayNames = {
    'itsshynie': 'Shynie',
    'Mellfunctionn': 'Mellindia',
    'silkiverse': 'Silky',
    'Steel': 'Coony',
    'Hfd': 'Hfd',
    'Cuhringe': 'Cuhringe',
    'Hammonds': 'Hammonds',
    'Kendk': 'Kendk',
    'Raxity1': 'Rax',
  };

  // Updated Mapping for Role Icons
  const roleMappings = {
    'itsshynie': `${process.env.PUBLIC_URL}/Icon-class-role-healer-42x42.webp`, // Healer role
    'silkiverse': `${process.env.PUBLIC_URL}/Icon-class-role-tank-42x42.webp`, // Tank role
    'Steel': `${process.env.PUBLIC_URL}/Icon-class-role-dealer-42x42.webp`, // Dealer role
    'Mellfunctionn': `${process.env.PUBLIC_URL}/Icon-class-role-healer-42x42.webp`, // Healer role
    'Hfd': `${process.env.PUBLIC_URL}/Icon-class-role-dealer-42x42.webp`, // Dealer role
    'Cuhringe': `${process.env.PUBLIC_URL}/Icon-class-role-dealer-42x42.webp`, // Dealer role
    'Hammonds': `${process.env.PUBLIC_URL}/Icon-class-role-dealer-42x42.webp`, // Dealer role
    'Kendk': `${process.env.PUBLIC_URL}/Icon-class-role-tank-42x42.webp`, // Tank role
    'Raxity1': `${process.env.PUBLIC_URL}/Icon-class-role-dealer-42x42.webp`, // Dealer role
  };

  // Role priority to help sorting offline streams by role
  const rolePriority = {
    'Icon-class-role-tank-42x42.webp': 1, // Tank
    'Icon-class-role-healer-42x42.webp': 2, // Healer
    'Icon-class-role-dealer-42x42.webp': 3, // Dealer (Damage)
  };

  // Sample images for carousel
  const carouselImages = [
    `${process.env.PUBLIC_URL}/Myst-Banner.webp`,
    `${process.env.PUBLIC_URL}/Myst-Banner1.webp`,
  ];

  // Slider settings for react-slick
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
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
    if (!isOfflineExpanded && offlineSectionRef.current) {
      setTimeout(() => {
        offlineSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200); // Delay to ensure the offline section expands before scrolling
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <img src={`${process.env.PUBLIC_URL}/Myst-Future.png`} alt="Left Image" className="header-image left" />
            <img src={`${process.env.PUBLIC_URL}/MYST.png`} alt="Right Image" className="header-image-right" />
          </div>
          <div className="header-center">
            <span>REALM FIRST Heroic: Ragnaros</span>
          </div>
          <div className="header-right">
            <a href="https://discord.com/invite/WpwfdWrmWh" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-discord"></i>
            </a>
            <a href="https://www.youtube.com/@Myst-Arugal" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="main-content">
        <div className="latest-kill-carousel">
          <Slider {...sliderSettings}>
            {carouselImages.map((image, index) => (
              <div key={index} className="carousel-image-container">
                <img src={image} alt={`Slide ${index + 1}`} className="carousel-image" />
              </div>
            ))}
          </Slider>
        </div>

        {/* Container for Recruitment and Live Streams */}
        <div className="recruitment-streams-container">
          {/* Recruitment Section */}
          <div className="recruitment-section">
            <h2>We Are Recruiting</h2>
            <button className="apply-button" onClick={() => window.open('https://discord.com/invite/WpwfdWrmWh')}>
              <i className="fa-brands fa-discord"></i> Apply Now
            </button>
            <div className="recruitment-info">
              <div className="recruitment-item">
                <img src={`${process.env.PUBLIC_URL}/balancedruid.webp`} alt="Balance Druid" className="class-icon" />
                <span className="class-name">Balance Druid</span>
                <span className="priority high-priority">HIGH</span>
              </div>
              <div className="recruitment-item">
                <img src={`${process.env.PUBLIC_URL}/demonologywarlock.jpg`} alt="Demonology Warlock" className="class-icon" />
                <span className="class-name">Demonology Warlock</span>
                <span className="priority medium-priority">MEDIUM</span>
              </div>
            </div>
          </div>

          {/* Streams Section */}
          <div className="streams-section">
            <h2>Live Streams</h2>
            <div className="streams-section-info">
              {liveStreams.length > 0 ? (
                liveStreams.map((stream) => (
                  <div className="stream-item" key={stream.id}>
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
                      <a
                        href={`https://www.twitch.tv/${stream.user_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="twitch-link"
                      >
                        Watch Live
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p>No live streams available.</p>
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
