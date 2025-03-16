package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Product represents the structure of each item in the JSON array
type Product struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Image string `json:"image"`
}

func main() {
	jsonData := `
[
  {
    "id": "B08J5F3G18",
    "title": "Premium Gaming Headset",
    "image": "https://cdns3.thecosmicbyte.com/wp-content/uploads/BLAZAR-RED-6.jpg"
  },
  {
    "id": "B08H95Y452",
    "title": "Wireless Gaming Mouse",
    "image": "https://cdns3.thecosmicbyte.com/wp-content/uploads/0-6532980b2eec0.jpg"
  }
]
  `
	var products []Product
	err := json.Unmarshal([]byte(jsonData), &products)
	if err != nil {
		fmt.Println(err)
	}

	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(products)
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Request received")
		queryParams := r.URL.Query()
		product := queryParams.Get("product")
		fmt.Println("this", product)
		json.NewEncoder(w).Encode(products)
	})
	fmt.Println("Server started on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println(err)
	}
}
