# nyakizu-digital-platform



# Nyakizu Digital Market: A Community-Based Digital Platform for Trusted Phone Accessories Trade in Kenya

 
# Abstract
Nyakizu Digital Market is a community-based digital platform concept designed to support Banyamulenge phone accessories traders in Kenya. The system focuses on wholesalers, hawkers who already trade through trusted relationships, WhatsApp communication, M-Pesa payments, notebooks, memory, and informal credit arrangements. The project does not aim to replace the existing trade culture. Instead, it aims to digitize the processes that traders already use, including product display, order management, payment records, credit tracking, supplier relationships, and offline business records. The name Nyakizu is inspired by the way traders refer to large supply places in Nairobi CBD, such as RNG Plaza, as major sources where many goods can be found. The proposed system will prioritize trusted supplier relationships before open seller discovery, hide exact stock quantities from buyers, support credit-based trade, and work in low-network environments through offline-first design. This concept note presents the background, problem, proposed solution, user roles, core requirements, and semester scope for the project.
Keywords: digital market, informal trade, phone accessories, Banyamulenge traders, inventory, credit ledger, offline-first system
 
Nyakizu Digital Market: A Community-Based Digital Platform for Trusted Phone Accessories Trade in Kenya
Introduction
Informal trade remains an important part of everyday economic activity in Kenya. Within the Banyamulenge refugee community, many youth and young adults are involved in selling phone accessories such as screen protectors, phone covers, chargers, earphones, cables, Bluetooth speakers, and power banks. This trade is not random or unstructured. It is built around personal relationships, trust, repeated buying, supplier loyalty, and flexible payment arrangements.
Nyakizu Digital Market is proposed as a Software Engineering Project concept to support this existing trade system. The platform will help traders manage product catalogs, orders, payment records, credit balances, and supplier relationships in a more organized way. The system is not designed as a general public marketplace similar to large e-commerce platforms. Instead, it is a digital layer that supports how the community already trades.
Nyakizu Digital Market does not change how the community trades. It gives them the tools to trade better.
Brand Name and Meaning
The project name is Nyakizu Digital Market. The short name is Nyakizu. The name is based on the lived trade language of Banyamulenge phone accessories traders in Nairobi, Kenya. Many wholesalers and hawkers source goods from larger wholesalers and importers located in Nairobi CBD, including major supply buildings such as RNG Plaza. Because such buildings are large and act as major sources of goods, traders commonly refer to them as Nyakizu.
In this project, Nyakizu represents a large source of goods, a major supply point, and a familiar place where traders expect to find what they need. Digital represents the main purpose of the system: to digitize existing trade processes such as product display, order records, payment tracking, debt follow-up, and supplier relationships. Market represents a place where traders can find goods, sellers, and supply options. In the context of this system, the market begins with trusted supplier relationships before it expands to broader seller discovery.
The recommended subtitle is A Community-Based Digital Market for Trusted Phone Accessories Trade. The recommended tagline is Digitizing Trusted Community Trade.
Background and Context
The Banyamulenge community in Kenya has developed a strong informal trade network around phone accessories. Many traders operate as wholesalers, hawkers, or small resellers. Wholesalers may hold stock directly, buy from larger wholesalers, or source goods from importers in Nairobi CBD. Hawkers and resellers then buy from these wholesalers and sell goods across Nairobi, towns, estates, streets, markets, and other informal trading spaces.
The most common products include screen protectors, phone covers, chargers, earphones, cables, Bluetooth speakers, power banks, and related mobile accessories. Screen protectors are especially important because they exist in many variations, including 3D, privacy, mirror, matte, plain glass, hydrogel, and anti-shock types. These variations also depend on many phone brands and models, making the product catalog difficult to manage manually.
The current trade system is strongly relationship-based. A hawker usually has a trusted wholesaler. In many cases, trusted buyers can take goods on credit, sell them, and pay later. These relationships are valuable and should not be disrupted. However, the tools used to manage the business are still mostly manual: WhatsApp chats, phone calls, notebooks, M-Pesa messages, memory, and verbal agreements.
Official Refugee Context and Estimated Market Size
Official refugee statistics are useful for understanding the broader refugee context in Kenya, but they do not provide a precise Banyamulenge-specific population count. Public refugee datasets usually classify people by country of origin, such as the Democratic Republic of the Congo, rather than by Banyamulenge community identity. Therefore, this project uses official refugee data for background context and community-informed estimates for the specific target group.
According to UNHCR and Government of Kenya operational data, Kenya hosted 624,336 refugees and 223,444 asylum-seekers as of April 30, 2026, giving a combined refugee and asylum-seeker population of 847,780. Within this population, there were 44,691 refugees and 21,658 asylum-seekers from the Democratic Republic of the Congo, giving a combined DRC-origin population of 66,349 in Kenya. Nairobi hosted 118,144 refugees and asylum-seekers, including 40,043 persons from the Democratic Republic of the Congo (United Nations High Commissioner for Refugees [UNHCR], 2026a, 2026b).
These official figures are important because many Banyamulenge refugees are classified within DRC-origin populations. However, the data does not provide a separate Banyamulenge-specific count. Based on community-informed estimates, the Banyamulenge population in Kenya is approximately 18,000 people. Field observations and informal community research conducted for this project suggest that about 52% of this population is directly or indirectly involved in the phone accessories trade, particularly among youth and young adults aged approximately 22-40 years. This gives an estimated trader population of about 9,360 individuals. This estimate should not be treated as an official census figure. It is a project estimate that requires further field validation through interviews, surveys, and observation among wholesalers, hawkers, and resellers.
Table 1
Official Refugee Context and Community-Informed Market Estimate
Data Point	Figure	Source / Notes
Total refugees in Kenya	624,336	UNHCR and Government of Kenya, Apr. 30, 2026
Total asylum-seekers in Kenya	223,444	UNHCR and Government of Kenya, Apr. 30, 2026
Total refugees and asylum-seekers in Kenya	847,780	Derived from official figures
DRC-origin refugees in Kenya	44,691	UNHCR and Government of Kenya, Apr. 30, 2026
DRC-origin asylum-seekers in Kenya	21,658	UNHCR and Government of Kenya, Apr. 30, 2026
Total DRC-origin refugees and asylum-seekers in Kenya	66,349	Derived from official figures
Nairobi refugees and asylum-seekers	118,144	UNHCR and Government of Kenya, Apr. 30, 2026
DRC-origin refugees and asylum-seekers in Nairobi	40,043	UNHCR and Government of Kenya, Apr. 30, 2026
Estimated Banyamulenge population in Kenya	18,000	Community-informed project estimate
Estimated share involved in phone accessories trade	52%	Field observation and informal research
Estimated Banyamulenge phone accessories traders	9,360	Derived project estimate

