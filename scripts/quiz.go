package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// Quiz represents the structure of the quiz returned by the server
type Quiz struct {
	Title     string `json:"title"`
	Questions []struct {
		ID            int      `json:"id"`
		Question      string   `json:"question"`
		Options       []string `json:"options"`
		CorrectAnswer string   `json:"correct_answer"`
	} `json:"questions"`
}

// InitQuizRequest represents the request body expected by the server
type InitQuizRequest struct {
	Transcript string `json:"transcript"`
}

// InitQuizResponse represents the response returned by the server
type InitQuizResponse struct {
	Status  string `json:"status"`
	Quiz    Quiz   `json:"quiz,omitempty"`
	Message string `json:"message,omitempty"`
}

func initQuizHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the incoming request body
	var req InitQuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Simulate quiz generation based on the transcript
	if req.Transcript == "" {
		http.Error(w, "Transcript is required", http.StatusBadRequest)
		return
	}

	// Generate a dummy quiz
	quiz := Quiz{
		Title: "Basic Programming Concepts",
		Questions: []struct {
			ID            int      `json:"id"`
			Question      string   `json:"question"`
			Options       []string `json:"options"`
			CorrectAnswer string   `json:"correct_answer"`
		}{
			{
				ID:            1,
				Question:      "What does HTML stand for?",
				Options:       []string{"HyperText Markup Language", "HighText Machine Language", "HyperText Management Language", "None of the above"},
				CorrectAnswer: "HyperText Markup Language",
			},
			{
				ID:            2,
				Question:      "Which programming language is commonly used for web development?",
				Options:       []string{"Python", "JavaScript", "C++", "Java"},
				CorrectAnswer: "JavaScript",
			},
			{
				ID:            3,
				Question:      "What is the correct syntax for a for loop in Python?",
				Options:       []string{"for(i=0; i<10; i++)", "for i in range(10):", "for i: range(10)", "loop i in range(10):"},
				CorrectAnswer: "for i in range(10):",
			},
			{
				ID:            4,
				Question:      "Which symbol is used for comments in JavaScript?",
				Options:       []string{"//", "/* */", "#", "--"},
				CorrectAnswer: "//",
			},
			{
				ID:            5,
				Question:      "What does CSS stand for?",
				Options:       []string{"Cascading Style Sheets", "Creative Style System", "Computer Style Sheets", "Control Style Syntax"},
				CorrectAnswer: "Cascading Style Sheets",
			},
		},
	}

	// Prepare the response
	response := InitQuizResponse{
		Status: "success",
		Quiz:   quiz,
	}

	// Return the response as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}

func main() {
	http.HandleFunc("/init-quiz", initQuizHandler)

	// Start the server
	port := 5000
	fmt.Printf("Server is listening on http://localhost:%d\n", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
