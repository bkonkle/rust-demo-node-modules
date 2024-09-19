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

## Set up Torch for Text Classification

Set up CUDA using the [NVidia guide](https://developer.nvidia.com/cuda-downloads).

Download [LibTorch](https://pytorch.org/get-started/locally/) for Linux and C++/Java, and save it to `~/lib/libtorch`:

```sh
export VERSION=2.2.2
export CUDA_VERSION=cu121

wget https://download.pytorch.org/libtorch/$CUDA_VERSION/libtorch-cxx11-abi-shared-with-deps-$VERSION%2B$CUDA_VERSION.zip
unzip libtorch-cxx11-abi-shared-with-deps-$VERSION+$CUDA_VERSION.zip
rm libtorch-cxx11-abi-shared-with-deps-$VERSION+$CUDA_VERSION.zip

mkdir -p ~/lib
mv libtorch ~/lib/
```

Then, add the following values to your `.envrc` (as shown in the example):

```sh
export LIBTORCH=~/lib/libtorch
export LD_LIBRARY_PATH=${LIBTORCH}/lib:$LD_LIBRARY_PATH

export LIBTORCH_BYPASS_VERSION_CHECK=1
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
