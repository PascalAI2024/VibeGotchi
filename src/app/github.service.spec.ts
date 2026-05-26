import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GithubService, GithubError } from './github.service';
import { GitHubUser, GitHubRepository } from './models';

describe('GithubService', () => {
  let service: GithubService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GithubService],
    }).compileComponents();

    service = TestBed.inject(GithubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getUser', () => {
    it('should return user data on success', async () => {
      const mockUser: GitHubUser = { login: 'testuser', id: 1, avatar_url: '', name: 'Test' } as GitHubUser;
      const promise = service.getUser('testuser');
      httpMock.expectOne('https://api.github.com/users/testuser').flush(mockUser);
      const result = await promise;
      expect(result?.login).toBe('testuser');
    });

    it('should throw GithubError on 404', async () => {
      const promise = service.getUser('nonexistent');
      const req = httpMock.expectOne('https://api.github.com/users/nonexistent');
      req.flush(null, { status: 404, statusText: 'Not Found' });
      await expectAsync(promise).toBeRejectedWithError(GithubError);
    });

    it('should throw GithubError with isRateLimit on 403', async () => {
      const promise = service.getUser('testuser');
      const req = httpMock.expectOne('https://api.github.com/users/testuser');
      req.flush(null, { status: 403, statusText: 'Rate Limit' });
      try {
        await promise;
        fail('should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(GithubError);
        expect((e as GithubError).isRateLimit).toBe(true);
      }
    });
  });

  describe('caching', () => {
    it('should return cached data on repeated calls within TTL', async () => {
      const mockUser: GitHubUser = { login: 'testuser', id: 1, avatar_url: '', name: 'Test' } as GitHubUser;
      const promise1 = service.getUser('testuser');
      httpMock.expectOne('https://api.github.com/users/testuser').flush(mockUser);
      await promise1;

      // Second call should not hit network
      const promise2 = service.getUser('testuser');
      const results = await promise2;
      expect(results?.login).toBe('testuser');
      httpMock.expectOne('https://api.github.com/users/testuser'); // still one request total
    });
  });
});