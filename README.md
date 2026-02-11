# 🎨 Polished

**Multi-tenant SaaS booking platform for beauty studios**

The easy way to build a beauty studio booking system together 💅

A modern, high-performance booking system built for beauty studios (hair salons, nail studios, massage therapy, tattoo parlors) with multiple employees offering different services.

---

## 🚀 Tech Stack

- **Frontend:** Vue 3 (Composition API) + Vite
- **Backend:** Bun + tRPC (3x faster than Node.js)
- **Database:** PostgreSQL + Direct SQL (no ORM)
- **Validation:** Zod (runtime validation + TypeScript types)
- **Auth:** Custom JWT + Argon2id
- **Styling:** Tailwind CSS + Shadcn-Vue
- **Infrastructure:** Docker Compose

**Why this stack?**
- ✅ Platform-independent (no vendor lock-in)
- ✅ 75%+ cost savings (self-hostable)
- ✅ 3x performance boost (Bun vs Node.js)
- ✅ Full type safety (Zod + tRPC)
- ✅ Simple & maintainable (direct SQL, no ORM complexity)

---

## 📦 Project Structure

```
polished/
├── apps/
│   ├── api/              # Bun + tRPC backend
│   ├── web/              # Vue 3 public pages (SSR)
│   ├── admin/            # Vue 3 admin dashboard (SPA)
│   └── employee/         # Vue 3 employee portal (SPA)
├── packages/
│   ├── database/         # SQL migrations, Zod schemas, queries
│   ├── ui/               # Shadcn-Vue components
│   └── auth/             # JWT, password hashing
├── docs/
│   ├── architecture.md   # Technical architecture
│   ├── features.md       # UX/UI specifications
│   ├── finance.md        # Business plan
│   └── todo.md           # Implementation tracker
├── docker-compose.yml    # Local development services
└── turbo.json            # Monorepo configuration
```

---

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [Docker](https://www.docker.com/) >= 20.10.0
- [Docker Compose](https://docs.docker.com/compose/) >= 2.0.0

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/polished.git
cd polished
```

### 2. Install dependencies

```bash
bun install
```

### 3. Start Docker services

Start PostgreSQL, Redis, and MinIO:

```bash
docker-compose up -d
```

Check services are running:

```bash
docker-compose ps
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local development).

### 5. Run database migrations

```bash
bun run migrate
```

### 6. Start development servers

```bash
bun run dev
```

This starts:
- **API:** http://localhost:3001
- **Web:** http://localhost:5173 (Vite dev server)
- **Admin:** http://localhost:5174 (coming soon)
- **Employee:** http://localhost:5175 (coming soon)

### 7. Open in browser

- **API Health:** http://localhost:3001/health
- **Landing Page:** http://localhost:5173

---

## 🧪 Development

### Run tests

```bash
bun test
```

### Lint code

```bash
bun run lint
```

### Format code

```bash
bun run format
```

### Clean build artifacts

```bash
bun run clean
```

---

## 🗄️ Database

### Run migrations

```bash
bun run migrate
```

### Seed development data

```bash
bun run packages/database/scripts/seed.ts
```

### Connect to PostgreSQL

```bash
docker exec -it polished-postgres psql -U postgres -d polished
```

### Reset database

```bash
docker-compose down -v
docker-compose up -d
bun run migrate
```

---

## 🐳 Docker Services

### Start all services

```bash
docker-compose up -d
```

### Stop all services

```bash
docker-compose down
```

### View logs

```bash
docker-compose logs -f
```

### Service URLs

- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **MinIO Console:** http://localhost:9001 (minioadmin / minioadmin)
- **MinIO API:** http://localhost:9000

---

## 📚 Documentation

- **Architecture:** [docs/architecture.md](./docs/architecture.md)
- **Features & UX:** [docs/features.md](./docs/features.md)
- **Business Plan:** [docs/finance.md](./docs/finance.md)
- **Implementation Todo:** [docs/todo.md](./docs/todo.md)
- **Implementation Plan:** `.claude/plans/steady-waddling-key.md`

---

## 🎯 Current Status

**Phase:** Project Setup (Phase 2)
**Progress:** Foundation complete, starting core features

### ✅ Completed
- Turborepo monorepo structure
- Docker Compose for local development
- Bun backend skeleton
- Vue 3 frontend skeleton (web app)
- Database package structure
- Documentation (architecture, features, finance)

### 🚧 In Progress
- Database migrations
- tRPC API layer
- Landing page components

### 📋 Next Up
- Customer booking flow
- Admin dashboard
- WhatsApp integration

See [docs/todo.md](./docs/todo.md) for detailed progress tracking.

---

## 🤝 Contributing

This is currently a private project. Contributions guidelines coming soon.

---

## 📄 License

Proprietary - All rights reserved

---

## 🔗 Links

- **Documentation:** [docs/](./docs/)
- **Issues:** Coming soon
- **Roadmap:** [docs/todo.md](./docs/todo.md)

---

**Built with ❤️ for beauty professionals**
