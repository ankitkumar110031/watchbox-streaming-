from playwright.sync_api import sync_playwright
import json
from typing import List, Dict
import time
import os
from dotenv import load_dotenv

class AdminMovieBoxScraper:
    def __init__(self):
        load_dotenv()
        self.base_url = "https://moviebox.ng"
        self.movies: List[Dict] = []
        self.admin_key = os.getenv('ADMIN_KEY')
        
        if not self.admin_key:
            raise ValueError("Admin key not found in environment variables")

    def verify_admin(self, key: str) -> bool:
        return key == self.admin_key

    def scrape_movies(self, max_pages: int = 5, admin_key: str = None):
        if not self.verify_admin(admin_key):
            raise PermissionError("Invalid admin key")

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
                        # Enhanced scraping for admin
                        title = movie.query_selector('.movie-title').inner_text()
                        poster = movie.query_selector('img').get_attribute('src')
                        link = movie.query_selector('a').get_attribute('href')
                        
                        page.goto(link)
                        page.wait_for_selector('.movie-details')
                        
                        description = page.query_selector('.movie-description').inner_text()
                        genre = [g.inner_text() for g in page.query_selector_all('.genre-tag')]
                        year = page.query_selector('.release-year').inner_text()
                        
                        # Additional admin-only data
                        rating = page.query_selector('.movie-rating').inner_text()
                        cast = [c.inner_text() for c in page.query_selector_all('.cast-member')]
                        director = page.query_selector('.director').inner_text()
                        
                        self.movies.append({
                            'title': title,
                            'poster': poster,
                            'description': description,
                            'genre': genre,
                            'year': year,
                            'url': link,
                            'rating': rating,
                            'cast': cast,
                            'director': director,
                            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
                        })
                        
                        time.sleep(0.5)  # Faster scraping for admin
                        
                    except Exception as e:
                        print(f"Error scraping movie: {e}")
                        continue
                
                time.sleep(1)
            
            browser.close()
            
    def save_to_json(self, filename: str = 'admin_movies.json'):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.movies, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    admin_key = input("Enter admin key: ")
    scraper = AdminMovieBoxScraper()
    try:
        scraper.scrape_movies(max_pages=3, admin_key=admin_key)
        scraper.save_to_json()
        print("Scraping completed successfully!")
    except Exception as e:
        print(f"Error: {e}") 