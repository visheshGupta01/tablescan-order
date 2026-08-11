# TableScan Order

# Build a Complete Table-Based QR Menu & Ordering System for One Restaurant

Build a production-quality, mobile-first digital menu and table ordering system for **one restaurant/cafe**.

This is a restaurant-specific application.

Do NOT build:

* Multi-restaurant support

* SaaS/subscriptions

* Multi-tenancy

* Super-admin

* Restaurant onboarding

* POS

* Delivery

* Reservations

* Loyalty

* Inventory management

* Online payments

The product should focus on one excellent restaurant experience:

**Table QR → Digital Menu → Add to Cart → Place Order → Restaurant Receives Order → Staff Updates Status → Customer Tracks Order**

The application should be polished enough to demonstrate and deploy in a real restaurant.

---

# 1. TECHNOLOGY

### QR

Use a QR code library supporting:

* PNG

* SVG

Keep frontend API communication inside a clean service layer.

Do not place API calls directly inside UI components.

---

# 2. PRODUCT STRUCTURE

The application has two completely different experiences.

## Customer

Customers scan a QR code placed on a restaurant table.

They can:

* View the menu

* Search the menu

* Browse categories

* View item details

* Add items to cart

* Change quantities

* Add special instructions

* Place an order

* View order confirmation

* Track order status

Customers do NOT need an account.

---

## Restaurant Staff

Restaurant staff log into an admin dashboard.

They can:

* Manage menu items

* Manage categories

* Manage tables

* Generate table-specific QR codes

* Manage restaurant information

* Customize branding

* Receive orders

* Change order status

* View order history

* View basic analytics

---

# 3. CORE CUSTOMER FLOW

The most important flow is:

SCAN TABLE QR

↓

TABLE AUTOMATICALLY DETECTED

↓

RESTAURANT MENU

↓

BROWSE FOOD

↓

ADD TO CART

↓

REVIEW ORDER

↓

PLACE ORDER

↓

ORDER CONFIRMATION

↓

RESTAURANT RECEIVES ORDER

↓

STAFF UPDATES STATUS

↓

CUSTOMER TRACKS STATUS

Make this flow extremely fast and frictionless.

---

# 4. TABLE-SPECIFIC QR SYSTEM

Every restaurant table must have its own QR code.

Example:

Table 1

Table 2

Table 3

Table 4

Table 5

Each table has a unique random QR token.

Do NOT use the table number directly as the public identifier.

Example:

Table name:

Table 7

Internal QR token:

tbl_8f72kd92

Public URL:

/menu/table/tbl_8f72kd92

The customer should never manually enter the table number.

---

# 5. TABLE MODEL

Create a Table model:

```text

Table

- _id

- name

- qrToken

- isActive

- createdAt

- updatedAt

```

Requirements:

* qrToken must be unique

* qrToken must be difficult to guess

* Renaming a table must NOT change its qrToken

* Deactivating a table should disable ordering from that QR

Example:

Table 7

can later become:

VIP Table

while keeping the same QR code.

---

# 6. CUSTOMER MENU ROUTE

Use:

/menu/table/

Example:

/menu/table/tbl_8f72kd92

When this page loads:

1. Validate the QR token.

2. Find the associated table.

3. Verify that the table is active.

4. Load restaurant information.

5. Load categories.

6. Load menu items.

7. Display the menu.

8. Preserve the table context.

---

# 7. INVALID TABLE

If the QR token is invalid:

Show:

## Invalid Table

"This QR code is not associated with a valid restaurant table."

Do not expose technical errors.

---

# 8. INACTIVE TABLE

If the table is inactive:

Show:

## Table Unavailable

"This table is currently unavailable."

Do not allow customers to place orders.

---

# 9. CUSTOMER MENU DESIGN

The customer menu should look like a **premium restaurant website**, not an admin dashboard.

Design goals:

* Elegant

* Modern

* Minimal

* Mobile-first

* Fast

* Beautiful food imagery

* Clear pricing

* Easy navigation

* Excellent typography

* Smooth but subtle interactions

Avoid:

* Excessive gradients

* Excessive shadows

* Overly rounded cards

* Generic SaaS aesthetics

* Clutter

* Excessive animations

---

# 10. RESTAURANT HEADER

