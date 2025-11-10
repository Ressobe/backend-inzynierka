
## Wymagania wstępne

Zanim zaczniesz, upewnij się, że masz zainstalowane na swojej maszynie:
  *   **Docker Engine** (lub Docker Desktop)
  *   **Docker Compose**

## Konfiguracja

1.  **Plik `.env`**:
    Utwórz plik `.env` w katalogu głównym projektu. Będzie on zawierał zmienne środowiskowe wymagane przez kontener PostgreSQL i backendu.
    Poniżej znajduje się przykład zawartości pliku `.env`. Dostosuj wartości do swoich potrzeb:

    ```
    # PostgreSQL Configuration
    POSTGRES_USER=myuser
    POSTGRES_PASSWORD=mypassword
    POSTGRES_DB=mydatabase
    POSTGRES_PORT=5432
    DB_HOST=postgres
    DB_PORT=5432

    # Application Configuration
    PORT=3001
    NODE_ENV=development
    ```

    Upewnij się, że `DB_HOST` jest ustawione na `postgres`, ponieważ jest to nazwa usługi bazy danych w `docker-compose.dev.yml`.

## Uruchamianie aplikacji

Aby zbudować i uruchomić aplikację w trybie deweloperskim, wykonaj następujące kroki:

1.  Otwórz terminal w katalogu głównym projektu.
2.  Uruchom następującą komendę, aby zbudować obrazy i uruchomić kontenery:

    ````bash
    docker compose -f docker-compose.dev.yml up --build
    ````
