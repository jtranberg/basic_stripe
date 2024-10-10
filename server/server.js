const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // Import path for file handling

dotenv.config(); // Load environment variables from .env file
console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);
console.log('Stripe Publishable Key:', process.env.STRIPE_PUBLISHABLE_KEY);

const app = express();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Use the Stripe secret key from .env

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get the Stripe publishable key
app.get('/config', (req, res) => {
    console.log('Publishable Key:', process.env.STRIPE_PUBLISHABLE_KEY); // Log the key to check if it's being read correctly
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Serve success page
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html')); // Adjust the path if necessary
});

// Serve cancel page
app.get('/cancel', (req, res) => {
    res.sendFile(path.join(__dirname, 'cancel.html')); // Adjust the path if necessary
});

app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Sample Product',
                        },
                        unit_amount: 2000,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/success', // Update to port 3000
            cancel_url: 'http://localhost:3000/cancel',  // Update to port 3000
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server and listen on port 3000
app.listen(3000, () => console.log('Server running on port 3000'));