Display:

* Restaurant logo

* Restaurant name

* Cover image

* Description

* Open/closed status

* Opening hours

* Table number

* Location

* Phone

* Instagram

Example:

THE BREW HOUSE

Specialty Coffee • Brunch • Desserts

Table 7

● Open Now

---

# 11. TABLE INDICATOR

Show a subtle table indicator near the restaurant header:

Table 7

This reassures customers that they are ordering from the correct table.

Do not make it visually dominant.

---

# 12. MENU CATEGORIES

Example:

All

Coffee

Beverages

Starters

Main Course

Desserts

On mobile:

* Horizontal scrolling

* Sticky category navigation

Clicking a category should smoothly scroll to that section.

---

# 13. MENU ITEM

Each item should display:

* Food image

* Name

* Description

* Price

* Vegetarian indicator

* Spicy indicator

* Bestseller badge

* Availability

* Add button

Example:

### Cold Coffee

Creamy chilled coffee with vanilla and fresh milk.

₹180

VEG · BESTSELLER

[+ Add]

If unavailable:

SOLD OUT

The Add button must be disabled.

---

# 14. ITEM DETAILS

Clicking an item should open a mobile-friendly detail modal/page.

Display:

* Large image

* Item name

* Description

* Price

* Vegetarian

* Spicy

* Bestseller

* Availability

* Quantity selector

Example:

Cold Coffee

₹180

[-] 1 [+]

[Add to Cart]

---

# 15. SEARCH

Add a fast menu search.

Search across:

* Item names

* Descriptions

* Categories

Example:

Search menu...

If no result:

"No dishes found."

---

# 16. FEATURED ITEMS

Allow restaurant staff to mark items as:

Bestseller

Featured

Display a Popular/Bestsellers section near the top.

Do not show the section if no items are featured.

---

# 17. CART

Customers can add multiple items.

Cart should display:

Cold Coffee

₹180 × 2 = ₹360

Margherita Pizza

₹350 × 1 = ₹350

Total:

₹710

Allow:

* Increase quantity

* Decrease quantity

* Remove item

* Clear cart

Show a persistent mobile cart button when the cart contains items.

Example:

View Cart · 3 items · ₹710

---

# 18. CART PERSISTENCE

Persist the cart in browser storage.

The cart must be associated with the current table.

If a customer scans another table QR, do not accidentally carry over the previous table's cart.

Store enough information to distinguish:

* tableToken

* cartItems

* session

* createdAt

---

# 19. SPECIAL INSTRUCTIONS

Allow an optional note during checkout.

Example:

"Less spicy"

"No onions"

"Extra cheese"

Field:

Special instructions

Limit the length to a reasonable value.

---

# 20. CHECKOUT

Create a simple checkout page.

Display:

TABLE 7

Your Order

Cold Coffee × 2

₹360

Margherita Pizza × 1

₹350

Subtotal

₹710

Special instructions:

Less spicy

[Place Order]

Do NOT ask for:

* Login

* Password

* Email

* Phone number

Keep the ordering experience frictionless.

---

# 21. ORDER MODEL

Create:

```text

Order

- _id

- orderNumber

- tableId

- items

- subtotal

- total

- customerNote

- status

- createdAt

- updatedAt

```

Order item:

```text

OrderItem

- menuItemId

- itemName

- priceAtOrder

- quantity

- subtotal

```

IMPORTANT:

Store `itemName` and `priceAtOrder` as snapshots.

If the restaurant changes the menu price later, old orders must remain unchanged.

---

# 22. ORDER NUMBER

Generate human-readable order numbers.

Examples:

#1024

#1025

#1026

Show the order number to:

* Customer

* Restaurant staff

---

# 23. ORDER STATUS

Use:

PENDING

CONFIRMED

PREPARING

READY

COMPLETED

CANCELLED

Customer-facing labels:

Order Received

Confirmed

Preparing

Ready

Completed

---

# 24. ORDER CONFIRMATION

After successful order creation:

Show:

## ✓ Order Placed

Order #1024

Table 7

"Your order has been received by the restaurant."

Buttons:

[View Order Status]

[Back to Menu]

---

# 25. CUSTOMER ORDER STATUS

Route:

/order/

Show:

Order #1024

