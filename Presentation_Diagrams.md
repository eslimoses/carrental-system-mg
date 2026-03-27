# Car Rental System Presentation Diagrams

*You can copy and paste the code blocks below into [Mermaid Live Editor](https://mermaid.live/) to generate high-quality images (PNG/SVG) that you can insert directly into your PowerPoint slides.*

---

### 1. Overall System Architecture Diagram
This diagram shows the complete high-level data flow, from the React Frontend to the Spring Boot backend, and out to external services like Razorpay and Twilio.

```mermaid
flowchart LR
    subgraph Client [Frontend Layer]
        UI[User Interface\nReact 18 + Tailwind]
    end

    subgraph Backend [Backend Server Layer]
        API[REST API\nSpring Boot]
        Auth[Security\nJWT Auth]
        Logic[Business Logic\nServices]
        API <--> Auth
        Auth <--> Logic
    end

    subgraph Database [Storage Layer]
        DB[(MySQL Database)]
    end

    subgraph External [Third-Party API Integrations]
        Razorpay[Razorpay\nPayment Gateway]
        Twilio[Twilio\nWhatsApp API]
        SMTP[SMTP Server\nEmail Reports]
    end

    Client <-->|HTTPS / JSON| API
    Logic <-->|JPA / Hibernate| DB
    Logic -->|Verify Payment| Razorpay
    Razorpay -.->|Webhook Success| API
    Logic -->|Send Alert| Twilio
    Logic -->|Send Invoice| SMTP

    classDef fColor fill:#003366,stroke:#fff,stroke-width:2px,color:#fff;
    classDef bColor fill:#0099cc,stroke:#fff,stroke-width:2px,color:#fff;
    classDef dColor fill:#f29c11,stroke:#fff,stroke-width:2px,color:#fff;
    classDef eColor fill:#27ae60,stroke:#fff,stroke-width:2px,color:#fff;

    class UI fColor
    class API,Auth,Logic bColor
    class DB dColor
    class Razorpay,Twilio,SMTP eColor
```

---

### 2. Technology Stack Overview (Layered View)
This represents the different technology stacks separated by logical layers, similar to the multi-level graphics in your reference image.

```mermaid
flowchart TD
    subgraph UserInterface [1. User Interface Layer]
        React[React 18 Component UI]
        Tailwind[Tailwind CSS Styling]
        Framer[Framer Motion Animations]
    end

    subgraph StateComm [2. Networking & State Layer]
        Query[TanStack React Query]
        Axios[Axios HTTP Client]
    end

    subgraph AppServer [3. Application & Processing Layer]
        SpringB[Spring Boot 4 Application Core]
        JPA[Spring Data JPA Data Access]
        Sec[Spring Security & JWT Validation]
    end

    subgraph Integrations [4. Services & Integrations]
        Payment[Razorpay SDK]
        Notify[Twilio WhatsApp Notification API]
        Report[OpenPDF Invoice Generator]
    end

    subgraph Persistence [5. Data Persistence Layer]
        MySQL[(MySQL Structured Database)]
    end

    UserInterface --> StateComm
    StateComm --> AppServer
    AppServer --> Integrations
    AppServer --> Persistence

    style UserInterface fill:#540b0e,color:#fff
    style StateComm fill:#9e2a2b,color:#fff
    style AppServer fill:#e09f3e,color:#fff
    style Integrations fill:#fff3b0,color:#000
    style Persistence fill:#335c67,color:#fff
```

---

### 3. Entity-Relationship (ER) Diagram
This represents the structure of your MySQL database based on the `database-schema.sql` file.

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "makes"
    USERS ||--o{ BILLS : "receives"
    VEHICLE_CATEGORIES ||--o{ VEHICLES : "categorizes"
    CITIES ||--o{ VEHICLES : "locates"
    VEHICLES ||--o{ BOOKINGS : "booked in"
    BOOKINGS ||--|{ PAYMENTS : "has"
    BOOKINGS ||--o| BILLS : "generates"
    BOOKINGS ||--o{ RENTAL_PHOTOS : "records"
    BOOKINGS ||--o{ NOTIFICATIONS : "triggers"

    USERS {
        BIGINT id PK
        VARCHAR email
        VARCHAR password
        ENUM role "CUSTOMER, ADMIN"
    }
    VEHICLES {
        BIGINT id PK
        VARCHAR registration_number
        ENUM status "AVAILABLE, RENTED"
        DECIMAL daily_rate
    }
    BOOKINGS {
        BIGINT id PK
        DATE pickup_date
        DATE return_date
        ENUM status
    }
    PAYMENTS {
        BIGINT id PK
        DECIMAL amount
        ENUM payment_method "UPI, CASH, RAZORPAY"
    }
    BILLS {
        BIGINT id PK
        VARCHAR bill_number
        DECIMAL total_amount
    }
```

---

### 4. Class / Service Architecture Diagram
This illustrates the interaction between the core Spring Boot backend services.

```mermaid
classDiagram
    class BookingController {
      +createBooking()
      +confirmReturn()
    }
    class BookingService {
      +initializeBooking(dto)
      +validateVehicleAvailability()
    }
    class PaymentService {
      +initiateRazorpayOrder()
      +verifyPaymentSignature()
      +recordCashPayment()
    }
    class NotificationService {
      +sendWhatsAppAlert()
      +sendEmailInvoice()
      -formatMessage()
    }
    class BillGeneratorService {
      +calculateExtraKm()
      +generatePDF()
    }
    
    BookingController --> BookingService : delegates to
    BookingService --> PaymentService : requests payment verification
    PaymentService --> BillGeneratorService : signals success to
    BillGeneratorService --> NotificationService : dispatches final invoice
```
