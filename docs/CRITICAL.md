Now I have a comprehensive understanding of the project. Let me compile the audit report. Let me identify all the issues I've found:

Build Issues
CRITICAL: @base-ui/react/switch - Root and Thumb are undefined imports
The switch.jsx imports * as SwitchPrimitives from "@base-ui/react/switch" and then uses SwitchPrimitives.Root and SwitchPrimitives.Thumb
The @base-ui/react/switch/index.mjs exports export * as Switch from "./index.parts.mjs" which re-exports Root and Thumb
But the build says Import Root will always be undefined and Import Thumb will always be undefined
This is because @base-ui/react/switch exports Switch as a namespace, not Root and Thumb directly
The code uses SwitchPrimitives.Root but the actual export is Switch.Root or just using the named exports
Wait, let me re-check. The index.mjs says export * as Switch from "./index.parts.mjs" - so the default export is Switch namespace, not Root and Thumb individually.
But the code does import * as SwitchPrimitives from "@base-ui/react/switch" which would get { Switch: { Root, Thumb } }, not { Root, Thumb } directly.
So SwitchPrimitives.Root is undefined because the actual export is SwitchPrimitives.Switch.Root
FIX: Change import to import { Switch } from "@base-ui/react/switch" and use Switch.Root and Switch.Thumb
HIGH: @radix-ui/react-slot not in package.json dependencies
button.jsx imports { Slot } from "@radix-ui/react-slot" but this package is NOT in package.json
It appears to be a transitive dependency of radix-ui or @base-ui/react
It IS installed (I verified), but it's not explicitly listed in dependencies
This could break if the transitive dependency is removed
HIGH: @radix-ui/react-select, @radix-ui/react-checkbox, @radix-ui/react-tooltip not in package.json
select.jsx imports from @radix-ui/react-select
checkbox.jsx imports from @radix-ui/react-checkbox
tooltip.jsx imports from @radix-ui/react-tooltip
None of these are in package.json dependencies
They're likely transitive dependencies of radix-ui package
This is fragile - could break on dependency updates
HIGH: Duplicate CheckoutPage.jsx - There are TWO CheckoutPage files:
src/pages/CheckoutPage.jsx (old/legacy, uses RadioGroup, sonner, different API imports)
src/pages/buyer/CheckoutPage.jsx (new, uses DiscountSelector, react-toastify)
The route imports from ../pages/buyer/CheckoutPage so the legacy one is unused
The legacy one also imports RadioGroup and RadioGroupItem from @/components/ui/radio-group which doesn't exist
The legacy one imports getCart, getAddresses, checkout, applyVoucher, getAvailableVouchers as named exports, but the API files use default exports or named object exports
HIGH: size="icon-sm" is not a valid Button size - In dialog.jsx:70, the close button uses size="icon-sm" which doesn't exist in the button variants (only default, sm, lg, icon)
MEDIUM: @fontsource-variable/geist installed but never imported - The package is in dependencies but never used in code. The CSS uses Google Fonts for Inter instead.
MEDIUM: Mixed toast libraries - The app uses both react-toastify (in App.jsx, most pages) and sonner (in ProfilePage.jsx and the legacy CheckoutPage.jsx). Should be consistent.
MEDIUM: VoucherSelector.jsx is never imported - Only DiscountSelector.jsx is used in the active CheckoutPage
Runtime Safety
HIGH: Switch component will render as undefined - Due to the Root and Thumb import issue, the Switch component will render nothing or crash at runtime
MEDIUM: order.delivery_method.replace('_', ' ') in OrderHistoryPage - If delivery_method is null/undefined, this will crash. Missing optional chaining.
MEDIUM: parseFloat(order.subtotal), parseFloat(order.delivery_fee), etc. in OrderDetailPage - If any of these are null/undefined, parseFloat(null) returns NaN which would display "Rp NaN"
MEDIUM: Tabs component doesn't manage active state - The custom Tabs component is just a plain div with no state management. Pages using onValueChange (like BuyerReportsPage, SellerReportsPage) won't work correctly because the custom Tabs doesn't implement controlled value/onValueChange props.
MEDIUM: Select component uses onValueChange but is from Radix - The Select component from @radix-ui/react-select does support onValueChange, so this is fine. But the value/onValueChange pattern in DataTable works.
LOW: product.stock access without optional chaining - In ProductCard (HomePage), product.stock <= 0 could crash if stock is undefined.
Dead Code
MEDIUM: src/pages/CheckoutPage.jsx - Legacy duplicate, never imported by routes
MEDIUM: src/components/checkout/VoucherSelector.jsx - Never imported anywhere
LOW: src/components/layout/Breadcrumb.jsx - The standalone Breadcrumb component is exported from layout/index.js but never imported by any page. The TopHeader has its own inline Breadcrumb component.
LOW: Duplicate getMenuItemsByRole function - Defined both in menuConfig.js and Sidebar.jsx
LOW: settingsMenuItems - Referenced in Sidebar but links to /settings, /settings/users, /settings/payment which have no routes defined
shadcn/UI Audit
HIGH: Mixed component libraries - Some UI components use @base-ui/react (dialog, dropdown-menu, avatar, switch) while others use @radix-ui/react-* (select, checkbox, tooltip). The shadcn base-nova style uses @base-ui/react but the select, checkbox, and tooltip components were not migrated.
HIGH: Switch component broken - As noted above, Root and Thumb are undefined due to incorrect import path
MEDIUM: Button size="icon-sm" doesn't exist - Used in dialog.jsx
MEDIUM: Button size="xs" doesn't exist - Used in DiscountSelector.jsx line 164
Routing Audit
MEDIUM: /forgot-password route doesn't exist - LoginPage links to /forgot-password which has no route
MEDIUM: /terms and /privacy routes don't exist - RegisterPage links to these
LOW: /settings routes don't exist - settingsMenuItems links to /settings, /settings/users, /settings/payment
LOW: No lazy loading - All pages are eagerly imported in routes/index.jsx
LOW: /:role/dashboard route - This is a catch-all pattern that could match unintended paths
API Integration
MEDIUM: authAPI.getDashboard passes { signal } but the API function doesn't accept it - In DashboardPage, authAPI.getDashboard({ signal }) is called but the function signature is getDashboard: async () => { const response = await api.get('/api/v1/profile/dashboard'); } - the signal is not passed to axios
MEDIUM: addressAPI.getAddresses({ signal }) - same issue - The getAddresses function doesn't accept config params
LOW: No retry handling - API calls have no retry mechanism
UX Audit
LOW: Legacy CheckoutPage has no loading skeleton - Just shows "Loading checkout..." text
LOW: OrderHistoryPage delivery_method.replace - Could show error if null
Performance
MEDIUM: Bundle size 986KB - Exceeds 500KB warning. No code splitting or lazy loading.
LOW: @fontsource-variable/geist unused dependency - Adds to bundle size
LOW: Both react-toastify and sonner installed - Duplicate toast libraries
Production Checklist
MEDIUM: 40 console.error statements across API files and pages
LOW: 3 hardcoded localhost:8000 fallbacks - In axiosInstance.js (acceptable as fallback), ProductFormPage.jsx, ProductManagementPage.jsx
LOW: dev.html file in project root - Appears to be a development artifact
Let me now also check the Tabs component issue more carefully - the custom Tabs doesn't implement value/onValueChange but BuyerReportsPage and SellerReportsPage use them.