Table 7

### Order Status

✓ Order Received

✓ Confirmed

● Preparing

○ Ready

○ Completed

Also display:

* Ordered items

* Quantities

* Total

* Special instructions

---

# 26. CUSTOMER CAN PLACE MULTIPLE ORDERS

A customer can return to the menu after placing an order.

They can place another order from the same table.

Example:

Table 7

Order #1024 — ₹710 — COMPLETED

Order #1025 — ₹320 — PREPARING

Do not create one permanent order per table.

Each checkout creates a new order.

---

# 27. RESTAURANT ADMIN

Create:

/login

and:

/admin/dashboard

Admin navigation:

Dashboard

Orders

Menu

Categories

Tables

QR Codes

Analytics

Restaurant

Settings

Logout

---

# 28. ADMIN DASHBOARD

Show:

Orders Today

Pending Orders

Preparing Orders

Completed Orders

Today's Revenue

Active Tables

Example:

Orders Today

42

Pending

4

Preparing

7

Completed

31

Today's Revenue

₹12,840

Active Tables

18

Also show:

* Recent orders

* Popular menu items

* Quick actions

Quick actions:

* Add Menu Item

* Add Table

  View Orders

  Generate QR Codes

---

# 29. ORDER MANAGEMENT

Route:

/admin/orders

Create a restaurant-friendly Kanban board.

Columns:

NEW

CONFIRMED

PREPARING

READY

COMPLETED

Each order appears as a card.

Example:

```text

#1024

Table 7

2 × Cold Coffee

1 × Margherita Pizza

₹710

Less spicy

2 min ago

[Confirm]

```

---

# 30. ORDER ACTIONS

Staff can move orders:

PENDING

→ CONFIRMED

→ PREPARING

→ READY

→ COMPLETED

Allow cancellation where appropriate.

Require confirmation before cancellation.

Do NOT delete orders.

Cancelled orders remain in history.

---

# 31. ORDER DETAIL

Clicking an order should open a detailed view.

Show:

Order #1024

Table 7

7:42 PM

Items:

Cold Coffee

₹180 × 2

₹360

Margherita Pizza

₹350 × 1

₹350

Subtotal

₹710

Special instructions:

Less spicy

Status:

PREPARING

---

# 32. NEW ORDER NOTIFICATION

When a new order arrives:

Show a prominent notification:

🔔 New Order #1024

Table 7

₹710

If browser permissions allow:

* Play a subtle notification sound

* Highlight the Orders navigation item

If WebSockets are practical, use them.

Otherwise use polling with a reasonable interval.

---

# 33. CUSTOMER STATUS UPDATES

If real-time updates are practical, use WebSockets/SSE.

Otherwise periodically poll:

/api/public/orders/

The customer should see status changes without manually restarting the ordering flow.

---

# 34. MENU MANAGEMENT

Route:

/admin/menu

Features:

* Add item

* Edit item

* Delete item

* Search

* Filter by category

* Filter by availability

* Toggle availability

* Toggle bestseller

* Toggle spicy

* Reorder items

* Change category

Desktop:

Use table/list.

Mobile:

Use cards.

---

# 35. ADD MENU ITEM

Fields:

Name

Description

Price

Category

Image

Vegetarian

Spicy

Bestseller

Available

Use:

React Hook Form + Zod

Validate:

* Required name

* Positive price

* Required category

* Valid image

* Reasonable image size

Show image preview.

---

# 36. EDIT MENU ITEM

Allow editing all fields.

Changes should immediately reflect on the public menu.

Availability toggle should be especially fast.

Example:

Available → OFF

Public menu:

SOLD OUT

---

# 37. CATEGORY MANAGEMENT

Route:

/admin/categories

Features:

* Add category

* Rename category

* Delete category

* Reorder category

Example:

Coffee

Beverages

Starters

Main Course

Desserts

Warn before deleting categories containing items.

---

# 38. TABLE MANAGEMENT

Route:

/admin/tables

Features:

* Add table

* Rename table

* Delete table

* Activate/deactivate

* View QR

* Download QR

* View current orders

Example:

Table 1

Active

Current Orders: 0

Table 2

Active

Current Orders: 2

Table 3

Inactive

Current Orders: 0

---

