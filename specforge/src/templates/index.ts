import type { SpecTemplate } from "@/types/spec"
import { DEFAULT_CONVENTIONS, DEFAULT_STACK } from "@/lib/defaults"

export const TEMPLATES: SpecTemplate[] = [
  // ─── SaaS ────────────────────────────────────────────────────────────────────
  {
    id: "saas",
    name: "SaaS App",
    description: "Multi-tenant SaaS with subscriptions, teams, and billing",
    type: "saas",
    icon: "Zap",
    tags: ["subscription", "teams", "billing", "dashboard"],
    spec: {
      version: "0.1.0",
      name: "",
      tagline: "",
      description: "",
      type: "saas",
      stack: { ...DEFAULT_STACK, auth: "nextauth", database: "postgresql", orm: "prisma" },
      features: [
        { id: "f1", name: "User authentication", description: "Email/password and OAuth sign-in with email verification", priority: "must", status: "planned" },
        { id: "f2", name: "Team workspaces", description: "Users can create and join teams, invite members by email", priority: "must", status: "planned" },
        { id: "f3", name: "Subscription billing", description: "Stripe integration for monthly/yearly plans with usage limits", priority: "must", status: "planned" },
        { id: "f4", name: "Admin dashboard", description: "User and team management for admins", priority: "should", status: "planned" },
        { id: "f5", name: "Usage analytics", description: "Track feature usage per team and surface in dashboard", priority: "could", status: "planned" },
      ],
      entities: [
        {
          id: "e1", name: "User", description: "Platform user account", timestamps: true, softDelete: false,
          fields: [
            { id: "f1", name: "name", type: "string", required: true },
            { id: "f2", name: "email", type: "email", required: true, unique: true },
            { id: "f3", name: "image", type: "url", required: false },
            { id: "f4", name: "role", type: "enum", required: true, default: "user", enumValues: ["user", "admin"] },
          ],
        },
        {
          id: "e2", name: "Team", description: "Organization workspace", timestamps: true, softDelete: true,
          fields: [
            { id: "f1", name: "name", type: "string", required: true },
            { id: "f2", name: "slug", type: "string", required: true, unique: true },
            { id: "f3", name: "plan", type: "enum", required: true, default: "free", enumValues: ["free", "pro", "enterprise"] },
          ],
        },
        {
          id: "e3", name: "TeamMember", description: "User's membership in a team", timestamps: true, softDelete: false,
          fields: [
            { id: "f1", name: "userId", type: "string", required: true },
            { id: "f2", name: "teamId", type: "string", required: true },
            { id: "f3", name: "role", type: "enum", required: true, default: "member", enumValues: ["owner", "admin", "member"] },
          ],
        },
      ],
      routes: [
        { id: "r1", method: "GET", path: "/api/teams", description: "List teams for current user", auth: true },
        { id: "r2", method: "POST", path: "/api/teams", description: "Create a new team", auth: true },
        { id: "r3", method: "GET", path: "/api/teams/:slug", description: "Get team details", auth: true },
        { id: "r4", method: "POST", path: "/api/teams/:slug/invite", description: "Invite a member to team", auth: true, roles: ["owner", "admin"] },
        { id: "r5", method: "GET", path: "/api/user/profile", description: "Get current user profile", auth: true },
        { id: "r6", method: "PATCH", path: "/api/user/profile", description: "Update user profile", auth: true },
      ],
      pages: [
        { id: "p1", name: "Landing", path: "/", description: "Marketing landing page with pricing", auth: false },
        { id: "p2", name: "Login", path: "/login", description: "Sign in page", auth: false },
        { id: "p3", name: "Register", path: "/register", description: "Create account page", auth: false },
        { id: "p4", name: "Dashboard", path: "/dashboard", description: "Main app dashboard", auth: true },
        { id: "p5", name: "Team settings", path: "/dashboard/settings", description: "Team configuration and members", auth: true },
        { id: "p6", name: "Billing", path: "/dashboard/billing", description: "Subscription and payment management", auth: true },
      ],
      integrations: [
        { id: "i1", name: "Stripe", provider: "stripe", purpose: "Subscription billing and payment processing", envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] },
        { id: "i2", name: "Resend", provider: "resend", purpose: "Transactional email — invites, welcome, billing receipts", envVars: ["RESEND_API_KEY"] },
      ],
      envVars: [
        { id: "ev1", key: "STRIPE_SECRET_KEY", description: "Stripe secret key for billing", required: true, example: "sk_test_..." },
        { id: "ev2", key: "STRIPE_WEBHOOK_SECRET", description: "Stripe webhook signing secret", required: true, example: "whsec_..." },
        { id: "ev3", key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", description: "Stripe publishable key", required: true, example: "pk_test_..." },
        { id: "ev4", key: "RESEND_API_KEY", description: "Resend API key for email", required: true, example: "re_..." },
      ],
      conventions: DEFAULT_CONVENTIONS,
      buildOrder: ["auth", "database", "api", "frontend", "integrations", "testing"],
      outOfScope: ["Mobile app", "Real-time features", "Custom domain support"],
    },
  },

  // ─── Marketplace ──────────────────────────────────────────────────────────────
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Two-sided marketplace with sellers, buyers, and payments",
    type: "marketplace",
    icon: "Store",
    tags: ["listings", "payments", "reviews", "search"],
    spec: {
      version: "0.1.0",
      name: "",
      tagline: "",
      description: "",
      type: "marketplace",
      stack: { ...DEFAULT_STACK },
      features: [
        { id: "f1", name: "Seller listings", description: "Sellers can create, edit, and manage product/service listings", priority: "must", status: "planned" },
        { id: "f2", name: "Buyer search", description: "Search and filter listings by category, price, and location", priority: "must", status: "planned" },
        { id: "f3", name: "Payments", description: "Stripe Connect for split payments between platform and sellers", priority: "must", status: "planned" },
        { id: "f4", name: "Reviews", description: "Buyers can leave reviews after completed transactions", priority: "should", status: "planned" },
        { id: "f5", name: "Messaging", description: "Direct messaging between buyers and sellers", priority: "could", status: "planned" },
      ],
      entities: [
        {
          id: "e1", name: "User", description: "Can be buyer, seller, or both", timestamps: true, softDelete: false,
          fields: [
            { id: "f1", name: "name", type: "string", required: true },
            { id: "f2", name: "email", type: "email", required: true, unique: true },
            { id: "f3", name: "role", type: "enum", required: true, default: "buyer", enumValues: ["buyer", "seller", "both", "admin"] },
            { id: "f4", name: "stripeAccountId", type: "string", required: false, notes: "Stripe Connect account for sellers" },
          ],
        },
        {
          id: "e2", name: "Listing", description: "A product or service for sale", timestamps: true, softDelete: true,
          fields: [
            { id: "f1", name: "title", type: "string", required: true },
            { id: "f2", name: "description", type: "text", required: true },
            { id: "f3", name: "price", type: "number", required: true, notes: "In cents" },
            { id: "f4", name: "category", type: "string", required: true },
            { id: "f5", name: "status", type: "enum", required: true, default: "draft", enumValues: ["draft", "active", "sold", "archived"] },
            { id: "f6", name: "sellerId", type: "string", required: true },
          ],
        },
        {
          id: "e3", name: "Order", description: "A completed purchase", timestamps: true, softDelete: false,
          fields: [
            { id: "f1", name: "listingId", type: "string", required: true },
            { id: "f2", name: "buyerId", type: "string", required: true },
            { id: "f3", name: "amount", type: "number", required: true, notes: "In cents" },
            { id: "f4", name: "status", type: "enum", required: true, default: "pending", enumValues: ["pending", "paid", "completed", "refunded"] },
            { id: "f5", name: "stripePaymentIntentId", type: "string", required: false },
          ],
        },
      ],
      routes: [
        { id: "r1", method: "GET", path: "/api/listings", description: "Search and filter listings", auth: false },
        { id: "r2", method: "POST", path: "/api/listings", description: "Create a listing", auth: true, roles: ["seller", "both"] },
        { id: "r3", method: "PATCH", path: "/api/listings/:id", description: "Update a listing", auth: true },
        { id: "r4", method: "DELETE", path: "/api/listings/:id", description: "Archive a listing", auth: true },
        { id: "r5", method: "POST", path: "/api/orders", description: "Create an order / initiate payment", auth: true },
        { id: "r6", method: "POST", path: "/api/webhooks/stripe", description: "Handle Stripe payment webhooks", auth: false },
      ],
      pages: [
        { id: "p1", name: "Home", path: "/", description: "Featured listings and search", auth: false },
        { id: "p2", name: "Listing detail", path: "/listings/:id", description: "Full listing with buy button", auth: false },
        { id: "p3", name: "Seller dashboard", path: "/dashboard/seller", description: "Manage listings and orders", auth: true },
        { id: "p4", name: "Buyer orders", path: "/dashboard/orders", description: "Purchase history", auth: true },
      ],
      integrations: [
        { id: "i1", name: "Stripe Connect", provider: "stripe", purpose: "Split payments between platform and sellers", envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
      ],
      envVars: [
        { id: "ev1", key: "STRIPE_SECRET_KEY", description: "Stripe secret key", required: true, example: "sk_test_..." },
        { id: "ev2", key: "STRIPE_WEBHOOK_SECRET", description: "Webhook signing secret", required: true, example: "whsec_..." },
      ],
      conventions: DEFAULT_CONVENTIONS,
      buildOrder: ["auth", "database", "api", "frontend", "integrations", "testing"],
      outOfScope: ["Mobile app", "Real-time chat", "Shipping integration"],
    },
  },

  // ─── API Backend ──────────────────────────────────────────────────────────────
  {
    id: "api",
    name: "REST API",
    description: "Standalone REST API with auth, CRUD, and documentation",
    type: "api",
    icon: "Code2",
    tags: ["rest", "api", "backend", "crud"],
    spec: {
      version: "0.1.0",
      name: "",
      tagline: "",
      description: "",
      type: "api",
      stack: { ...DEFAULT_STACK, frontend: "nextjs" },
      features: [
        { id: "f1", name: "JWT authentication", description: "API key and JWT token auth for all protected endpoints", priority: "must", status: "planned" },
        { id: "f2", name: "CRUD resources", description: "Full create/read/update/delete for all entities", priority: "must", status: "planned" },
        { id: "f3", name: "Input validation", description: "Zod schema validation on all request bodies", priority: "must", status: "planned" },
        { id: "f4", name: "Rate limiting", description: "Per-IP and per-user rate limiting on all endpoints", priority: "should", status: "planned" },
        { id: "f5", name: "API documentation", description: "Auto-generated OpenAPI spec and Swagger UI", priority: "should", status: "planned" },
      ],
      entities: [],
      routes: [],
      pages: [
        { id: "p1", name: "API docs", path: "/docs", description: "Swagger UI for API documentation", auth: false },
      ],
      integrations: [],
      envVars: [
        { id: "ev1", key: "JWT_SECRET", description: "Secret for signing JWT tokens", required: true, example: "your-256-bit-secret" },
        { id: "ev2", key: "API_RATE_LIMIT", description: "Max requests per minute per IP", required: false, example: "100" },
      ],
      conventions: {
        ...DEFAULT_CONVENTIONS,
        apiResponseShape: '{ success: boolean, data?: T, error?: { code: string, message: string }, meta?: { page: number, total: number } }',
      },
      buildOrder: ["auth", "database", "api", "testing"],
      outOfScope: ["Frontend UI", "Admin panel", "Real-time WebSocket"],
    },
  },

  // ─── Blog / CMS ──────────────────────────────────────────────────────────────
  {
    id: "blog",
    name: "Blog / CMS",
    description: "Content-driven blog with admin CMS and SEO",
    type: "blog",
    icon: "FileText",
    tags: ["content", "cms", "seo", "markdown"],
    spec: {
      version: "0.1.0",
      name: "",
      tagline: "",
      description: "",
      type: "blog",
      stack: { ...DEFAULT_STACK, auth: "nextauth" },
      features: [
        { id: "f1", name: "Post editor", description: "Rich markdown editor with image upload for authors", priority: "must", status: "planned" },
        { id: "f2", name: "Categories and tags", description: "Organize posts by category and tag with filtered views", priority: "must", status: "planned" },
        { id: "f3", name: "SEO optimization", description: "Dynamic meta tags, OG images, sitemap, and robots.txt", priority: "must", status: "planned" },
        { id: "f4", name: "Comments", description: "Authenticated commenting with moderation queue", priority: "should", status: "planned" },
        { id: "f5", name: "Newsletter", description: "Email list capture and newsletter broadcast", priority: "could", status: "planned" },
      ],
      entities: [
        {
          id: "e1", name: "Post", description: "A blog post", timestamps: true, softDelete: true,
          fields: [
            { id: "f1", name: "title", type: "string", required: true },
            { id: "f2", name: "slug", type: "string", required: true, unique: true },
            { id: "f3", name: "content", type: "text", required: true, notes: "Markdown" },
            { id: "f4", name: "excerpt", type: "text", required: false },
            { id: "f5", name: "coverImage", type: "url", required: false },
            { id: "f6", name: "status", type: "enum", required: true, default: "draft", enumValues: ["draft", "published", "archived"] },
            { id: "f7", name: "publishedAt", type: "date", required: false },
            { id: "f8", name: "authorId", type: "string", required: true },
          ],
        },
        {
          id: "e2", name: "Category", description: "Post category", timestamps: false, softDelete: false,
          fields: [
            { id: "f1", name: "name", type: "string", required: true },
            { id: "f2", name: "slug", type: "string", required: true, unique: true },
          ],
        },
      ],
      routes: [
        { id: "r1", method: "GET", path: "/api/posts", description: "List published posts with pagination", auth: false },
        { id: "r2", method: "POST", path: "/api/posts", description: "Create a new post", auth: true, roles: ["author", "admin"] },
        { id: "r3", method: "PATCH", path: "/api/posts/:slug", description: "Update a post", auth: true },
        { id: "r4", method: "DELETE", path: "/api/posts/:slug", description: "Archive a post", auth: true },
      ],
      pages: [
        { id: "p1", name: "Blog home", path: "/", description: "Featured and recent posts", auth: false },
        { id: "p2", name: "Post detail", path: "/posts/:slug", description: "Full post content", auth: false },
        { id: "p3", name: "Category", path: "/categories/:slug", description: "Posts filtered by category", auth: false },
        { id: "p4", name: "Admin", path: "/admin", description: "CMS dashboard for managing posts", auth: true },
        { id: "p5", name: "Post editor", path: "/admin/posts/new", description: "Create and edit posts", auth: true },
      ],
      integrations: [
        { id: "i1", name: "Uploadthing", provider: "uploadthing", purpose: "Image uploads for post cover images", envVars: ["UPLOADTHING_SECRET", "UPLOADTHING_APP_ID"] },
      ],
      envVars: [
        { id: "ev1", key: "UPLOADTHING_SECRET", description: "Uploadthing secret key", required: true, example: "sk_live_..." },
        { id: "ev2", key: "UPLOADTHING_APP_ID", description: "Uploadthing app ID", required: true, example: "abc123" },
      ],
      conventions: DEFAULT_CONVENTIONS,
      buildOrder: ["auth", "database", "api", "frontend", "testing"],
      outOfScope: ["Video hosting", "Podcast support", "Paid subscriber walls"],
    },
  },

  // ─── Blank ───────────────────────────────────────────────────────────────────
  {
    id: "blank",
    name: "Blank canvas",
    description: "Start from scratch — full control, best practices enforced",
    type: "blank",
    icon: "Plus",
    tags: ["custom", "flexible"],
    spec: {
      version: "0.1.0",
      name: "",
      tagline: "",
      description: "",
      type: "blank",
      stack: { ...DEFAULT_STACK },
      features: [],
      entities: [],
      routes: [],
      pages: [],
      integrations: [],
      envVars: [],
      conventions: DEFAULT_CONVENTIONS,
      buildOrder: ["auth", "database", "api", "frontend", "testing"],
      outOfScope: [],
    },
  },
]
