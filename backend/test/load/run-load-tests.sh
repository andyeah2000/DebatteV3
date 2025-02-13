#!/bin/bash

# Set error handling
set -e

# Function to cleanup resources
cleanup() {
    echo "Cleaning up resources..."
    docker-compose -f docker-compose.load-test.yml down -v
}

# Register cleanup function to run on script exit
trap cleanup EXIT

# Create necessary directories
mkdir -p grafana/dashboards grafana/provisioning/datasources

# Start the test environment
echo "Starting test environment..."
docker-compose -f docker-compose.load-test.yml up -d influxdb grafana

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Run the load tests
echo "Running load tests..."
docker-compose -f docker-compose.load-test.yml up k6

# Keep Grafana running for result analysis
echo "Load tests completed. Grafana is available at http://localhost:3000"
echo "Press Ctrl+C to stop and cleanup"

# Wait for user interrupt
wait 