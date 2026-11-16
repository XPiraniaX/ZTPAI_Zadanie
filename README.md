# Room Booking API

## Uruchomienie projektu

### Wymagania
- Git
- Docker
- Docker Compose

### 1. Sklonowanie repozytorium

```bash
git clone https://github.com/XPiraniaX/ZTPAI_Zadanie.git
cd ZTPAI_Zadanie
```

### 2. Konfiguracja środowiska

Utwórz plik `.env` na podstawie przykładowej konfiguracji:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

Uzupełnij wymagane zmienne środowiskowe w pliku `.env`, w szczególności dane dostępowe PostgreSQL i sekret JWT.

### 3. Uruchomienie aplikacji

Uruchom kontenery poleceniem:

```bash
docker compose up --build
```

Docker Compose uruchamia:
- **db** – bazę danych PostgreSQL,
- **api** – aplikację Node.js.

Aplikacja oczekuje na gotowość bazy danych. Migracje bazy danych wykonywane są automatycznie podczas uruchamiania kontenera API.

### 4. Dostęp do aplikacji

Po poprawnym uruchomieniu usługi dostępne są pod adresami:

- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/openapi.json

### 5. Konto administratora

Konto demonstracyjne administratora można utworzyć w działającym kontenerze API:

```bash
docker compose exec api npx knex seed:run
```

Dane konta demonstracyjnego:

- E-mail: `admin@roombooking.local`
- Hasło: `Admin123456!`

Dane służą wyłącznie do lokalnego uruchomienia demonstracyjnego.

### 6. Zatrzymywanie aplikacji

Aby zatrzymać i usunąć kontenery oraz sieć projektu:

```bash
docker compose down
```

Dane PostgreSQL przechowywane są w nazwanym wolumenie i pozostają zachowane po zatrzymaniu projektu.

Aby ponownie uruchomić aplikację:

```bash
docker compose up -d
```