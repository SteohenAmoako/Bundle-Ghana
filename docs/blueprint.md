# **App Name**: Bundle Ghana

## Core Features:

- Phone Number Input & Auto-Detection: Automatically detect the network provider (MTN, Telecel, AirtelTigo) and validate the phone number format as the user types their number. Show a logo of the detected provider as visual feedback.
- Data Packages Listing: Fetch data packages from `GET /api/external/packages/all-packages`, group by network, display with amount, validity, price, and Add to Cart button. Offer filtering by network and searching by data amount.
- Shopping Cart System: Maintain a shopping cart with recipient number, network ID, bundle ID, price, and data amount. Display items with prices and total. Provide options to remove items or edit recipient numbers before proceeding to checkout.
- Checkout & Payment Integration: Integrate Paystack for deposits if the wallet balance is insufficient. Show order summary and total amount. Upon successful payment via Paystack, update the wallet balance and allow purchase to complete with `POST /api/external/packages/buy-other`.
- Orders Management: Present a table with transaction code, recipient number, network provider, data bundle details, price, date, time, and status. Fetch data using `GET /api/external/packages/all-orders` with pagination. Enable search/filter and export orders to CSV.
- Wallet & Balance Management: Display the current wallet balance, a transaction history and a 'Add Money' button. After the transaction display real-time balance updates.

## Style Guidelines:

- Primary color: #FFC107 (Amber) to evoke energy, trust, and optimism, and reflect the accessible nature of the service.
- Background color: #FAF9F6 (Off-White) for a clean and modern look.
- Accent color: #03A9F4 (Light Blue) for call-to-actions, highlights, and interactive elements, providing a sense of trustworthiness and modernity.
- Body font: 'PT Sans', a sans-serif font, provides a balance of modernity and warmth. It should be used for the main body of the site, offering good readability.
- Headline font: 'Playfair', a modern serif font similar to Didot, will add an elegant and fashionable feel to the headlines, without overwhelming the main body of the text. If longer text is anticipated, use 'PT Sans' for the body.
- Use consistent and simple icons representing different data packages and network providers. These should align with the brand colors.
- Implement a mobile-first responsive design using breakpoints for mobile, tablet, and desktop to ensure accessibility across all devices.