# 39. QR CODE MANAGEMENT

Route:

/admin/qr-codes

Display all table QR codes.

For each table:

Table 1

[QR Preview]

[Download PNG]

[Download SVG]

[Print]

Also provide:

[Generate All QR Codes]

---

# 40. PRINTABLE QR CARD

Create a beautiful printable card:

THE BREW HOUSE

TABLE 7

[QR CODE]

Scan to View Menu & Order

The design should work for:

* Table stands

* Acrylic holders

* Laminated cards

* Printed cards

If practical, allow generating a printable PDF containing multiple QR cards per A4 page.

---

# 41. RESTAURANT SETTINGS

Route:

/admin/restaurant

Allow editing:

* Restaurant name

* Logo

* Cover image

* Description

* Phone

* Email

* Address

* Google Maps URL

* Instagram

* Website

* WhatsApp

* Opening hours

Automatically display:

Open Now

Closed

based on configured hours.

---

# 42. BRANDING

Allow:

* Primary color

* Accent color

* Background color

* Text color

* Menu template

Templates:

Modern

Elegant

Minimal

The public menu should dynamically reflect these settings.

---

# 43. ANALYTICS

Route:

/admin/analytics

Track:

* Menu views

* QR scans

* Item views

* Category views

* Orders

* Revenue

* Popular items

* Table activity

Filters:

Today

7 Days

30 Days

---

# 44. TABLE ANALYTICS

Show:

Table 1

124 menu views

8 orders

Table 2

98 menu views

5 orders

Table 3

176 menu views

12 orders

Show:

* Most active table

* Most ordered items

* Peak hours

* Orders by table

---

# 45. ORDER ANALYTICS

Show:

Orders Today

42

Revenue Today

₹12,840

Average Order Value

₹305

Most Ordered Item

Cold Coffee

Most Active Table

Table 7

Use simple, readable charts.

Do not build enterprise analytics.

---

# 46. DATABASE MODELS

## Restaurant

```text

_id

name

slug

description

logo

coverImage

phone

email

address

mapsUrl

instagramUrl

websiteUrl

whatsappNumber

openingHours

theme

template

isActive

createdAt

updatedAt

```

## User

```text

_id

name

email

passwordHash

role

createdAt

updatedAt

```

Roles:

OWNER

STAFF

## Category

```text

_id

name

displayOrder

isActive

createdAt

updatedAt

```

## MenuItem

```text

_id

categoryId

name

description

price

image

isVeg

isSpicy

isFeatured

isAvailable

displayOrder

createdAt

updatedAt

```

## Table

```text

_id

name

qrToken

isActive

createdAt

updatedAt

```

## Order

```text

_id

orderNumber

tableId

items

subtotal

total

customerNote

status

createdAt

updatedAt

```

## AnalyticsEvent

```text

_id

eventType

tableId

itemId

categoryId

sessionId

timestamp

```

---

# 47. IMPORTANT ORDER SECURITY

Never trust totals or prices from the frontend.

When creating an order:

1. Receive QR token.

2. Validate QR token.

3. Find active table.

4. Receive menu item IDs and quantities.

5. Fetch current menu items from database.

6. Validate each item.

7. Verify availability.

8. Fetch prices from database.

9. Calculate subtotal on the server.

10. Create order using server-calculated values.

Never trust:

* Client price

* Client total

* Client table ID

* Client restaurant ID

The QR token is the source for identifying the table.

---

# 48. PRICE SNAPSHOT

Suppose:

Cold Coffee

₹180

Customer orders it.

Later restaurant changes:

Cold Coffee

₹200

The old order must still display:

Cold Coffee

₹180

The new order must use:

₹200

---

# 49. MENU AVAILABILITY

If an item becomes unavailable:

* Show SOLD OUT

* Disable Add button

* Backend rejects new orders containing it

If it becomes unavailable while already in a customer's cart:

Show:

"Sorry, Cold Coffee is no longer available. Please review your cart."

---

# 50. API DESIGN

Authentication:

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/me

Restaurant:

GET /api/restaurant

PATCH /api/restaurant

Menu:

GET /api/menu

GET /api/menu-items

POST /api/menu-items

GET /api/menu-items/

PATCH /api/menu-items/

DELETE /api/menu-items/

