package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type HealthResponse struct {
	Service   string `json:"service"`
	Status    string `json:"status"`
	Timestamp int64  `json:"timestamp"`
	VectorDB  string `json:"vector_db_status"`
	Sandbox   string `json:"sandbox_pool_status"`
}

type MemoryQueryRequest struct {
	OrgID       string `json:"org_id"`
	WorkspaceID string `json:"workspace_id"`
	Query       string `json:"query"`
	TopK        int    `json:"top_k"`
}

type MemoryQueryResponse struct {
	QueryID   string       `json:"query_id"`
	TopK      int          `json:"top_k"`
	Chunks    []VectorChunk `json:"chunks"`
	Telemetry string       `json:"telemetry"`
}

type VectorChunk struct {
	ID         string  `json:"id"`
	Text       string  `json:"text"`
	Similarity float64 `json:"similarity"`
	SourceType string  `json:"source_type"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	resp := HealthResponse{
		Service:   "memory-service",
		Status:    "UP",
		Timestamp: time.Now().Unix(),
		VectorDB:  "CONNECTED_PINECONE_WEAVIATE",
		Sandbox:   "FIRECRACKER_POOL_READY",
	}
	json.NewEncoder(w).Encode(resp)
}

func queryMemoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req MemoryQueryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// Simulate high-speed vector retrieval with tenant metadata pre-filtering
	chunks := []VectorChunk{
		{
			ID:         uuid.New().String(),
			Text:       fmt.Sprintf("Episodic Memory Summary for Tenant %s: Discussed Q3 sales growth, architecture refactoring, and Firecracker microVM pools.", req.OrgID),
			Similarity: 0.942,
			SourceType: "episodic_memory",
		},
		{
			ID:         uuid.New().String(),
			Text:       "Engineering ADR 2026.1: All external Python/JS tool executions must be isolated in ephemeral Firecracker kernels with a 30-second ceiling.",
			Similarity: 0.891,
			SourceType: "pdf_upload",
		},
	}

	resp := MemoryQueryResponse{
		QueryID:   uuid.New().String(),
		TopK:      req.TopK,
		Chunks:    chunks,
		Telemetry: fmt.Sprintf("Filtered by OrgID: %s | WorkspaceID: %s | Latency: 12ms", req.OrgID, req.WorkspaceID),
	}

	json.NewEncoder(w).Encode(resp)
}

func main() {
	http.HandleFunc("/api/memory/health", healthHandler)
	http.HandleFunc("/api/memory/query", queryMemoryHandler)

	port := ":8002"
	log.Printf("Starting AI.bh Go Memory & Sandbox Gateway on port %s...", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