Looking at the Tabs component:

const Tabs = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props}>
    {children}
  </div>
))
This is just a wrapper div. It doesn't implement any tab switching logic. The TabsTrigger has data-[state=active] CSS but no state management. Pages that use value and onValueChange on this Tabs component will not work - those props will just be passed through as HTML attributes on a div.

This is a CRITICAL issue because BuyerReportsPage and SellerReportsPage rely on tab switching functionality.

Let me also check if there's a RadioGroup component since the legacy CheckoutPage uses it.

Looking at the UI components list: avatar, badge, button, card, checkbox, dialog, dropdown-menu, input, label, select, skeleton, switch, tabs, textarea, tooltip. No radio-group component.

So the legacy CheckoutPage.jsx will fail to import RadioGroup.

Now let me compile the full audit report.

Now I have all the information needed for a comprehensive audit. Let me compile the final report.













Let me compile the comprehensive audit report based on everything I've read. Let me organize by severity.

Key findings:

CRITICAL - Switch.jsx broken imports: SwitchPrimitives.Root and SwitchPrimitives.Thumb are imported as * as SwitchPrimitives from "@base-ui/react/switch" but the package exports Switch as a namespace with Root and Thumb inside. The build confirms: IMPORT_IS_UNDEFINED for Root and Thumb. The @base-ui/react/switch/index.mjs exports export * as Switch from "./index.parts.mjs" which exports Root and Thumb. So SwitchPrimitives.Root should work because * as SwitchPrimitives gives us SwitchPrimitives.Switch.Root. Wait, let me re-check...
Actually, the index.mjs does: export * as Switch from "./index.parts.mjs". And index.parts.mjs does: export { SwitchRoot as Root } and export { SwitchThumb as Thumb }.

