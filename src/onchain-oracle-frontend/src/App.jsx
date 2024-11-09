import { useState, useEffect } from "react";
import { onchain_oracle_backend } from "declarations/onchain-oracle-backend";

function App() {
  const [priceData, setPriceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatPriceData = (rawData) => {
    const parsedData = JSON.parse(rawData);
    return parsedData.map(([timestamp, , , , closePrice]) => ({
      timestamp,
      price: closePrice,
    }));
  };

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const fetchPriceData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const rawData = await onchain_oracle_backend.get_icp_usd_exchange();
      const formattedData = formatPriceData(rawData);
      setPriceData(formattedData);
    } catch (err) {
      setError("Failed to fetch price data. Please try again.");
      console.error("Error fetching price data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
  }, []);

  return (
    <main style={{ 
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '2rem',
      backgroundImage: 'linear-gradient(45deg, #1a1a1a 25%, #202020 25%, #202020 50%, #1a1a1a 50%, #1a1a1a 75%, #202020 75%, #202020 100%)',
      backgroundSize: '20px 20px'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '2rem',
        position: 'relative'
      }}>
        <h1 style={{
          color: '#00ff88',
          fontSize: '2.8rem',
          textShadow: '0 0 15px rgba(0,255,136,0.5), 0 0 25px rgba(0,255,136,0.3)',
          letterSpacing: '2px',
          fontWeight: '800',
          transform: 'perspective(500px) translateZ(0)',
          transition: 'transform 0.3s ease',
          ':hover': {
            transform: 'perspective(500px) translateZ(20px)'
          }
        }}>BTC-USD Price Oracle</h1>
      </header>
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: '0 0 30px rgba(0,0,0,0.3)',
        borderRadius: '15px',
        padding: '2rem',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(42,42,42,0.7)'
      }}>
        <button 
          onClick={fetchPriceData} 
          disabled={isLoading}
          style={{
            backgroundColor: '#00ff88',
            color: '#000000',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            marginBottom: '1.5rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,255,136,0.3)',
            transform: isLoading ? 'scale(0.98)' : 'scale(1)',
            ':hover': {
              backgroundColor: '#00e077',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0,255,136,0.4)'
            }
          }}
        >
          {isLoading ? "Fetching..." : "Fetch Latest Price"}
        </button>

        {error && <div style={{
          color: '#ff4444',
          padding: '1.2rem',
          backgroundColor: 'rgba(255,68,68,0.15)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,68,68,0.3)',
          animation: 'shake 0.5s ease-in-out'
        }}>{error}</div>}

        {priceData.length > 0 && (
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(45deg, #00ff88, #00e077)',
                color: '#000000'
              }}>
                <th style={{ padding: '1.2rem', fontWeight: '800', letterSpacing: '1px' }}>Timestamp</th>
                <th style={{ padding: '1.2rem', fontWeight: '800', letterSpacing: '1px' }}>Price (USD)</th>
              </tr>
            </thead>
            <tbody>
              {priceData.map(({ timestamp, price }, index) => (
                <tr 
                  key={index}
                  style={{
                    borderBottom: '1px solid #333',
                    transition: 'all 0.3s ease',
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#3a3a3a';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <td style={{ 
                    padding: '1.2rem', 
                    textAlign: 'center',
                    fontSize: '1.1rem'
                  }}>{formatTimestamp(timestamp)}</td>
                  <td style={{ 
                    padding: '1.2rem', 
                    textAlign: 'center',
                    color: '#00ff88',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    textShadow: '0 0 10px rgba(0,255,136,0.3)'
                  }}>{formatPrice(price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default App;
