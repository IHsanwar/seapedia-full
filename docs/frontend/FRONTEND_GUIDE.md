# SEAPEDIA Frontend Guide

## Architectural Overview
The SEAPEDIA frontend is a React application built with Vite. It relies on standard context and hooks to manage authentication, role selection, cart state, and general UI functionality.

## Core Features Implementation

### 1. Multi-Role Authentication & Role Selection
- The application supports users with multiple non-admin roles (Seller, Buyer, Driver).
- **AuthContext:** Manages the logged-in user state. Upon login, the system detects if the user holds multiple roles.
- **Role Selection:** If a user has more than one non-admin role, they are prompted to choose an **active role** before being redirected to any private dashboard. 
- **Routing:** Routes are protected based on the `activeRole` state. Accessing a Seller page while the `activeRole` is Buyer will result in a redirection or forbidden page.

### 2. Single-Store Checkout Implementation (Frontend)
- **Cart State:** The cart state is localized (or persisted in localStorage/backend). 
- **Validation Before Add:** Before a product is added to the cart, the frontend checks if the `store_id` of the new product matches the `store_id` of the products currently in the cart.
- **User Prompt:** If a mismatch is detected, a clear warning dialog appears explaining the Single-Store Checkout rule. It asks the user whether they want to clear the existing cart to add the new item, or cancel the action.

### 3. Application Reviews (Guest vs Logged-In)
- The public landing page features a testimonial or review section.
- Guests (unauthenticated users) and Logged-in users can both submit feedback regarding the application experience. 
- The form only requires a name, a rating (1-5), and a comment text. It explicitly prevents rendering HTML inputs by relying on React's automatic escaping.

### 4. UI/UX Principles (Level 1 Foundation)
- **Reusable Components:** Basic UI components (`Button`, `Card`, `Input`, `Navbar`) are isolated for reuse.
- **Navigation:** The Top Bar or Navbar dynamically adjusts based on the authentication status and active role. Guests see "Login/Register" while authenticated users see their specific dashboard links (e.g., "Buyer Dashboard", "Seller Dashboard").

## Security Practices (Frontend)
- **XSS Prevention:** All data fetched from the API (such as product descriptions and public reviews) is rendered directly using React's JSX (`{data}`), which automatically sanitizes strings against XSS attacks. `dangerouslySetInnerHTML` is completely avoided.
- **Route Protection:** Manual URL manipulation to access unauthorized pages is intercepted by `ProtectedRoute` wrapper components, checking both `isAuthenticated` and the allowed `activeRole`.
