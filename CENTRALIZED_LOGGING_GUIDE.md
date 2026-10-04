# Centralized & Structured Logging Guide (PLG Stack)

This document describes the enterprise-grade centralized logging architecture implemented for the **SimpleEcom** microservices platform using the **Grafana Alloy + Grafana Loki + Grafana** stack.

---

## 1. System Architecture

```
 ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
 │   api-gateway   │   │  user-service   │   │  order-service  │ ...
 └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
          │                     │                     │
          │ (Generates & sets   │ (Reads X-Correlation-ID & sets
          │  X-Correlation-ID)  │  SLF4J MDC traceId)
          ▼                     ▼                     ▼
 ┌─────────────────────────────────────────────────────────────┐
 │       Microservice Logging (logstash-logback-encoder)       │
 │   - Colorized human readable console output (stdout)       │
 │   - Structured NDJSON files (logs/<service-name>.json)      │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                 Grafana Alloy Collector                       │
 │   - Scrapes /var/log/services/**/logs/*.json               │
 │   - Extracts labels: service, level, traceId               │
 │   - Asynchronously streams batches to Loki via HTTP        │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                 Grafana Loki (Port 3100)                    │
 │   - Lightweight, label-indexed log database                │
 │   - High compression chunk storage                          │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                 Grafana Dashboard (Port 3000)               │
 │   - Explore UI & LogQL query engine                         │
 │   - Pre-provisioned Loki default datasource                 │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Microservice Layer Implementation

### 2.1 Dependencies
All services (`api-gateway`, `user-service`, `product-service`, `order-service`) use:
- **`net.logstash.logback:logstash-logback-encoder:7.4`** for formatting log records as structured NDJSON.
- **SLF4J API** (`org.slf4j.Logger`, `org.slf4j.LoggerFactory`) replacing all legacy `System.out.println` and `e.printStackTrace()` calls.

### 2.2 Distributed Correlation / Trace ID Propagation
To trace a request journey across multiple microservices:
1. **API Gateway (`api-gateway`)**:
   - `CorrelationIdFilter.java` intercepts every incoming HTTP request.
   - If the header `X-Correlation-ID` is missing, generates a unique 32-character UUID.
   - Attaches `X-Correlation-ID` downstream to target microservices and returns it in client response headers.
2. **Backend Microservices (`user-service`, `product-service`, `order-service`)**:
   - `CorrelationIdFilter.java` extracts `X-Correlation-ID`.
   - Inserts `traceId` into SLF4J **MDC** (`Mapped Diagnostic Context`).
   - Automatically cleans up `MDC.remove("traceId")` in the `finally` block to prevent thread contamination.

### 2.3 Logback Configuration (`logback-spring.xml`)
Configured in `src/main/resources/logback-spring.xml` across all services:
- **Console Appender**: Colorized pattern with timestamp, thread, service name, and traceId:
  ```text
  2026-10-03 12:45:00.123 INFO [http-nio-8083-exec-2] [order-service,traceId=4bf92f3577b34da6a3ce929d0e0e4736] c.s.o.controller.OrderController : Order processed successfully with id=101
  ```
- **JSON Rolling File Appender**: Emits structured JSON events to `logs/<service-name>.json` with rolling policies (max 10MB per file, 7-day retention).

---

## 3. Centralized Infrastructure (Docker Compose)

The centralized stack is defined in `docker-compose.logging.yml`:

| Container Name | Service | Image | Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **simpleecom-loki** | Loki | `grafana/loki:3.0.0` | `3100` | High-efficiency log database |
| **simpleecom-alloy** | Alloy | `grafana/alloy:latest` | `12345` (internal) | Telemetry Collector (logs, metrics, traces) |
| **simpleecom-grafana** | Grafana | `grafana/grafana:10.4.2` | `3000` | Web visualization UI |

### Configuration Files
- `monitoring/loki/loki-config.yml`: Storage paths, TSDB schema, retention settings.
- `monitoring/alloy/config.alloy`: Pipeline rules extracting `service`, `level`, and `traceId` as Loki index labels.
- `monitoring/grafana/provisioning/datasources/datasources.yml`: Auto-provisions Loki as the default Grafana datasource.

---

## 4. How to Run & Use

### 4.1 Starting the Logging Stack
Run from the repository root:
```powershell
docker compose -f docker-compose.logging.yml up -d
```

To check container health:
```powershell
docker ps --filter "name=simpleecom"
```

To stop the logging stack:
```powershell
docker compose -f docker-compose.logging.yml down
```

### 4.2 Accessing Grafana
1. Open your browser and navigate to: **`http://localhost:3000`**
2. Login with default credentials:
   - **Username:** `admin`
   - **Password:** `admin`
3. Click on the left menu ➔ **Explore** (compass icon).
4. The **Loki** data source is already selected by default!

---

## 5. LogQL Cheat Sheet for Developers

Use these LogQL queries in Grafana Explore:

### 1. View all logs for a specific service
```logql
{service="order-service"}
```

### 2. View all ERROR logs across the entire system
```logql
{job="simpleecom-logs", level="ERROR"}
```

### 3. Trace an entire request across multiple microservices
Copy any `X-Correlation-ID` header from a network response or log line:
```logql
{traceId="4bf92f3577b34da6a3ce929d0e0e4736"}
```
*(Shows the exact path the request took: Gateway ➔ User Service ➔ Product Service ➔ Order Service).*

### 4. Search for specific keywords (e.g. Out of stock, timeout)
```logql
{service="product-service"} |= "Stock reduced"
```

### 5. Count log errors over time (Rate metric)
```logql
rate({level="ERROR"}[1m])
```

---

## 6. Git Branching
All changes for this feature are tracked on:
- **Branch:** `feature/structured-logging`
- **Phase 1 Commit:** `feat(logging): Phase 1 - structured JSON logging and distributed correlation ID`
- **Phase 2 Commit:** `feat(logging): Phase 2 - centralized Loki, Grafana Alloy, and Grafana infrastructure`