Problem Statement
The problem is not that Banyamulenge phone accessories traders lack a trading network. The network already exists. Traders already know their suppliers, buyers, products, and credit relationships. The real problem is that this existing trade network lacks suitable digital infrastructure.
Daily operations are still managed through WhatsApp, phone calls, notebooks, M-Pesa messages, memory, and physical product searches. These tools work at a small scale, but they create problems when a wholesaler manages many products, many buyers, many credit balances, and many changing orders.
The main problems include poor product organization, unclear order records, difficulty tracking credit and partial payments, lost information in WhatsApp conversations, and confusion when buyers change orders after packing has already started. Poor internet connectivity also affects traders who work in streets, markets, bus stages, and other low-network environments.
Table 2
Main Operational Problems
Problem	Effect on Traders
Product information is scattered across memory, WhatsApp, and photos	Buyers cannot easily see what a seller can supply.
Exact inventory is difficult to manage manually	Sellers may forget items or struggle to confirm availability.
Credit is tracked in notebooks or memory	Payment disputes and forgotten balances may occur.
Orders change repeatedly through WhatsApp	Sellers waste time unpacking and repacking goods.
M-Pesa payment references are not organized with order records	Payment confirmation becomes difficult.
Poor internet affects daily work	Traders need a system that can still work offline.