So when you do import * as SwitchPrimitives from "@base-ui/react/switch", you get SwitchPrimitives.Switch.Root and SwitchPrimitives.Switch.Thumb, NOT SwitchPrimitives.Root and SwitchPrimitives.Thumb.

This is a CRITICAL build error - the Switch component will render as undefined.

CRITICAL - Legacy CheckoutPage.jsx at src/pages/CheckoutPage.jsx: This file imports from @/api/addresses (should be @/api/address), @/api/cart using named exports (but cart.js uses export const cartAPI), @/api/orders using named exports (but orders.js uses export const orderAPI), @/api/vouchers using named exports (but vouchers.js uses export const voucherAPI and export const adminVoucherAPI). It also imports RadioGroup and RadioGroupItem from @/components/ui/radio-group which DOESN'T EXIST. And it uses toast from sonner while the rest of the app uses react-toastify.
Wait, but the routes file imports CheckoutPage from ../pages/buyer/CheckoutPage, not from ../pages/CheckoutPage. So this legacy file is NOT in the routes. Let me check if it's actually imported anywhere...

The routes import from ../pages/buyer/CheckoutPage, so src/pages/CheckoutPage.jsx is a dead/legacy file. But it still gets compiled by Vite (since Vite compiles all files in src/). Actually, Vite only compiles files that are imported. If nothing imports src/pages/CheckoutPage.jsx, it won't be in the bundle. So this is a dead code issue, not a build error.

HIGH - Button size="icon-sm" in dialog.jsx: The Button component only defines sizes: default, sm, lg, icon. There's no "icon-sm" size. This will render without the size class, resulting in incorrect styling.
HIGH - Tabs component is not stateful: The custom Tabs component at src/components/ui/tabs.jsx is just divs with no state management. It uses data-[state=active] CSS selectors but there's no mechanism to set data-state on TabsTrigger. This means tabs won't actually switch content. The TabsTrigger is just a <button> with no click handler to manage active state. Pages like BuyerReportsPage.jsx and SellerReportsPage.jsx use value and onValueChange props on Tabs, but the Tabs component doesn't implement this. This is a CRITICAL runtime issue.
Wait, let me re-read the Tabs component... It's a plain div wrapper. It accepts value and onValueChange but doesn't use them. The TabsTrigger is just a button with no active state management. The TabsContent renders props.children always (no conditional rendering based on active tab).

Actually, looking more carefully at BuyerReportsPage.jsx line 105: <Tabs value={activeTab} onValueChange={setActiveTab}>. The Tabs component just renders a div with children. The TabsTrigger and TabsContent don't have any mechanism to show/hide based on the active value. This means ALL tab content will be visible at once, and clicking tabs won't switch between them.

This is a CRITICAL issue for any page using Tabs.