PATCH /api/menu-items//availability

Categories:

GET /api/categories

POST /api/categories

PATCH /api/categories/

DELETE /api/categories/

PATCH /api/categories/reorder

Tables:

GET /api/tables

POST /api/tables

GET /api/tables/

PATCH /api/tables/

DELETE /api/tables/

PATCH /api/tables//status

GET /api/tables//qr

Public:

GET /api/menu/table/

Orders:

GET /api/orders

POST /api/orders

GET /api/orders/

PATCH /api/orders//status

POST /api/orders//cancel

Public order:

GET /api/public/orders/

Analytics:

GET /api/analytics/overview

GET /api/analytics/views

GET /api/analytics/orders

GET /api/analytics/revenue

GET /api/analytics/tables

---

# 51. AUTHENTICATION

Admin authentication:

* Email

* Password

* JWT

* HTTP-only cookies

* Protected routes

* Logout

Roles:

OWNER

STAFF

Staff should be able to manage orders and menus but do not need access to sensitive settings unless explicitly permitted.

---

# 52. SECURITY

Implement:

* Secure password hashing

* HTTP-only cookies

* Input validation

* Backend validation

* Protected admin routes

* Authorization

* Rate limiting on authentication

* CORS

* Secure headers

* Image validation

* Image size limits

* Allowed MIME types

* Never expose password hashes

* Never expose secrets to frontend

---

# 53. PERFORMANCE

The public menu must load very quickly.

Prioritize:

* Lazy loading images

* Optimized  images

* Responsive images

* Efficient database queries

* Database indexes

* Minimal unnecessary JavaScript

* Cached menu data where appropriate

The customer should be able to scan a QR and see the menu quickly even on a mediocre mobile connection.

---

# 54. RESPONSIVE DESIGN

Customer:

Mobile-first.

Support:

360px

390px

430px

Tablet

Desktop

Admin:

Desktop + mobile.

Restaurant staff must be able to:

* Accept orders

* Change order status

* Mark items unavailable

* Change prices

from a phone.

---

# 55. LOADING STATES

Implement:

* Skeleton loaders

* Button loading states

* Image upload progress

* Order submission state

* Analytics loading

* Table loading

Never show blank screens while loading.

---

# 56. EMPTY STATES

Create useful empty states.

Examples:

"No menu items yet."

"Add your first menu item."

"No tables yet."

"Create your first table."

"No orders yet."

"New customer orders will appear here."

"No analytics data yet."

---

# 57. ERROR STATES

Handle:

* Invalid table

* Inactive table

* Item unavailable

* Price changed

* Network error

* Order creation failure

* Menu loading failure

* Image upload failure

Use friendly messages.

Never expose raw database/API errors.

---

# 58. CUSTOMER ORDER SESSION

Customers do not need accounts.

Use a lightweight anonymous session for:

* Cart

* Order tracking

* Analytics

Do not collect unnecessary personal information.

---

# 59. CUSTOMER FOOTER

Show:

Restaurant name

Address

Phone

Opening hours

Instagram

Website

Keep it clean.

---

# 60. DEMO RESTAURANT

Create realistic demo data for:

## THE BREW HOUSE

Categories:

Coffee

Beverages

Starters

Main Course

Desserts

Items:

Cold Coffee — ₹180

Cappuccino — ₹160

Masala Chai — ₹100

Margherita Pizza — ₹350

Paneer Tikka — ₹280

Classic Burger — ₹320

Chocolate Brownie — ₹180

Cheesecake — ₹220

Create at least 8–12 realistic menu items with descriptions, images/placeholders, and appropriate attributes.

Create demo tables:

Table 1

Table 2

Table 3

Table 4

Table 5

Table 6

Table 7

Table 8

---

# 61. COMPONENT STRUCTURE

Organize the application cleanly.

Create a separate folder for types

Use hooks to comunicate from api to ui

Keep the components very separable and do not put everything in one file, make it layer wise.

Keep UI components separate from API logic.

---

# 62. ROUTES

Public:

/menu/table/

/order/

Admin:

/login

/admin/dashboard

/admin/orders

/admin/menu

/admin/categories

/admin/tables

/admin/qr-codes

/admin/analytics

/admin/restaurant

/admin/settings

