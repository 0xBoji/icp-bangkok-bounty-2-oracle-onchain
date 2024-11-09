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
      padding: '2rem'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          color: '#00ff88',
          fontSize: '2.5rem',
          textShadow: '0 0 10px rgba(0,255,136,0.3)'
        }}>BTC-USD Price Oracle</h1>
      </header>
      <section style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <button 
          onClick={fetchPriceData} 
          disabled={isLoading}
          style={{
            backgroundColor: '#00ff88',
            color: '#000000',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            marginBottom: '1rem',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? "Fetching..." : "Fetch Latest Price"}
        </button>

        {error && <div style={{
          color: '#ff4444',
          padding: '1rem',
          backgroundColor: 'rgba(255,68,68,0.1)',
          borderRadius: '5px',
          marginBottom: '1rem'
        }}>{error}</div>}

        {priceData.length > 0 && (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#2a2a2a',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#00ff88',
                color: '#000000'
              }}>
                <th style={{ padding: '1rem' }}>Timestamp</th>
                <th style={{ padding: '1rem' }}>Price (USD)</th>
              </tr>
            </thead>
            <tbody>
              {priceData.map(({ timestamp, price }, index) => (
                <tr 
                  key={index}
                  style={{
                    borderBottom: '1px solid #333',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{formatTimestamp(timestamp)}</td>
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'center',
                    color: '#00ff88',
                    fontWeight: 'bold'
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