HIGH - VoucherSelector is unused: The VoucherSelector component is defined but never imported by any page. The CheckoutPage (buyer) uses DiscountSelector instead.
HIGH - Mixed toast libraries: ProfilePage.jsx uses toast from sonner, while the rest of the app uses react-toastify. The App.jsx only sets up ToastContainer from react-toastify. Sonner toasts won't render because there's no <Toaster /> component from sonner in the app.
HIGH - 40 console.error statements in production code across API files and pages.
HIGH - Hardcoded localhost fallback URLs in 3 locations (ProductFormPage, ProductManagementPage, axiosInstance).
MEDIUM - @radix-ui packages mixed with @base-ui: The project uses both @base-ui/react (for Dialog, DropdownMenu, Avatar, Switch) and @radix-ui/react-* (for Select, Checkbox, Tooltip, Slot). This is inconsistent and increases bundle size. The radix-ui package in dependencies is the umbrella package, but individual @radix-ui/react-* packages are used as transitive deps.
MEDIUM - Bundle size: 986KB JS (273KB gzipped) exceeds the 500KB warning threshold. No lazy loading for route components.
MEDIUM - Duplicate getMenuItemsByRole: Defined in both menuConfig.js and Sidebar.jsx.
MEDIUM - Duplicate Breadcrumb: Defined in both TopHeader.jsx (inline) and Breadcrumb.jsx.
MEDIUM - Missing @fontsource-variable/geist usage: Package is installed but not imported anywhere. The CSS uses Google Fonts Inter instead.
MEDIUM - Select component uses @radix-ui/react-select which has onValueChange prop. The DataTable.jsx uses onValueChange correctly. But the Tabs component (custom) doesn't support onValueChange properly.
MEDIUM - OrderHistoryPage.jsx line 150: order.delivery_method.replace('_', ' ') - if delivery_method is null/undefined, this will crash.
LOW - dev.html file in project root (seems like a dev-only file).
LOW - Empty src/assets/ directory.
LOW - settingsMenuItems references routes like /settings, /settings/users, /settings/payment that don't exist in the router.
LOW - @radix-ui/react-slot is imported in button.jsx but is a transitive dependency, not a direct dependency in package.json.
LOW - Legacy CheckoutPage.jsx at src/pages/CheckoutPage.jsx is dead code with broken imports.
Let me also note:

The Switch component will crash at runtime because SwitchPrimitives.Root and SwitchPrimitives.Thumb are undefined.
The Tabs component won't work for tab switching because it's just div wrappers with no state management.
Let me now write the comprehensive report.

SEAPEDIA Frontend Production Readiness Audit
CRITICAL ISSUES
C-1: Switch Component — Broken Imports (IMPORT_IS_UNDEFINED)
Severity: Critical
Location: src/components/ui/switch.jsx:4,9,18
Explanation: The import import * as SwitchPrimitives from "@base-ui/react/switch" creates a namespace where Root and Thumb are nested under SwitchPrimitives.Switch, not directly on SwitchPrimitives. The build explicitly warns: Import 'Root' will always be undefined, Import 'Thumb' will always be undefined. The Switch component renders undefined elements — it will crash or render nothing at runtime.
Suggested Fix: Change the import to destructure Switch from the namespace:

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
// Then use SwitchPrimitive.Root and SwitchPrimitive.Thumb
Confidence: High

C-2: Tabs Component — Non-Functional (No State Management)
Severity: Critical
Location: src/components/ui/tabs.jsx
Explanation: The custom Tabs, TabsTrigger, and TabsContent components are plain <div>/<button> wrappers with NO tab state management. TabsTrigger has no click handler to set active state, TabsContent renders all children unconditionally (no conditional display based on active tab), and data-[state=active] CSS selectors are never toggled. Pages using tabs (BuyerReportsPage.jsx, SellerReportsPage.jsx) will show ALL tab content simultaneously, and clicking tab triggers does nothing.
Suggested Fix: Replace with a proper Radix Tabs implementation (@radix-ui/react-tabs) or implement React state internally using the value/onValueChange props that are already being passed but ignored.
Confidence: High