---

# 63. MOBILE CUSTOMER UX

The bottom of the mobile screen should show a cart button when items are in the cart.

Example:

┌─────────────────────────┐

│ View Cart    3 items    │

│              ₹710       │

└─────────────────────────┘

This should be easy to tap with one hand.

---

# 64. MOBILE ORDER UX

The customer should be able to complete an order with minimal interaction.

Ideal flow:

Scan

↓

Menu

↓

Add

↓

Cart

↓

Place Order

↓

Track

Do not add unnecessary forms.

---

# 65. ADMIN MOBILE UX

The restaurant owner/staff should be able to manage the restaurant from a phone.

Prioritize:

* Orders

* Availability

* Menu editing

* Table management

Make order cards easy to read and buttons easy to tap.

---

# 66. PRINTABLE QR SYSTEM

Each table QR should contain:

Restaurant logo

Restaurant name

Table number

QR

"Scan to View Menu & Order"

Allow:

* PNG download

* SVG download

* Print

* Bulk generation

If PDF generation is practical, generate a printable A4 sheet containing multiple QR cards.

---

# 67. ORDER NOTIFICATION UX

When a new order arrives:

Show a visual notification.

Example:

🔔 NEW ORDER

#1024 · Table 7

₹710

The Orders section should show an unread/new indicator.

---

# 68. NO PAYMENT IN V1

Do NOT implement online payments.

For now:

Customer places order.

Restaurant prepares order.

Customer pays separately at the restaurant.

Keep the architecture clean enough that payment can be added later.

---

# 69. NO CUSTOMER LOGIN

Do NOT require customer registration.

The restaurant should never force customers to:

* Create accounts

* Enter email

* Enter phone

* Download an app

The QR menu must be frictionless.

---

# 70. FINAL CUSTOMER FLOW

Customer sits at Table 7.

↓

Scans Table 7 QR.

↓

THE BREW HOUSE

TABLE 7

↓

Browses:

Coffee

Beverages

Starters

Main Course

Desserts

↓

Adds:

2 × Cold Coffee

1 × Margherita Pizza

↓

Cart:

Cold Coffee × 2

₹360

Margherita Pizza × 1

₹350

Total:

₹710

↓

Adds:

"Less spicy"

↓

Place Order

↓

ORDER #1024

TABLE 7

✓ Order Received

● Confirmed

○ Preparing

○ Ready

○ Completed

---

# 71. FINAL RESTAURANT FLOW

Staff opens dashboard.

↓

NEW ORDER

#1024

TABLE 7

2 × Cold Coffee

1 × Margherita Pizza

₹710

↓

Confirm

↓

Preparing

↓

Ready

↓

Completed

Customer sees the status updates.

---

# 72. SUCCESS CRITERIA

The application is complete when this entire flow works:

1. Staff logs in.

2. Staff creates Table 7.

3. Staff generates Table 7 QR.

4. Customer scans QR.

5. Table 7 is automatically detected.

6. Menu loads.

7. Customer searches menu.

8. Customer opens item details.

9. Customer adds items.

10. Customer changes quantities.

11. Customer adds special instructions.

12. Customer reviews cart.

13. Backend validates table.

14. Backend validates item availability.

15. Backend fetches current prices.

16. Backend calculates total.

17. Order is created.

18. Customer receives order number.

19. Restaurant receives the order.

20. Staff confirms order.

21. Staff changes status to Preparing.

22. Staff changes status to Ready.

23. Staff completes order.

24. Customer sees the status.

25. Customer returns to menu.

26. Customer can place another order.

27. Staff can view order history.

28. Staff can view revenue/order analytics.

29. Staff can change menu prices.

30. Existing orders retain their original prices.

31. Staff can mark items sold out.

32. Sold-out items cannot be ordered.

33. Staff can manage tables.

34. Staff can regenerate/download/print QR codes.

35. Branding changes appear on the public menu.

The entire application should feel like a **real restaurant product**, not a prototype.

Prioritize:

**Reliability → Speed → Mobile UX → Clean design → Simple workflows**

Do not add unnecessary features.

The core product is:

# SCAN → MENU → ORDER → RESTAURANT → STATUS

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d1fe2978-2526-40a6-a466-c82e0c792822).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
