#!/bin/bash

# Security Test Script for Doona Distribution Site
# Purpose: Verify security configurations and API responses
# Usage: ./security-test.sh

set -e

BASE_URL="https://doona-releases-site.pages.dev"
PASS_COUNT=0
FAIL_COUNT=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔒 Security Test Suite - Doona Distribution Site"
echo "=================================================="
echo "Target: $BASE_URL"
echo ""

# Test Helper Functions
test_header() {
  local header=$1
  local expected=$2
  local response=$(curl -s -I "$BASE_URL/" | grep -i "^$header:" | cut -d' ' -f2-)
  
  if [[ "$response" == *"$expected"* ]]; then
    echo -e "${GREEN}✅${NC} $header: Present"
    ((PASS_COUNT++))
  else
    echo -e "${RED}❌${NC} $header: Missing or Incorrect"
    echo "  Expected: $expected"
    echo "  Got: $response"
    ((FAIL_COUNT++))
  fi
}

test_status_code() {
  local endpoint=$1
  local expected_code=$2
  local method=${3:-GET}
  
  local code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$endpoint")
  
  if [[ "$code" == "$expected_code" ]]; then
    echo -e "${GREEN}✅${NC} $endpoint returns $code"
    ((PASS_COUNT++))
  else
    echo -e "${RED}❌${NC} $endpoint expected $expected_code, got $code"
    ((FAIL_COUNT++))
  fi
}

test_response_contains() {
  local endpoint=$1
  local should_not_contain=$2
  local description=$3
  
  local response=$(curl -s "$BASE_URL$endpoint")
  
  if [[ "$response" != *"$should_not_contain"* ]]; then
    echo -e "${GREEN}✅${NC} $description"
    ((PASS_COUNT++))
  else
    echo -e "${RED}❌${NC} $description - FOUND in response!"
    ((FAIL_COUNT++))
  fi
}

# Run Tests
echo "📋 Security Headers"
echo "-------------------"
test_header "X-Frame-Options" "DENY"
test_header "X-Content-Type-Options" "nosniff"
test_header "Content-Security-Policy" "default-src"
test_header "Referrer-Policy" "strict-origin"
echo ""

echo "🔐 API Endpoints"
echo "----------------"
test_status_code "/" 200
test_status_code "/api/version" 200
test_status_code "/api/manifest" 200
test_status_code "/api/ipa" 200
echo ""

echo "🛡️ Security Checks"
echo "-----------------"
test_response_contains "/api/manifest" "ATCTT" "No token in manifest response"
test_response_contains "/api/version" "ATCTT" "No token in version response"
test_response_contains "/api/manifest" "bitbucket" "No raw Bitbucket URL in manifest"
echo ""

echo "📊 Protocol Security"
echo "-------------------"
# Check HTTPS
local https_test=$(curl -s -I "$BASE_URL/" | grep -i "^http" | cut -d' ' -f1)
if [[ "$https_test" == "HTTP/2" ]] || [[ "$https_test" == "HTTP/3" ]]; then
  echo -e "${GREEN}✅${NC} HTTPS/HTTP2+ Enforced"
  ((PASS_COUNT++))
else
  echo -e "${RED}❌${NC} Protocol issue: $https_test"
  ((FAIL_COUNT++))
fi
echo ""

echo "📈 Results"
echo "=========="
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
if [[ $FAIL_COUNT -gt 0 ]]; then
  echo -e "${RED}Failed: $FAIL_COUNT${NC}"
  exit 1
else
  echo -e "${GREEN}Failed: $FAIL_COUNT${NC}"
  echo -e "\n${GREEN}✅ All Security Tests Passed!${NC}"
  exit 0
fi
