export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
  public_repos: number;
}

export interface GitHubEvent {
  type: string;
  created_at: string;
  repo: {
    name: string;
  };
  payload: Record<string, unknown>;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface GitHubContributionSummary {
  totalContributions: number;
  totalCommitContributions: number;
  restrictedContributionsCount: number;
  contributionDays: ContributionDay[];
}

export interface GitHubRepository {
  name: string;
  full_name?: string;
  html_url: string;
  fork: boolean;
  language: string | null;
  private?: boolean;
  detectedTechs?: string[];
  updated_at?: string;
}

export interface TechBadge {
  tech: string;
  repoCount: number;
  iconSlug: string | null;
  iconUrl: string | null;
  level: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Legend';
}

export interface AchievementBadge {
  name: string;
  description: string;
  icon: string;
}

export interface ScoreBreakdownItem {
  label: string;
  value: number;
}

export interface EvolutionMilestone {
  from: PetState['stage'];
  to: PetState['stage'];
}

export interface PetState {
  stage: 'Egg' | 'Baby' | 'Teen' | 'Adult' | 'Elder';
  health: number; // 0-100
  mood: 'Ecstatic' | 'Happy' | 'Neutral' | 'Sad' | 'Dead';
  careState: 'Thriving' | 'Active' | 'Resting' | 'Neglected';
  posture: 'Stand' | 'Sit' | 'LayDown';
  level: number;
  xp: number;
  xpToNextLevel: number;
  daysSinceLastCommit: number;
  commitStreak: number;
  recentCommitsCount: number; // in last 90 days (from events)
  privateContributionsCount?: number;
  topLanguage: string | null;
  lastCommitMessage: string | null;
  activitySource?: string;
  techBadges: TechBadge[];
  achievements: AchievementBadge[];
  scoreBreakdown: ScoreBreakdownItem[];
  personalityLine: string;
  evolutionMilestone?: EvolutionMilestone | null;
}
