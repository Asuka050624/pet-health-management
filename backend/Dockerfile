FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads/avatars uploads/pets uploads/products uploads/news

EXPOSE 5000

CMD ["python", "run.py"]
