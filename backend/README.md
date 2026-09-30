# SIH26099: AI-Driven Standardization & Harmonization of Material Codes Across CPSEs

Production-ready, enterprise-grade central application backend built with **Java 17+ and Spring Boot 3.x**.

---

## 1. System Architecture

```text
                    React Frontend
                         │
                    REST / JSON (Bearer JWT)
                         │
                         ▼
                ┌─────────────────┐
                │   Spring Boot   │  (Port 8080)
                │     Backend     │
                └───────┬─────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
             JPA                 HTTP (WebClient)
              │                   │
              ▼                   ▼
         PostgreSQL          Python FastAPI
       (Port 5432)             ML Service
                              (Port 8000)
                                  │
                                  ▼
                            NLP / Embeddings /
                           Attribute Extraction
```

### Critical Architectural Boundaries
* **Strict Frontend Isolation**: The React frontend communicates strictly with Spring Boot. React **never** connects directly to PostgreSQL, the Python FastAPI ML service, or internal AI models.
* **Orchestrator Role**: Spring Boot acts as the central API gateway, data custodian, and transaction coordinator.
* **Deterministic AI & Traceability**: Spring Boot preserves raw original descriptions, normalized forms, extracted attributes, and hybrid match explanations. Fake AI (`Math.random()`) and hardcoded confidence values are strictly prohibited. If the ML service is down, controlled `503 AI_SERVICE_UNAVAILABLE` errors are returned.

---

## 2. Technology Stack

* **Language**: Java 17 (Eclipse Temurin)
* **Framework**: Spring Boot 3.3.4
* **Security**: Spring Security 6, JWT (`jjwt` 0.12.6), BCrypt
* **Persistence**: Spring Data JPA, Hibernate 6, PostgreSQL 16
* **Database Migrations**: Flyway Core & Flyway PostgreSQL
* **Parsing**: Apache POI 5.3.0 (Excel XLSX/XLS), Apache Commons CSV 1.11.0, Jackson
* **String Similarity**: Apache Commons Text 1.12.0 (Levenshtein Distance, Token Jaccard)
* **Reactive HTTP Client**: Spring WebFlux WebClient
* **API Documentation**: OpenAPI 3.0 / Swagger UI (`springdoc-openapi-starter-webmvc-ui` 2.6.0)
* **Monitoring & Health**: Spring Boot Actuator
* **Testing**: JUnit 5, Mockito, Spring Security Test, MockMvc, H2 in-memory DB

---

## 3. Project Structure

