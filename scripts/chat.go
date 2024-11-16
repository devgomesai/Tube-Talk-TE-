package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// RequestPayload represents the structure of the incoming request from the Next.js app.
type RequestPayload struct {
	Message string `json:"message"`
}

// ResponsePayload represents the structure of the response sent back to the Next.js app.
type ResponsePayload struct {
	Message string `json:"message"`
	Sender  string `json:"sender"`
}

func main() {
	http.HandleFunc("/chat", chatHandler)

	fmt.Println("Server is running on http://localhost:5000")
	log.Fatal(http.ListenAndServe(":5000", nil))
}

// chatHandler handles POST requests and simulates a chatbot response.
func chatHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the incoming JSON request
	var reqPayload RequestPayload
	err := json.NewDecoder(r.Body).Decode(&reqPayload)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Simulate chatbot response
	userMessage := reqPayload.Message
	chatbotMessage := simulateChatbotResponse(userMessage)

	// Create the response payload
	respPayload := ResponsePayload{
		Message: chatbotMessage,
		Sender:  "chatbot",
	}

	// Marshal the response to JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(respPayload)
}

// simulateChatbotResponse generates a chatbot response based on the user message.
func simulateChatbotResponse(userMessage string) string {
	// Simple simulation: echo the user's message with a prefix
	return fmt.Sprintf("Chatbot received: %s", userMessage)
}

