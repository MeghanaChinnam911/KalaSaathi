FROM python:3.13.1-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
	libglib2.0-0 \
	libgl1 \
	libsm6 \
	libxext6 \
	libxrender1 \
	libxcb1 \
	&& rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY ml ./ml

RUN mkdir -p /app/storage

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
