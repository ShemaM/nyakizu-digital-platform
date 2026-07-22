# TODO: Fix createsuperuser UNIQUE constraint on CustomUser.email

- [x] Identify root cause: `UNIQUE constraint failed: accounts_customuser.email`.
- [x] Remove existing user with the same email (or reset local sqlite DB).
- [x] Re-run migrations (if DB reset) and retry `python manage.py createsuperuser`.
- [x] Document the exact commands used to recover.

## Recovery Steps (DB Reset Method)

The simplest way to resolve this on a local development environment is to reset the SQLite database. This is a destructive action for local data but is often the quickest fix.

1.  **Delete the database file:**
    ```sh
    rm db.sqlite3
    ```

2.  **Re-run database migrations:**
    ```sh
    python manage.py migrate
    ```

3.  **Create the superuser again:**
    ```sh
    python manage.py createsuperuser
    ```
