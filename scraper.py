from playwright.sync_api import sync_playwright
import json
from typing import List, Dict
import time

class MovieBoxScraper:
    def __init__(self):
        self.base_url = "https://moviebox.ng"
        self.movies: List[Dict] = []

    def scrape_movies(self, max_pages: int = 5):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            for page_num in range(1, max_pages + 1):
                url = f"{self.base_url}/movies/page/{page_num}"
                page.goto(url)
                page.wait_for_selector('.movie-card')  # Wait for movie cards to load
                
                # Extract movie information
                movies = page.query_selector_all('.movie-card')
                for movie in movies:
                    try:
                        title = movie.query_selector('.movie-title').inner_text()
                        poster = movie.query_selector('img').get_attribute('src')
                        link = movie.query_selector('a').get_attribute('href')
                        
                        # Get movie details
                        page.goto(link)
                        page.wait_for_selector('.movie-details')
                        
                        description = page.query_selector('.movie-description').inner_text()
                        genre = [g.inner_text() for g in page.query_selector_all('.genre-tag')]
                        year = page.query_selector('.release-year').inner_text()
                        
                        self.movies.append({
                            'title': title,
                            'poster': poster,
                            'description': description,
                            'genre': genre,
                            'year': year,
                            'url': link
                        })
                        
                        # Be nice to the server
                        time.sleep(1)
                        
                    except Exception as e:
                        print(f"Error scraping movie: {e}")
                        continue
                
                # Be nice to the server between pages
                time.sleep(2)
            
            browser.close()
            
    def save_to_json(self, filename: str = 'movies.json'):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.movies, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    scraper = MovieBoxScraper()
    scraper.scrape_movies(max_pages=3)  # Scrape first 3 pages
    scraper.save_to_json() 