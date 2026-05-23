import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GitHubUser, GitHubEvent, GitHubContributionSummary, GitHubRepository } from './models';

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
      headers = headers.set('Authorization', `Bearer ${this.token}`);
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

  async getRepositories(username?: string): Promise<GitHubRepository[]> {
    const repos: GitHubRepository[] = [];
    const baseUrl = username
      ? `https://api.github.com/users/${username}/repos`
      : 'https://api.github.com/user/repos';

    try {
      for (let page = 1; page <= 3; page++) {
        const params = new URLSearchParams({
          per_page: '100',
          page: String(page),
          sort: 'updated',
        });

        if (!username) {
          params.set('visibility', 'all');
          params.set('affiliation', 'owner,collaborator,organization_member');
        }

        const pageRepos = await firstValueFrom(
          this.http.get<GitHubRepository[]>(`${baseUrl}?${params}`, { headers: this.getHeaders() })
        );

        repos.push(...(pageRepos || []));

        if (!pageRepos || pageRepos.length < 100) {
          break;
        }
      }

      return repos;
    } catch (error) {
      console.error('Error fetching repositories', error);
      return repos;
    }
  }

  async enrichRepositoriesWithPackageTech(repos: GitHubRepository[]): Promise<GitHubRepository[]> {
    const enriched: GitHubRepository[] = [];
    const candidates = repos.filter((repo) => !repo.fork && repo.full_name).slice(0, 80);
    const candidateNames = new Set(candidates.map((repo) => repo.full_name));

    for (const repo of repos) {
      if (!repo.full_name || !candidateNames.has(repo.full_name)) {
        enriched.push(repo);
        continue;
      }

      enriched.push({
        ...repo,
        detectedTechs: await this.detectPackageTech(repo.full_name),
      });
    }

    return enriched;
  }

  private async detectPackageTech(fullName: string): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ content?: string; encoding?: string }>(
          `https://api.github.com/repos/${fullName}/contents/package.json`,
          { headers: this.getHeaders() },
        )
      );

      if (!response.content || response.encoding !== 'base64') {
        return [];
      }

      const packageJson = JSON.parse(atob(response.content.replace(/\n/g, ''))) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const dependencies = new Set([
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {}),
      ].map((dependency) => dependency.toLowerCase()));

      return this.mapDependenciesToTechs(dependencies);
    } catch {
      return [];
    }
  }

  private mapDependenciesToTechs(dependencies: Set<string>): string[] {
    const techs: string[] = [];
    const has = (...names: string[]) => names.some((name) => dependencies.has(name));

    if (has('@angular/core')) techs.push('Angular');
    if (has('react')) techs.push('React');
    if (has('next')) techs.push('Next.js');
    if (has('vue')) techs.push('Vue');
    if (has('svelte')) techs.push('Svelte');
    if (has('astro')) techs.push('Astro');
    if (has('@remix-run/react')) techs.push('Remix');
    if (has('tailwindcss')) techs.push('Tailwind CSS');
    if (has('vite')) techs.push('Vite');
    if (has('express')) techs.push('Express');
    if (has('@nestjs/core')) techs.push('NestJS');
    if (has('three')) techs.push('Three.js');
    if (has('firebase')) techs.push('Firebase');
    if (has('@supabase/supabase-js')) techs.push('Supabase');
    if (has('prisma', '@prisma/client')) techs.push('Prisma');

    return techs;
  }

  async getAuthenticatedContributionSummary(): Promise<GitHubContributionSummary | null> {
    if (!this.token) {
      return null;
    }

    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);

    const query = `
      query VibeGotchiContributionSummary($from: DateTime!) {
        viewer {
          contributionsCollection(from: $from) {
            totalCommitContributions
            restrictedContributionsCount
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await firstValueFrom(
        this.http.post<{
          data?: {
            viewer?: {
              contributionsCollection?: {
                totalCommitContributions: number;
                restrictedContributionsCount: number;
                contributionCalendar: {
                  totalContributions: number;
                  weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
                };
              };
            };
          };
          errors?: unknown[];
        }>(
          'https://api.github.com/graphql',
          { query, variables: { from: from.toISOString() } },
          { headers: this.getHeaders() },
        )
      );

      const collection = response.data?.viewer?.contributionsCollection;
      if (!collection) {
        return null;
      }

      return {
        totalContributions: collection.contributionCalendar.totalContributions,
        totalCommitContributions: collection.totalCommitContributions,
        restrictedContributionsCount: collection.restrictedContributionsCount,
        contributionDays: collection.contributionCalendar.weeks.flatMap((week) => week.contributionDays),
      };
    } catch (error) {
      console.error('Error fetching contribution summary', error);
      return null;
    }
  }
}