Purpose of the Project
The purpose of Nyakizu Digital Market is to digitize the daily trade processes of Banyamulenge phone accessories wholesalers, hawkers, and resellers in Kenya. The system aims to preserve the existing trust-based trading culture while improving how traders manage records, orders, payments, and customer relationships. It is not intended to replace WhatsApp, M-Pesa, or community trust. Instead, it organizes the business layer around them.
The project has five main objectives:
• To help sellers organize product catalogs and internal inventory records.
• To help hawkers order from trusted suppliers in a structured way.
• To provide a digital credit and debt ledger for pay-later trade.
• To reduce order confusion by locking orders once packing begins.
• To support low-network environments through offline-first design.
Proposed Solution
Nyakizu Digital Market will be a mobile-first Progressive Web App that supports the existing wholesaler-hawker trading relationship. Users will access the platform through a smartphone browser and may install it on their device like an app.
The buyer experience will begin with My Suppliers rather than public marketplace search. This design decision is important because most hawkers already have wholesalers they trust. The system should not encourage them to abandon those relationships. Instead, it should help them browse their trusted suppliers, place structured orders, view credit balances, and request products.
Seller discovery will still exist, but it will be secondary. A buyer may search for other verified sellers when their usual supplier does not deal in a certain item or when they need to expand their supply options. For sellers, the system will provide tools for product catalog management, internal stock tracking, availability status, order processing, payment confirmation, credit records, and buyer relationship management. Sellers will also control product visibility so that some products or prices are public, trusted-only, or hidden.
Important Business Rule: Hidden Exact Stock Quantity
A key design decision is that a wholesaler's buyer-facing storefront should not show exact stock quantities. In the real phone accessories trade, wholesalers do not only sell what they physically have in stock at the moment. If a loyal buyer places an order, the wholesaler may source the goods from a larger wholesaler, importer, or another trusted supplier. Therefore, displaying exact stock quantity may weaken the supplier-client relationship. If buyers see that their usual seller has low stock or no stock, they may leave and top up from another store, even though the wholesaler could have sourced the goods for them.
For this reason, exact stock quantity should be visible only to the seller inside the seller dashboard. Buyers should see simplified availability labels instead. The system should support two types of availability: physical stock, which refers to items currently in the seller's shop or storage, and sourcing availability, which refers to items the seller can obtain after receiving a client's order. This makes the system more realistic because it treats wholesalers as fulfillment partners, not only stock holders.
Table 3
Buyer-Facing Availability Labels
Availability Label	Meaning
Available	The seller can fulfill the order normally.
Available on Request	The seller may need to confirm or source the item.
Can Be Sourced	The seller does not currently have it but can obtain it.
Limited	The item may be available in small quantity, but exact stock is hidden.
Confirm with Seller	The seller must verify before accepting the order.
Unavailable	The seller cannot currently provide the item.

Target Users
Nyakizu Digital Market will serve three main user groups. The first version will focus on the relationship between verified wholesalers and hawkers. Other users, such as walk-in buyers and general public buyers, can be considered in future phases.
Table 4
System Users and Main Activities
User Role	Description	Main Activities
Admin / Moderator	Platform manager responsible for verification and moderation.	Verify sellers, manage categories, review disputes, and manage device models.
Verified Wholesaler	Seller who supplies phone accessories to hawkers and resellers.	Manage catalog, set prices, manage buyer access, process orders, and track credit.
Hawker / Reseller	Buyer who purchases from wholesalers and resells to final customers.	Browse trusted suppliers, place orders, track debts, and submit payment references.

