import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GitHubUser, GitHubEvent } from './models';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private http = inject(HttpClient);
  
  private token: string | null = null;
  
  setToken(token: string) {
    this.token = token;
  }
  
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `token ${this.token}`);
    }
    return headers;
  }
  
  async getUser(username?: string): Promise<GitHubUser | null> {
    try {
      const url = username 
        ? `https://api.github.com/users/${username}`
        : `https://api.github.com/user`;
      
      const response = await firstValueFrom(
        this.http.get<GitHubUser>(url, { headers: this.getHeaders() })
      );
      return response;
    } catch (error) {
      console.error('Error fetching user', error);
      return null;
    }
  }

  async getUserEvents(username: string): Promise<GitHubEvent[]> {
    try {
      // Fetch up to 100 recent events
      const response = await firstValueFrom(
        this.http.get<GitHubEvent[]>(`https://api.github.com/users/${username}/events?per_page=100`, { 
          headers: this.getHeaders() 
        })
      );
      return response || [];
    } catch (error) {
      console.error('Error fetching events', error);
      return [];
    }
  }
}
