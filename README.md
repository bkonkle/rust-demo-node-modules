# High-Performance Node Modules with Rust

WIP

```sh
npm i
```

## Pre-commit

```sh
sudo apt install pre-commit
# or...
yay -S pre-commit
# or...
pipx install pre-commit
# or...
brew install pre-commit

pre-commit install
```

## Run on Local Machine

First, issue yourself a token:

```sh
npm run token
```

Then, run the local dev server:

```sh
USE_RUST_MODULE=false npm run dev
```

Now, make a `GET /me` call with your access token in the `Authorization` header with a "Bearer" prefix.

You should get back a 200 response, indicating that the JWT token was validated.

## Compile the Rust module

```sh
npm run build.jwt-rsa
```

This should generate a `lib/jwt_rsa/jwt-rsa.<platform>.<arch>.node` file, with an `index.js` and an `index.d.ts` alongside it. This is how you import the Rust module into your Node.js application.

Run the local dev server with the rust module enabled:

```sh
USE_RUST_MODULE=true npm run dev
```

## Run Benchmarks

Issue a token:

```sh
rpm run token
```

Assign the access token to the `ACCESS_TOKEN` environment variable:

```sh
export AUTH_TOKEN="Bearer {access_token}"
```

Run the benchmarks:

```sh
npm run bench
```