Scope of the Concept
This concept is limited to defining the problem, proposed system, target users, main features, and technical direction. It is not a full project proposal, business model, or investor pitch. The project will focus on a realistic first version that can be developed within a semester. The system will not attempt to build a full national marketplace in the first phase. Instead, it will focus on the most important workflow: a trusted hawker ordering from a trusted wholesaler, recording payment, and tracking credit or debt.
Minimum Viable Product Scope
The MVP will include only the features necessary to test the core idea.
Table 5
MVP Features
Feature	Reason for Inclusion
User registration and login	Users need secure access to the system.
Role-based access	Buyers, sellers, and admins need different permissions.
Seller verification	Trust is central to the platform.
Seller storefront	Sellers need a digital place to display products.
Product catalog	Products need to be organized by category, brand, model, and variant.
Internal inventory tracking	Sellers need private stock records.
Availability status	Buyers need to know whether an item can be supplied.
Trusted supplier relationship	Hawkers need to connect with their usual wholesalers.
Order placement	Buyers need a structured way to order.
Order status and locking	Orders should not change after packing starts.
Manual M-Pesa payment record	Payments remain outside the system but records are saved.
Credit and debt ledger	Pay-later trade is a core business reality.
Offline draft records	Users need basic functions in low-network areas.
Basic admin dashboard	Admins need to verify sellers and manage core data.

Features Deferred to Future Phases
The following features are useful but should not be part of the first version:
• Multi-seller cart
• Full public marketplace browsing
• Buyer request board
• QR code walk-in stock checking
• Ratings and reviews
• SMS notifications
• Advanced promotions
• Dispatch fee calculator
• Advanced analytics
• Price alerts
• Automated stock reservation
These features may be considered after the MVP proves that traders will use the platform for supplier relationships, orders, credit, and records.
Product Catalog Design
The product catalog must reflect the complexity of phone accessories. A flat product list is not enough because sellers may deal with many phone brands, device models, and screen protector types. The catalog will use a structured hierarchy.
Table 6
Product Catalog Structure
Level	Name	Example
1	Category	Screen Protectors
2	Product Type	Privacy Glass
3	Brand Family	Samsung Galaxy
4	Device Model	Samsung A54
5	SKU / Variant	Samsung A54 Privacy 3D Screen Protector

Other categories may include phone covers, chargers, earphones, cables, Bluetooth speakers, power banks, and related mobile accessories. Sellers will be able to set product prices, pack sizes, minimum order quantities, visibility settings, and internal stock records. However, buyers will not see exact stock quantities.
Credit and Debt Ledger
Credit-based trade is a major part of the current system. Trusted hawkers may take stock from a wholesaler and pay after selling. This arrangement depends on trust, but it becomes difficult to manage when balances are recorded in notebooks, memory, or scattered WhatsApp messages.
Nyakizu Digital Market will include a credit and debt ledger as a core feature. When goods are given on credit, the system records the buyer, order, total amount, amount paid, remaining balance, due date, and payment history. Payment records should be append-only. This means that once a payment or credit record is created, it should not be deleted or silently edited. If a mistake is made, a correction entry should be added. This protects both buyers and sellers and reduces disputes.
Table 7
Credit Status Examples
Status	Meaning
Paid	Full amount has been received and confirmed.
Partially Paid	Buyer has paid part of the balance.
Pay Later	Seller has allowed the buyer to pay after selling.
Due on Date	Seller has set a payment deadline.
Overdue	Deadline has passed and balance is still unpaid.
Cleared	The debt has been fully settled.