```text
backend/
├── pom.xml
├── .env.example
├── README.md
└── src/
    ├── main/
    │   ├── java/com/sih/material/
    │   │   ├── SihMaterialApplication.java
    │   │   ├── config/
    │   │   │   ├── SecurityConfig.java
    │   │   │   ├── CorsConfig.java
    │   │   │   ├── OpenApiConfig.java
    │   │   │   ├── WebClientConfig.java
    │   │   │   └── AsyncConfig.java
    │   │   ├── controller/
    │   │   │   ├── AuthController.java
    │   │   │   ├── MaterialController.java
    │   │   │   ├── UploadController.java
    │   │   │   ├── JobController.java
    │   │   │   ├── HarmonizationController.java
    │   │   │   ├── ReviewController.java
    │   │   │   ├── TaxonomyController.java
    │   │   │   ├── CanonicalMaterialController.java
    │   │   │   ├── AnalyticsController.java
    │   │   │   ├── AdminController.java
    │   │   │   └── CpseController.java
    │   │   ├── service/
    │   │   │   ├── AuthService.java
    │   │   │   ├── UserService.java
    │   │   │   ├── CpseService.java
    │   │   │   ├── MaterialService.java
    │   │   │   ├── UploadService.java
    │   │   │   ├── JobService.java
    │   │   │   ├── HarmonizationService.java
    │   │   │   ├── ReviewService.java
    │   │   │   ├── TaxonomyService.java
    │   │   │   ├── CanonicalMaterialService.java
    │   │   │   ├── AnalyticsService.java
    │   │   │   ├── AuditService.java
    │   │   │   ├── AiService.java
    │   │   │   └── DataInitializer.java
    │   │   ├── repository/
    │   │   │   ├── UserRepository.java
    │   │   │   ├── CpseRepository.java
    │   │   │   ├── MaterialRepository.java
    │   │   │   ├── MaterialAttributeRepository.java
    │   │   │   ├── CanonicalMaterialRepository.java
    │   │   │   ├── MaterialMatchRepository.java
    │   │   │   ├── ReviewRepository.java
    │   │   │   ├── TaxonomyRepository.java
    │   │   │   ├── ProcessingJobRepository.java
    │   │   │   └── AuditLogRepository.java
    │   │   ├── entity/
    │   │   │   ├── User.java
    │   │   │   ├── Cpse.java
    │   │   │   ├── Material.java
    │   │   │   ├── MaterialAttribute.java
    │   │   │   ├── CanonicalMaterial.java
    │   │   │   ├── MaterialMatch.java
    │   │   │   ├── Review.java
    │   │   │   ├── Taxonomy.java
    │   │   │   ├── ProcessingJob.java
    │   │   │   └── AuditLog.java
    │   │   ├── dto/
    │   │   ├── security/
    │   │   │   ├── JwtService.java
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   ├── CustomUserDetailsService.java
    │   │   │   └── SecurityUser.java
    │   │   ├── exception/
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   └── ...
    │   │   └── util/
    │   │       ├── FileParser.java
    │   │       ├── CsvParser.java
    │   │       ├── ExcelParser.java
    │   │       ├── JsonFileParser.java
    │   │       └── ValidationUtil.java
    │   └── resources/
    │       ├── application.yml
    │       └── db/migration/
    │           ├── V1__create_users.sql
    │           ├── V2__create_cpse.sql
    │           ├── V3__create_materials.sql
    │           ├── V4__create_attributes.sql
    │           ├── V5__create_taxonomy.sql
    │           ├── V6__create_canonical_materials.sql
    │           ├── V7__create_matches.sql
    │           ├── V8__create_reviews.sql
    │           ├── V9__create_processing_jobs.sql
    │           ├── V10__create_audit_logs.sql
    │           └── V11__seed_data.sql
    └── test/java/com/sih/material/
```

---

## 4. Default Seed Credentials (Development Only)

| Employee ID | Role | Password | Description |
| :--- | :--- | :--- | :--- |
| **`ADM001`** | `ADMIN` | `password` | System Administrator (Full platform access) |
| **`REV001`** | `REVIEWER` | `password` | Material Harmonization Reviewer (Review Queue) |
| **`USR001`** | `USER` | `password` | CPSE Officer (Catalog view & file upload) |

---

## 5. REST API Documentation

Once the server is running, the interactive Swagger UI documentation is available at:
`http://localhost:8080/swagger-ui.html`

### Authentication (`/api/auth`)
* `POST /api/auth/login` — Authenticate and receive Bearer JWT.
* `GET  /api/auth/me` — Inspect current user session details.
* `POST /api/auth/logout` — Invalidate session state and log audit entry.

### Materials Catalog (`/api/materials`)
* `GET    /api/materials` — Paginated, filtered by `cpseId`, `category`, `status`, `material`, `grade`.
* `GET    /api/materials/{id}` — Detail view with extracted attributes.
* `GET    /api/materials/search` — Database full-text search across codes and descriptions.
* `POST   /api/materials` — Manually add material.
* `PUT    /api/materials/{id}` — Update material specifications and attributes.
* `DELETE /api/materials/{id}` — Soft delete / mark status as `REJECTED`.

### Batch File Upload & Ingestion (`/api/materials/upload`)
* `POST /api/materials/upload` — Multipart file upload (`CSV`, `XLSX`, `JSON`). Returns `jobId` and `status: QUEUED`. Ingestion executes asynchronously.

### Background Job Tracking (`/api/jobs`)
* `GET /api/jobs/{jobId}` — Poll real-time progress (`0-100%`), processed records, and error counts.
* `GET /api/jobs` — Paginated list of batch jobs.

### AI Harmonization & Duplicate Detection (`/api/harmonization`)
* `POST /api/harmonization/match` — Execute hybrid matching pipeline.
* `GET  /api/harmonization/results` — Filterable list of match candidate pairs.
* `GET  /api/harmonization/{id}` — Match details with explainable scores and conflict notes.
* `GET  /api/harmonization/duplicates` — Cross-CPSE equivalent groups.