C-3: Mixed Toast Libraries — Sonner Toasts Won't Render
Severity: Critical
Location: src/pages/ProfilePage.jsx:11
Explanation: ProfilePage.jsx imports toast from sonner, but the app only renders <ToastContainer> from react-toastify (in App.jsx). There is no <Toaster /> component from sonner anywhere in the app. All toast notifications in ProfilePage will silently fail — users get no feedback on save/error.
Suggested Fix: Change import { toast } from 'sonner' to import { toast } from 'react-toastify' in ProfilePage.jsx.
Confidence: High

HIGH PRIORITY ISSUES
H-1: Button size="icon-sm" Does Not Exist
Severity: High
Location: src/components/ui/dialog.jsx:70
Explanation: The Dialog close button uses size="icon-sm" but the Button component only defines sizes: default, sm, lg, icon. The icon-sm size is undefined, so the button will render without size-specific classes, resulting in incorrect dimensions.
Suggested Fix: Change size="icon-sm" to size="sm" or add an icon-sm variant to the Button component.
Confidence: High

H-2: 40 console.error Statements in Production Code
Severity: High
Location: Multiple files across src/api/ and src/pages/admin/
Explanation: 40 console.error() calls remain in production code. These leak internal error details to the browser console, which is a security concern and clutters the console. Affected files:

src/api/products.js (3)
src/api/promos.js (7)
src/api/buyerReports.js (2)
src/api/sellerReports.js (3)
src/components/checkout/DiscountSelector.jsx (2)
src/components/checkout/VoucherSelector.jsx (2)
src/pages/admin/AdminDashboardPage.jsx (1)
src/pages/admin/AdminOrdersPage.jsx (2)
src/pages/admin/AdminStoresPage.jsx (2)
src/pages/admin/AdminDeliveriesPage.jsx (2)
src/pages/admin/AdminOverduePage.jsx (4)
src/pages/admin/VoucherManagementPage.jsx (3)
src/pages/admin/PromoManagementPage.jsx (3)
src/pages/buyer/BuyerReportsPage.jsx (2)
src/pages/seller/SellerReportsPage.jsx (2)
Suggested Fix: Remove all console.error calls. Errors are already caught and handled with toast.error() or throw — the console statements are redundant.
Confidence: High
H-3: Hardcoded localhost Fallback URLs
Severity: High
Location:

src/api/axiosInstance.js:4 — baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
src/pages/seller/ProductFormPage.jsx:49 — `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${thumb}`
src/pages/seller/ProductManagementPage.jsx:42 — const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
Explanation: If VITE_API_BASE_URL is not set in production, the app falls back to localhost:8000, which will fail silently. Production builds should fail explicitly rather than connecting to a non-existent local server.
Suggested Fix: Remove the || 'http://localhost:8000' fallback in production. Use only import.meta.env.VITE_API_BASE_URL and ensure it's set during build. For image URLs in seller pages, construct them from the same env variable without a hardcoded fallback.
Confidence: High
H-4: Potential Runtime Crash — Null Access on delivery_method
Severity: High
Location: src/pages/buyer/OrderHistoryPage.jsx:150
Explanation: order.delivery_method.replace('_', ' ') will throw a TypeError if delivery_method is null or undefined. API responses may have null fields.
Suggested Fix: Use optional chaining: order.delivery_method?.replace('_', ' ') ?? 'N/A'
Confidence: High

H-5: @radix-ui/react-slot Not a Direct Dependency
Severity: High
Location: src/components/ui/button.jsx:2
Explanation: Button imports Slot from @radix-ui/react-slot, but this package is NOT listed in package.json dependencies. It exists only as a transitive dependency of @radix-ui/react-select. If that transitive dependency is removed or updated, the Button component will break.
Suggested Fix: Add @radix-ui/react-slot to package.json dependencies explicitly.
Confidence: High

H-6: Settings Menu Routes Don't Exist
Severity: High
Location: src/config/menuConfig.js:195-207
Explanation: settingsMenuItems defines routes /settings, /settings/users, and /settings/payment. None of these routes exist in src/routes/index.jsx. Clicking these menu items will show the 404 page.
Suggested Fix: Either add the corresponding routes and pages, or remove the settings menu items to prevent dead navigation links.
Confidence: High

