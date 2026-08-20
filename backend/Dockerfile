FROM python:3.14.6-trixie

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /backend

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY src ./src

COPY README.md .

RUN mkdir -p log

ENV PYTHONPATH=/backend/src

EXPOSE 8000

CMD ["python", "src/main.py"]