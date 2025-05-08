from playwright.sync_api import sync_playwright
import json
from typing import List, Dict
import time
import os
from dotenv import load_dotenv

class UserMovieBoxScraper:
    def __init__(self):
        load_dotenv()
        self.base_url = "https://moviebox.ng"
        self.movies: List[Dict] = []
        self.max_pages_per_day = 2
        self.daily_requests = 0
        self.last_reset = time.time()

    def check_rate_limit(self):
        # Reset daily counter if 24 hours have passed
        if time.time() - self.last_reset > 86400:  # 24 hours in seconds
            self.daily_requests = 0
            self.last_reset = time.time()
        
        if self.daily_requests >= self.max_pages_per_day:
            raise Exception("Daily scraping limit reached. Please try again tomorrow.")

    def scrape_movies(self, max_pages: int = 1):
        self.check_rate_limit()
        
        if max_pages > self.max_pages_per_day:
            max_pages = self.max_pages_per_day

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            for page_num in range(1, max_pages + 1):
                url = f"{self.base_url}/movies/page/{page_num}"
                page.goto(url)
                page.wait_for_selector('.movie-card')
                
                movies = page.query_selector_all('.movie-card')
                for movie in movies:
                    try:
                        # Basic scraping for users
                        title = movie.query_selector('.movie-title').inner_text()
                        poster = movie.query_selector('img').get_attribute('src')
                        link = movie.query_selector('a').get_attribute('href')
                        
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
                        
                        time.sleep(2)  # Slower scraping for users
                        
                    except Exception as e:
                        print(f"Error scraping movie: {e}")
                        continue
                
                self.daily_requests += 1
                time.sleep(3)  # Longer delay between pages for users
            
            browser.close()
            
    def save_to_json(self, filename: str = 'user_movies.json'):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.movies, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    scraper = UserMovieBoxScraper()
    try:
        scraper.scrape_movies(max_pages=1)  # Users can only scrape 1 page at a time
        scraper.save_to_json()
        print("Scraping completed successfully!")
    except Exception as e:
        print(f"Error: {e}") 