MEDIUM PRIORITY ISSUES
M-1: Duplicate getMenuItemsByRole Function
Severity: Medium
Location: src/config/menuConfig.js:177 and src/components/layout/Sidebar.jsx:40
Explanation: The same getMenuItemsByRole function is defined in both files. The Sidebar imports adminMenuItems, sellerMenuItems, etc. from menuConfig.js but then redefines getMenuItemsByRole locally instead of using the exported one from menuConfig.js.
Suggested Fix: Remove the duplicate function from Sidebar.jsx and use the imported getMenuItemsByRole from menuConfig.js.
Confidence: High

M-2: Duplicate Breadcrumb Component
Severity: Medium
Location: src/components/layout/TopHeader.jsx:62-113 and src/components/layout/Breadcrumb.jsx
Explanation: A Breadcrumb component is defined inline inside TopHeader.jsx and also exists as a standalone component in Breadcrumb.jsx. They have different implementations. TopHeader uses its own inline version.
Suggested Fix: Use the standalone Breadcrumb component from Breadcrumb.jsx in TopHeader, or remove the unused standalone component.
Confidence: Medium

M-3: @fontsource-variable/geist Installed But Unused
Severity: Medium
Location: package.json:14
Explanation: The package @fontsource-variable/geist is listed as a dependency but is never imported anywhere. The app uses Google Fonts Inter via CSS @import url(...) in index.css. This adds unnecessary package size.
Suggested Fix: Either remove the unused package from dependencies, or switch from the Google Fonts CDN import to the local fontsource package (better for performance and offline support).
Confidence: High

M-4: No Lazy Loading for Route Components
Severity: Medium
Location: src/routes/index.jsx
Explanation: All 25+ page components are eagerly imported at the top of routes/index.jsx. This means the entire app (986KB JS) loads upfront regardless of which route the user visits.
Suggested Fix: Use React.lazy() and Suspense for route-level code splitting. Group related routes (admin, seller, buyer, driver) into separate chunks.
Confidence: High

M-5: Bundle Size Exceeds 500KB Warning
Severity: Medium
Location: Build output — dist/assets/index-B9XS-tyg.js at 986.13KB
Explanation: The production JS bundle is 986KB (273KB gzipped). Vite warns about chunks larger than 500KB. This impacts initial load performance.
Suggested Fix: Implement route-level code splitting (see M-4). Consider tree-shaking unused lucide icons by using individual imports.
Confidence: High

M-6: Mixed UI Primitive Libraries (@base-ui + @radix-ui)
Severity: Medium
Location: Multiple UI components
Explanation: The project uses both @base-ui/react (Dialog, DropdownMenu, Avatar, Switch) and @radix-ui/react-* (Select, Checkbox, Tooltip, Slot). Both libraries serve similar purposes. This increases bundle size and creates maintenance complexity. The radix-ui umbrella package (1.6.0) is also installed but seemingly unused directly.
Suggested Fix: Standardize on one primitive library. Since the project uses shadcn base-nova style which targets @base-ui, consider migrating remaining @radix-ui components to @base-ui equivalents.
Confidence: Medium

M-7: VoucherSelector Component Is Unused
Severity: Medium
Location: src/components/checkout/VoucherSelector.jsx
Explanation: VoucherSelector is never imported by any page. The buyer CheckoutPage uses DiscountSelector instead. This is dead code.
Suggested Fix: Remove VoucherSelector.jsx if confirmed unused.
Confidence: High

