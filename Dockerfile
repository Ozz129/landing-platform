FROM node:22-bookworm

WORKDIR /workspace

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g @anthropic-ai/claude-code

COPY package*.json ./
RUN npm install
RUN npx playwright install --with-deps

COPY . .

CMD ["bash"]
