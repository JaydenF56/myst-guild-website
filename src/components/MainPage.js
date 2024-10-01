import React, { useEffect, useState, useMemo } from 'react';
import './MainPage.css';

const MainPage = () => {
  const [liveStreams, setLiveStreams] = useState([]); // Stores all live streams
  const [offlineStreams, setOfflineStreams] = useState([]); // Stores offline streams
  const [isOfflineExpanded, setIsOfflineExpanded] = useState(false); // State for offline section visibility

  // Replace with your Twitch Client ID and OAuth Token
  const CLIENT_ID = '6gbh6hwuhjfnm5zo88oaz0p52naxjb'; // Replace with your actual Client ID
  const OAUTH_TOKEN = 'odhhao7tkl0l4bm9o6k67rbfve8n8w'; // Replace with your actual OAuth Token

  // Memoizing the twitchChannels array to avoid it changing on each render
  const twitchChannels = useMemo(() => [
    'itsshynie',
    'Raxity1'
  ], []);

  // Updated Mapping for Display Names
  const displayNames = {
    'Kyle': 'Kyle',
    'Vader': 'Vader',
    'itsshynie': 'Shynie',
    'Mellfunctionn': 'Mellindia',
    'Silky': 'Silky',
    'Steel': 'Coony',
    'Hfd': 'Hfd',
    'Cuhringe': 'Cuhringe',
    'Hammonds': 'Hammonds',
    'Kendk': 'Kendk',
    'Raxity1': 'Rax',
    // Add more mappings as needed
  };

  // Updated Mapping for Role Icons
  const roleMappings = {
    'Vader': 'Icon-class-role-tank-42x42.webp', // Tank role
    'Kyle': 'Icon-class-role-tank-42x42.webp', // Tank role
    'itsshynie': 'Icon-class-role-healer-42x42.webp', // Healer role
    'Silky': 'Icon-class-role-tank-42x42.webp', // Tank role
    'Steel': 'Icon-class-role-dealer-42x42.webp', // Dealer role
    'Mellfunctionn': 'Icon-class-role-healer-42x42.webp', // Healer role
    'Hfd': 'Icon-class-role-dealer-42x42.webp', // Dealer role
    'Cuhringe': 'Icon-class-role-dealer-42x42.webp', // Dealer role
    'Hammonds': 'Icon-class-role-dealer-42x42.webp', // Dealer role
    'Kendk': 'Icon-class-role-tank-42x42.webp', // Tank role
    'Raxity1': 'Icon-class-role-dealer-42x42.webp', // Dealer role
    // Add more mappings as needed
  };

  // Role priority to help sorting offline streams by role
  const rolePriority = {
    'Icon-class-role-tank-42x42.webp': 1, // Tank
    'Icon-class-role-healer-42x42.webp': 2, // Healer
    'Icon-class-role-dealer-42x42.webp': 3, // Dealer (Damage)
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
        console.log('Fetched data:', data);

        // Extract live user names from the fetched data
        const liveUsernames = data.data.map(stream => stream.user_name);
        console.log('Live usernames:', liveUsernames);

        // Set live streams based on the data fetched, sorted by viewer count (descending)
        setLiveStreams(data.data.sort((a, b) => b.viewer_count - a.viewer_count));

        // Create offline channels by filtering out the live ones
        const offlineChannels = twitchChannels.filter(channel => !liveUsernames.includes(channel));
        console.log('Offline channels:', offlineChannels);

        // Fetch offline streamers' info, including profile images
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
              thumbnail_url: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}.jpg`, // Thumbnail for offline
              profile_image: profileImage, // Profile image for offline users
              role_icon: roleMappings[channel], // Role icon for sorting
            };
          })
        );

        // Sort offline streams by role using role priority
        const sortedOfflineStreams = offlineStreamsData.sort((a, b) => {
          return rolePriority[a.role_icon] - rolePriority[b.role_icon];
        });

        setOfflineStreams(sortedOfflineStreams); // Set offline channels

      } catch (error) {
        console.error('Error fetching streams:', error);
      }
    };

    fetchStreams();
  }, [twitchChannels]); // Include twitchChannels in the dependency array

  // Function to toggle offline section visibility
  const toggleOfflineSection = () => {
    setIsOfflineExpanded(prevState => !prevState);
  };
  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <img src="/Myst-Future.png" alt="Left Image" className="header-image left" />
            <img src="/MYST.png" alt="Right Image" className="header-image-right" />
          </div>
          <div className="header-center">
            <span>REALM FIRST Heroic: Ragnaros</span>
          </div>
          <div className="header-right">
            <a href="https://discord.com/invite/WpwfdWrmWh" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-discord"></i>
            </a>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="main-content">
        <div className="latest-kill-video">
          <div className="video-container">
            <iframe
              className="video-iframe"
              src="https://www.youtube.com/embed/DtHw0NC7vF0?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&vq=auto&mute=1"
              title="Latest Kill Video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
            <div className="overlay"></div>
          </div>
        </div>

        {/* Container for Recruitment and Live Streams */}
        <div className="recruitment-streams-container">
          {/* Recruitment Section */}
          <div className="recruitment-section">
            <h2>We Are Recruiting</h2>
            <div className="recruitment-info">
              <div className="recruitment-item">
                <img src="/balancedruid.webp" alt="Balance Druid" className="class-icon" />
                <span className="class-name">Balance Druid</span>
                <span className="priority high-priority">HIGH</span>
              </div>

              <div className="recruitment-item">
                <img src="/demonologywarlock.jpg" alt="Demonology Warlock" className="class-icon" />
                <span className="class-name">Demonology Warlock</span>
                <span className="priority medium-priority">MEDIUM</span>
              </div>
            </div>

            <button className="apply-button" onClick={() => window.open('https://discord.com/invite/WpwfdWrmWh')}>
              <i className="fa-brands fa-discord"></i> Apply Now
            </button>
          </div>

          {/* Streams Section */}
          <div className="streams-section">
            <h2>Live Streams</h2>
            {liveStreams.length > 0 ? (
              liveStreams.map((stream) => (
                <div className="stream-item" key={stream.id}>
                  <img
                    src={stream.thumbnail_url.replace('{width}', '300').replace('{height}', '200')} // Adjust thumbnail size
                    alt={stream.title}
                    className="stream-thumbnail"
                  />
                  <div className="stream-details">
                    <div className="stream-info">
                      <img
                        src={`/${roleMappings[stream.user_name]}`}
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
            <div className="offline-section">
              <h3 className="offline-header">
                {offlineStreams.length} Offline
                <button className="expand-button" onClick={toggleOfflineSection}>
                  {isOfflineExpanded ? '-' : '+'} {/* Toggle sign */}
                </button>
              </h3>
              {isOfflineExpanded && offlineStreams.length > 0 && (
                offlineStreams.map((channel, index) => (
                  <div className="stream-item" key={index}>
                    <img
                      src={channel.profile_image} // Profile image for offline users
                      alt={`${channel.user_name} Offline`}
                      className="stream-thumbnail"
                    />
                    <div className="stream-details">
                      <div className="stream-info">
                        <img
                          src={`/${roleMappings[channel.user_name]}`}
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
  );
};

export default MainPage;