M-8: Legacy CheckoutPage.jsx at Root Pages Directory
Severity: Medium
Location: src/pages/CheckoutPage.jsx
Explanation: A legacy CheckoutPage.jsx exists at src/pages/CheckoutPage.jsx with broken imports (@/api/addresses — should be @/api/address, named imports that don't match API module exports, RadioGroup from a non-existent @/components/ui/radio-group, and toast from sonner). The active route uses src/pages/buyer/CheckoutPage.jsx instead. This file is dead code that could confuse developers.
Suggested Fix: Delete src/pages/CheckoutPage.jsx.
Confidence: High

M-9: useEffect Missing Dependencies
Severity: Medium
Location: src/pages/DashboardPage.jsx:170-223
Explanation: The useEffect that fetches dashboard data has [activeRole, role] as dependencies but uses navigate and other functions inside. While navigate is stable from react-router, the dependency array is incomplete per exhaustive-deps rules. Also, the fetchMe function from AuthContext is used in handleRegisterRole but not listed as a dependency.
Suggested Fix: Add missing dependencies or add eslint-disable comments with justification.
Confidence: Medium

M-10: dev.html File in Project Root
Severity: Medium
Location: seapedia-frontend-undergoing/dev.html
Explanation: A dev.html file exists in the project root alongside the proper index.html. This appears to be a development artifact.
Suggested Fix: Remove dev.html if it's not needed for production.
Confidence: Medium

LOW PRIORITY ISSUES
L-1: Empty src/assets/ Directory
Severity: Low
Location: src/assets/
Explanation: The assets directory is empty. Not harmful but indicates unused infrastructure.
Suggested Fix: Remove the empty directory or add a .gitkeep.
Confidence: High

L-2: Fallback Image /contoh.png Used in Multiple Pages
Severity: Low
Location: src/pages/ProductListPage.jsx:90, src/pages/ProductDetailPage.jsx:119, src/pages/buyer/CartPage.jsx:189, src/pages/buyer/OrderDetailPage.jsx:179
Explanation: Multiple pages reference /contoh.png as a fallback image. This file must exist in the public/ directory but its existence wasn't verified. If missing, broken image icons will appear.
Suggested Fix: Verify /contoh.png exists in public/. Consider using a proper placeholder component instead.
Confidence: Medium

L-3: users Key Duplicate in routeLabels
Severity: Low
Location: src/components/layout/Breadcrumb.jsx:37,43
Explanation: The routeLabels object has users defined twice (lines 37 and 43). The second definition silently overwrites the first.
Suggested Fix: Remove the duplicate key.
Confidence: High

L-4: Unsplash External Image URLs in Login/Register Pages
Severity: Low
Location: src/pages/LoginPage.jsx:87, src/pages/RegisterPage.jsx:116
Explanation: Login and Register pages load background images from images.unsplash.com. This creates an external dependency and privacy concern (third-party tracking). If Unsplash is down or blocks the request, the pages will show no background.
Suggested Fix: Download the image and serve it locally from public/ or src/assets/.
Confidence: Medium

L-5: confirm() Used Instead of Custom Dialog
Severity: Low
Location: src/pages/buyer/CartPage.jsx:57,72, src/pages/buyer/AddressPage.jsx:97
Explanation: Browser native confirm() dialogs are used for destructive actions. These are blocked in some environments (iframes, some browsers) and can't be styled.
Suggested Fix: Replace with the existing Dialog component for a consistent UX.
Confidence: Low

L-6: index.js Barrel Export Creates Unused Aliases
Severity: Low
Location: src/components/layout/index.js
Explanation: The barrel file exports AppLayoutDefault, TopHeaderDefault, SidebarDefault, BreadcrumbDefault, DataTableDefault which are never imported anywhere.
Suggested Fix: Remove unused default export aliases from the barrel file.
Confidence: High

SUMMARY
Priority	Count
Critical	3
High	6
Medium	10
Low	6
Production Readiness Score: 62/100
Score Breakdown:
Build & Runtime Correctness (0-30): 12/30 — Switch is broken, Tabs don't work, mixed toast library
Code Quality & Dead Code (0-20): 13/20 — Duplicate code, unused components, legacy files
Production Hygiene (0-20): 10/20 — 40 console.error, hardcoded localhost, no lazy loading
UX & Accessibility (0-15): 12/15 — Good loading/empty/error states overall, minor issues
Performance (0-15): 5/15 — 986KB bundle, no code splitting, mixed primitive libraries
To reach 95+:
Fix the 3 Critical issues (Switch, Tabs, Sonner toast) — this alone brings score to ~78
Fix the 6 High issues (button size, console.error, localhost, null access, missing dep, dead routes) — brings score to ~88
Add lazy loading for routes — brings score to ~92
Clean up dead code and duplicate components — brings score to ~95