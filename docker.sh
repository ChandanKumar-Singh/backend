# Build
docker build -t backend .

# run
docker run -p 3001:3001 -v $(pwd):/app backend