Order Management
The system will provide a structured order process. A buyer selects items from a trusted seller's catalog, submits an order, views the seller's M-Pesa details, pays outside the system, and enters the payment reference. The seller then confirms payment and updates the order status.
The proposed order flow is: Pending -> Awaiting Payment -> Payment Confirmed -> Packing -> Dispatched -> Delivered. Once the order enters the Packing state, it should be locked. This means the buyer can no longer change the order. This feature addresses the common problem of buyers modifying orders after the seller has already started packing.
Offline-First Design
Many traders work in places where internet connection may be weak or unstable. For that reason, Nyakizu Digital Market should be designed as an offline-first Progressive Web App. The system should allow users to view last-synced catalogs, create draft orders, record payment notes, view recent balances, and prepare selected records while offline. When internet returns, the app should sync the saved actions.
Offline actions should be clearly marked using statuses such as Draft, Saved Offline, Pending Sync, Synced, Awaiting Seller Confirmation, and Confirmed. The system must be honest about offline data. For example, if a buyer is viewing product information while offline, the system should display a message such as: Available based on last sync. Confirm with seller before finalizing order. Certain actions should require internet, including final order confirmation, seller verification, public seller discovery, and administrative approval.
Functional Requirements
The following requirements summarize the main system functions at the concept stage.
Table 8
Summary of Functional Requirements
Area	Requirement Summary
User Management	The system shall allow users to register, log in, and access features based on role.
Verification	The system shall allow admins to approve or reject seller verification requests.
Trusted Relationships	The system shall allow hawkers to follow or request approval from wholesalers.
Catalog	The system shall allow sellers to manage a structured phone accessories catalog.
Internal Inventory	The system shall allow sellers to manage exact stock privately.
Availability Display	The system shall show buyers availability labels, not exact stock quantities.
Orders	The system shall allow approved buyers to place orders from trusted sellers.
Order Locking	The system shall lock orders once packing begins.
Payment Records	The system shall allow buyers to submit M-Pesa references and sellers to confirm payments.
Credit Ledger	The system shall track credit sales, partial payments, due dates, and overdue balances.
Offline Support	The system shall allow selected actions to be saved offline and synced later.
Audit Logs	The system shall keep records of important actions for dispute review.

Non-Functional Requirements
Table 9
Summary of Non-Functional Requirements
Category	Requirement
Usability	The system should be simple enough for informal traders with basic smartphone skills.
Mobile-First Design	The interface should be optimized for budget Android smartphones.
Performance	Pages should load quickly and use low data where possible.
Offline Tolerance	Selected features should work without continuous internet connection.
Security	The system should use secure authentication, HTTPS, input validation, and access control.
Privacy	Buyer records, debt records, and internal stock quantities should only be visible to authorized users.
Reliability	Offline actions should not disappear when network connection fails.
Data Integrity	Credit and payment records should be append-only.
Accessibility	The interface should have readable text, clear buttons, and sufficient contrast.
Scalability	The system should allow future expansion beyond the first user group.

Conceptual System Architecture
Nyakizu Digital Market will be designed as a full-stack web application. The frontend may be built using Next.js, TypeScript, and Tailwind CSS. The backend may use Django REST Framework with PostgreSQL as the database. The system may also use service workers and browser storage to support offline-first behavior.
The first version will not integrate directly with the M-Pesa API. Instead, sellers will display their M-Pesa payment details, and buyers will manually enter payment references after paying outside the system. This reduces technical and regulatory complexity at the concept stage.
Table 10
Proposed Technology Direction
Layer	Proposed Technology
Frontend	Next.js, TypeScript, Tailwind CSS
Backend	Django REST Framework
Database	PostgreSQL
Authentication	JWT-based authentication with role-based access
Offline Support	Progressive Web App features, local storage, sync queue
Deployment	Vercel for frontend; Render, Railway, or similar service for backend

