require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;
const DISCORD_LOOKUP_API = 'https://discordlookup.mesalytic.moe/v1/user';

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting variables
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 1000; // 1 second between requests

// User lookup endpoint
app.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Validate ID format
        if (!/^\d{17,19}$/.test(userId)) {
            return res.status(400).json({ 
                error: 'Invalid Discord ID format',
                message: 'Discord IDs must be 17-19 digit numbers' 
            });
        }

        // Simple rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        
        if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
        }
        
        lastRequestTime = Date.now();

        // Fetch user from external API
        const response = await axios.get(`${DISCORD_LOOKUP_API}/${userId}`, {
            headers: {
                'User-Agent': 'DiscordLookupProxy/1.0'
            },
            timeout: 5000 // 5 second timeout
        });

        // Format the response data
        const userData = {
            id: response.data.id,
            username: response.data.username,
            discriminator: response.data.discriminator,
            avatar: response.data.avatar_url,
            banner: response.data.banner_url,
            bio: response.data.bio,
            created_at: response.data.created_at,
            badges: response.data.badges,
            premium_type: response.data.premium_type,
            public_flags: response.data.public_flags,
            last_updated: response.data.last_updated
        };

        res.json(userData);
    } catch (error) {
        if (error.response) {
            // External API returned an error
            if (error.response.status === 404) {
                res.status(404).json({ error: 'User not found' });
            } else if (error.response.status === 429) {
                res.status(429).json({ 
                    error: 'Rate limited', 
                    message: 'Please try again later' 
                });
            } else {
                res.status(error.response.status).json({ 
                    error: 'External API error',
                    message: error.response.data.message || 'Unknown error' 
                });
            }
        } else if (error.code === 'ECONNABORTED') {
            res.status(504).json({ error: 'External API timeout' });
        } else {
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/user/:id`);
    console.log(`Example: http://localhost:${PORT}/user/123456789012345678`);
});
