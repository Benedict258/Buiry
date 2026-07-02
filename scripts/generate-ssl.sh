#!/bin/bash
# Generate self-signed SSL certificates for local development
# Usage: ./scripts/generate-ssl.sh

CERT_DIR="certs"
mkdir -p "$CERT_DIR"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/key.pem" \
  -out "$CERT_DIR/cert.pem" \
  -subj "/C=US/ST=State/L=City/O=Buiry/CN=localhost"

echo "SSL certificates generated in $CERT_DIR/"
echo "key.pem and cert.pem ready for local development"