### Human Review Queue (`/api/reviews`)
* `GET  /api/reviews` — Paginated review tasks.
* `GET  /api/reviews/{id}` — Single review detail.
* `POST /api/reviews/{id}/approve` — Transactional approval: updates match, links canonical, sets status `HARMONIZED`.
* `POST /api/reviews/{id}/reject` — Rejects match and keeps items separate.
* `POST /api/reviews/{id}/modify` — Applies custom canonical code or overrides attributes.

### Master Canonical Materials (`/api/canonical-materials`)
* `GET  /api/canonical-materials` — Searchable catalog of unified standards.
* `GET  /api/canonical-materials/{id}` — Single canonical record.
* `POST /api/canonical-materials` — Create standardized item (Admin/Reviewer).
* `PUT  /api/canonical-materials/{id}` — Update specification standard.

### Hierarchical Taxonomy (`/api/taxonomy`)
* `GET    /api/taxonomy` — Recursive multi-level category tree.
* `GET    /api/taxonomy/{id}` — Single category node.
* `POST   /api/taxonomy` — Add category node (Admin only).
* `PUT    /api/taxonomy/{id}` — Edit category node (Admin only).
* `DELETE /api/taxonomy/{id}` — Deactivate category node (Admin only).

### Real-Time Analytics (`/api/analytics`)
* `GET /api/analytics/overview` — Dashboard summary metrics.
* `GET /api/analytics/materials` — Category and status breakdowns.
* `GET /api/analytics/harmonization` — Match confidence distributions.
* `GET /api/analytics/reviews` — Approval rates and reviewer activity.
* `GET /api/analytics/cpse` — CPSE participation and harmonization rates.

### Administration & Health (`/api/admin`)
* `GET   /api/admin/users` — User management directory.
* `POST  /api/admin/users` — Create user account.
* `PUT   /api/admin/users/{id}` — Update credentials and roles.
* `PATCH /api/admin/users/{id}/status` — Enable or disable accounts.
* `GET   /api/admin/audit-logs` — Immutable audit trail of system events.
* `GET   /api/admin/model-status` — Python FastAPI ML service connection test.
* `GET   /api/admin/system-status` — JVM uptime, memory, and database status.

---

## 6. Hybrid Matching Engine

The harmonization engine computes equivalence using a weighted multi-factor formula:

$$\text{Final Confidence} = (w_s \cdot \text{Semantic}) + (w_l \cdot \text{Lexical}) + (w_a \cdot \text{Attribute}) - \text{Domain Penalty}$$

* **Semantic Score ($w_s = 0.40$)**: Vector embedding cosine similarity generated via the FastAPI ML service.
* **Lexical Score ($w_l = 0.25$)**: Token Jaccard overlap combined with normalized Levenshtein edit distance.
* **Attribute Score ($w_a = 0.35$)**: Multi-attribute comparison over item type, material grade, thread diameter, length, and pressure rating.
* **Domain Rule Penalties**: Engineering dimension conflicts (e.g. $50\text{ mm}$ length vs $100\text{ mm}$ length) apply explicit confidence penalties even if lexical text matches closely.

---

## 7. Local Development Setup (PostgreSQL)

### Prerequisites
* Java 17+
* Maven 3.8+
* PostgreSQL 14+ installed and running locally

### Setup & Run
1. In pgAdmin, connect to your PostgreSQL server. Right-click **Databases** → **Create** → **Database**, enter `sih_material_db` as the database name, set the owner to `postgres`, and save. The app cannot create this database itself; Flyway creates the tables after the database exists.
2. In the same VS Code terminal where you will run Maven, set the password for your PostgreSQL `postgres` user. For **Command Prompt** (`C:\...>`):
   ```cmd
   set "DATABASE_PASSWORD=your_actual_postgres_password"
   ```
   For **PowerShell** (`PS C:\...>`):
   ```powershell
   $env:DATABASE_PASSWORD = "your_actual_postgres_password"
   ```
   `.env.example` is a reference file; Spring Boot does not load `.env` files automatically.
3. Start the server. Flyway applies the database migrations automatically:
   ```bash
   mvn spring-boot:run
   ```
