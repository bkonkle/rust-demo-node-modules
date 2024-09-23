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

## Compile the Rust modules

```sh
npm run build.jwt-rsa

npm run build.text-classification
```

This should generate a `lib/jwt_rsa/jwt-rsa.<platform>.<arch>.node` file, with an `index.js` and an `index.d.ts` alongside it, and a similar file for the text-classification project. This is how you import the Rust modules into your Node.js application.

Run the local dev server with the rust module enabled:

```sh
USE_RUST_MODULE=true npm run dev
```

## Virtualenv

You'll need to create and activate a virtualenv for dependencies like "torch" to be available. With Poetry:

```sh
npm run poetry install

source $(npm run --silent poetry-path)/bin/activate
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