This architecture is only a concept-level direction. Final technology choices may be adjusted during the system design phase.
Important User Flows
Hawker Orders From Trusted Wholesaler
A hawker logs in, opens My Suppliers, selects a trusted wholesaler, browses the catalog, checks availability status, creates an order, and submits it. The wholesaler confirms the order and starts processing it.
Seller Processes an Order
The wholesaler receives the order, confirms whether the requested items can be supplied, records payment status, and begins packing. Once packing starts, the order is locked.
Credit Sale
A wholesaler allows a trusted hawker to take goods and pay later. The system records the debt, due date, partial payments, and balance until the amount is cleared.
Offline Draft Order
A buyer creates an order while internet connection is weak. The system saves it as a draft or pending sync. When connection returns, the order is submitted for seller confirmation.
Seller Verification
A new seller submits verification details. The admin reviews the request and approves or rejects it. Only verified sellers can appear in buyer-facing areas.
Risks and Mitigation
Table 11
Main Risks and Mitigation Measures
Risk	Mitigation
Sellers may fail to update internal stock records.	Keep stock update tools simple and mobile-friendly.
Buyers may misunderstand availability labels.	Use clear wording such as Can Be Sourced and Confirm with Seller.
Wholesalers may fear exposing business information.	Hide exact stock quantities and support visibility controls.
Credit disputes may occur.	Use shared credit records and append-only payment history.
Users may resist moving from WhatsApp and notebooks.	Start with features that solve immediate pain, especially debt tracking.
Poor internet may affect usage.	Use offline-first design and pending sync.
Too many features may delay development.	Keep MVP focused on the wholesaler-hawker workflow.
Unverified sellers may reduce trust.	Require admin verification before seller visibility.

Semester Roadmap
This roadmap presents a possible development plan for a semester project.
Table 12
Proposed Semester Roadmap
Weeks	Main Work
1-2	Set up project structure, authentication, database, and user roles.
3-4	Build seller catalog, product hierarchy, and visibility controls.
5-6	Build trusted supplier relationship and buyer dashboard.
7-8	Build order placement, payment reference recording, and order status.
9-10	Build credit ledger, partial payments, due dates, and debt dashboard.
11-12	Build seller verification and basic admin dashboard.
13	Add offline draft records and pending sync behavior.
14	Test, polish mobile interface, deploy prototype, and prepare demonstration data.

Ethical and Social Considerations
The system will handle sensitive business information, including buyer relationships, payment records, debt balances, and seller stock records. Therefore, privacy and access control are important. Exact stock quantities should remain private to sellers. Debt records should only be visible to the involved buyer and seller. Admin access should be limited and logged.
The system should also avoid damaging existing community trust. For that reason, the design begins with trusted supplier relationships before open marketplace discovery. The aim is to support community trade, not to create unnecessary competition between sellers.
Because Banyamulenge-specific population and trade data are not officially disaggregated in public datasets, market estimates should be treated carefully. Further field validation through interviews and surveys will be necessary before making strong statistical claims.
Conclusion
Nyakizu Digital Market is a concept for a community-based digital platform that supports an existing informal trade network. It is not a generic online marketplace and it is not a business pitch. It is a Software Engineering Project concept built around a real trading problem: Banyamulenge phone accessories traders already have suppliers, buyers, trust, and products, but their records and processes are still scattered across WhatsApp, notebooks, phone calls, M-Pesa messages, and memory.
The proposed system focuses on digitizing the existing process rather than replacing it. It prioritizes trusted supplier relationships, hides exact stock quantities from buyers, supports credit and debt tracking, allows offline-first use, and gives traders a structured way to manage orders and records.
By focusing on the wholesaler-hawker relationship first, the project remains realistic for a semester build while still addressing a meaningful community problem. The concept is grounded in actual trade practices and can later be expanded after further field validation.
References
United Nations High Commissioner for Refugees. (2026a). Kenya: Operational data portal - refugees and asylum-seekers in Kenya as of April 30, 2026. UNHCR Operational Data Portal. https://data.unhcr.org/en/country/ken
United Nations High Commissioner for Refugees. (2026b). Kenya: Operational data portal - refugees and asylum-seekers in Nairobi as of April 30, 2026. UNHCR Operational Data Portal. https://data.unhcr.org/en/country/ken/187
Project field observation and community-informed estimates. (2026). Nyakizu Digital Market concept development notes. Unpublished raw data.
