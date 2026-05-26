import { Injectable } from '@angular/core';
import {
  AchievementBadge,
  GitHubContributionSummary,
  GitHubEvent,
  GitHubRepository,
  PetState,
  TechBadge,
} from './models';

// Shared level divisor — used by both scoring paths so level is consistent regardless of data source
const SHARED_LEVEL_DIVISOR = 25;

@Injectable({
  providedIn: 'root'
})
export class PetEngineService {

  private createDefaultState(): PetState {
    return {
      stage: 'Egg',
      health: 20,
      mood: 'Sad',
      careState: 'Neglected',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      daysSinceLastCommit: 999,
      commitStreak: 0,
      recentCommitsCount: 0,
      privateContributionsCount: 0,
      topLanguage: 'Unknown',
      lastCommitMessage: null,
      posture: 'Stand',
      techBadges: [],
      achievements: [],
      scoreBreakdown: [],
      personalityLine: 'Neglected. Awaiting signs of life from the commit mines.',
      evolutionMilestone: null,
    };
  }
  
  calculateState(events: GitHubEvent[], repos: GitHubRepository[] = []): PetState {
    const defaultState = this.createDefaultState();

    if (!events || events.length === 0) {
      return this.enrichState({
        ...defaultState,
        techBadges: this.calculateTechBadges(repos),
        activitySource: 'Recent public GitHub events',
      });
    }

    const pushEvents = events.filter(e => e.type === 'PushEvent');
    
    // Calculate total pushes
    const totalPushes = pushEvents.length;
    
    // Sort events by date descending
    const sortedPushes = [...pushEvents].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    let daysSinceLast = 999;
    let lastCommitMessage = null;
    if (sortedPushes.length > 0) {
      const lastPushDate = new Date(sortedPushes[0].created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastPushDate.getTime());
      daysSinceLast = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const payload = sortedPushes[0].payload;
      if (payload && Array.isArray(payload['commits']) && payload['commits'].length > 0) {
        lastCommitMessage = (payload['commits'][0] as Record<string, unknown>)['message'] as string;
      }
    }

    // Calculate streak — use ISO date strings (YYYY-MM-DD) to avoid month-boundary collisions
    let streak = 0;
    const daysWithCommits = new Set<string>();
    for (const push of pushEvents) {
      const d = new Date(push.created_at);
      const dateStr = d.toISOString().slice(0, 10); // "2026-01-31" not "2026-1-31"
      daysWithCommits.add(dateStr);
    }

    // check backwards from today
    // allow yesterday to keep streak active
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let currentStreak = 0;
    const inspectingDate = new Date();

    // If today exists, start counting from today, else try yesterday
    const todayStr = inspectingDate.toISOString().slice(0, 10);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (daysWithCommits.has(todayStr) || daysWithCommits.has(yesterdayStr)) {
        let dateWalker = new Date();
        if (!daysWithCommits.has(todayStr) && daysWithCommits.has(yesterdayStr)) {
            dateWalker = yesterday;
        }

        while (true) {
            const str = dateWalker.toISOString().slice(0, 10);
            if (daysWithCommits.has(str)) {
                currentStreak++;
                dateWalker.setDate(dateWalker.getDate() - 1);
            } else {
                break;
            }
        }
    }
    streak = currentStreak;

    // Determine XP / Level
    // rough estimate: 1 push = 10 XP, formula Lvl = Math.floor(sqrt(XP / 10)) + 1
    const pushXp = totalPushes * 15;
    const streakXp = streak * 50;
    const techBadges = this.calculateTechBadges(repos);
    const badgeXp = techBadges.reduce((sum, badge) => sum + badge.level * 25, 0);
    const careState = this.getCareState(daysSinceLast);
    const freshnessXp = this.getFreshnessXp(careState);
    const xp = pushXp + streakXp + badgeXp + freshnessXp;
    const level = Math.max(1, Math.floor(Math.sqrt(xp / SHARED_LEVEL_DIVISOR)) + 1);
    const xpToNextLevel = Math.pow(level, 2) * SHARED_LEVEL_DIVISOR;

    // Determine Health
    // Health degrades by 10 per day without commits
    let health = Math.max(0, 100 - (daysSinceLast * 15));
    if (daysSinceLast === 0) health = 100;
    
    // Stage
    let stage: PetState['stage'] = 'Egg';
    if (level >= 10) stage = 'Elder';
    else if (level >= 6) stage = 'Adult';
    else if (level >= 3) stage = 'Teen';
    else if (level >= 2) stage = 'Baby';

    // Mood
    let mood: PetState['mood'] = 'Neutral';
    if (careState === 'Neglected') mood = 'Sad';
    else if (health === 0) mood = 'Dead';
    else if (health < 40) mood = 'Sad';
    else if (streak > 2) mood = 'Ecstatic';
    else if (health > 70) mood = 'Happy';

    // Enrich state with achievements, personality, and check for evolution milestone
    return this.enrichState({
      stage,
      health,
      mood,
      careState,
      posture: 'Stand',
      level,
      xp,
      xpToNextLevel,
      daysSinceLastCommit: daysSinceLast,
      commitStreak: streak,
      recentCommitsCount: totalPushes,
      privateContributionsCount: 0,
      topLanguage: 'Code',
      lastCommitMessage,
      activitySource: 'Recent public GitHub events',
      techBadges,
      scoreBreakdown: [
        { label: 'Recent pushes', value: pushXp },
        { label: 'Active streak', value: streakXp },
        { label: 'Tech badges', value: badgeXp },
        { label: 'Freshness', value: freshnessXp },
      ],
    });
  }

  calculateStateFromContributionSummary(summary: GitHubContributionSummary, repos: GitHubRepository[] = []): PetState {
    const defaultState = this.createDefaultState();
    const activeDays = summary.contributionDays.filter((day) => day.contributionCount > 0);

    if (summary.totalContributions === 0 || activeDays.length === 0) {
      return {
        ...defaultState,
        activitySource: 'Read-only GitHub contribution graph',
        techBadges: this.calculateTechBadges(repos),
        achievements: this.calculateAchievements(defaultState),
        scoreBreakdown: [{ label: 'No recent contributions found', value: 0 }],
      };
    }

    const sortedDays = [...summary.contributionDays].sort((a, b) => b.date.localeCompare(a.date));
    const lastActiveDay = sortedDays.find((day) => day.contributionCount > 0);
    const now = new Date();
    const lastActiveDate = lastActiveDay ? new Date(`${lastActiveDay.date}T00:00:00`) : null;
    const daysSinceLast = lastActiveDate
      ? Math.floor(Math.abs(now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const activeDaySet = new Set(activeDays.map((day) => day.date));
    let streak = 0;
    let dateWalker = new Date();
    const today = dateWalker.toISOString().slice(0, 10);
    const yesterday = new Date(dateWalker);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!activeDaySet.has(today) && activeDaySet.has(yesterday.toISOString().slice(0, 10))) {
      dateWalker = yesterday;
    }

    while (activeDaySet.has(dateWalker.toISOString().slice(0, 10))) {
      streak++;
      dateWalker.setDate(dateWalker.getDate() - 1);
    }

    const contributionXp = summary.totalContributions * 10;
    const commitXp = summary.totalCommitContributions * 5;
    const streakXp = streak * 50;
    const techBadges = this.calculateTechBadges(repos);
    const badgeXp = techBadges.reduce((sum, badge) => sum + badge.level * 25, 0);
    const careState = this.getCareState(daysSinceLast);
    const freshnessXp = this.getFreshnessXp(careState);
    const xp = contributionXp + commitXp + streakXp + badgeXp + freshnessXp;
    const level = Math.max(1, Math.floor(Math.sqrt(xp / SHARED_LEVEL_DIVISOR)) + 1);
    const xpToNextLevel = Math.pow(level, 2) * SHARED_LEVEL_DIVISOR;
    let health = Math.max(0, 100 - daysSinceLast * 12);
    if (daysSinceLast === 0) health = 100;

    let stage: PetState['stage'] = 'Egg';
    if (level >= 10) stage = 'Elder';
    else if (level >= 6) stage = 'Adult';
    else if (level >= 3) stage = 'Teen';
    else if (level >= 2) stage = 'Baby';

    let mood: PetState['mood'] = 'Neutral';
    if (careState === 'Neglected') mood = 'Sad';
    else if (health === 0) mood = 'Dead';
    else if (health < 40) mood = 'Sad';
    else if (streak > 2 || summary.totalContributions >= 100) mood = 'Ecstatic';
    else if (health > 70) mood = 'Happy';

    return this.enrichState({
      stage,
      health,
      mood,
      careState,
      posture: 'Stand',
      level,
      xp,
      xpToNextLevel,
      daysSinceLastCommit: daysSinceLast,
      commitStreak: streak,
      recentCommitsCount: summary.totalContributions,
      privateContributionsCount: summary.restrictedContributionsCount,
      topLanguage: 'GitHub',
      lastCommitMessage: summary.restrictedContributionsCount > 0
        ? `${summary.totalContributions} contributions in the last year, including ${summary.restrictedContributionsCount} private contribution(s).`
        : `${summary.totalContributions} contributions in the last year.`,
      activitySource: 'Read-only GitHub contribution graph',
      techBadges,
      scoreBreakdown: [
        { label: 'Yearly contributions', value: contributionXp },
        { label: 'Commit contributions', value: commitXp },
        { label: 'Active streak', value: streakXp },
        { label: 'Tech badges', value: badgeXp },
        { label: 'Freshness', value: freshnessXp },
      ],
    });
  }

  enrichState(
    state: Omit<PetState, 'achievements' | 'personalityLine'> &
      Partial<Pick<PetState, 'achievements' | 'personalityLine'>>
  ): PetState {
    const normalizedState: PetState = {
      ...state,
      achievements: state.achievements || [],
      personalityLine: state.personalityLine || '',
    };

    // Detect evolution milestone (stage changed from a different one)
    const prevStage = (normalizedState as PetState & { _prevStage?: string })._prevStage;
    const evolutionMilestone = prevStage && prevStage !== state.stage
      ? { from: prevStage as PetState['stage'], to: state.stage }
      : null;

    return {
      ...normalizedState,
      evolutionMilestone,
      achievements: normalizedState.achievements.length ? normalizedState.achievements : this.calculateAchievements(normalizedState),
      personalityLine: normalizedState.personalityLine || this.getPersonalityLine(normalizedState),
      scoreBreakdown: normalizedState.scoreBreakdown.length
        ? normalizedState.scoreBreakdown.filter((item) => item.value > 0)
        : [{ label: 'Base score', value: normalizedState.xp }],
    };
  }

  private calculateTechBadges(repos: GitHubRepository[]): TechBadge[] {
    // Map languages to ecosystems for normalized scoring
    const ecosystemMap = this.getEcosystemMap();

    // Group techs by ecosystem
    type EcosystemGroup = {
      repos: Set<string>;
      techs: Set<string>;
      lastUpdated?: Date;
    };
    const ecosystemGroups = new Map<string, EcosystemGroup>();

    for (const repo of repos) {
      if (repo.fork) continue;

      const repoTechs = new Set<string>();
      if (repo.language) repoTechs.add(repo.language);
      for (const tech of repo.detectedTechs || []) repoTechs.add(tech);

      for (const tech of repoTechs) {
        const ecosystem = ecosystemMap[tech] ?? 'Other';
        if (!ecosystemGroups.has(ecosystem)) {
          ecosystemGroups.set(ecosystem, { repos: new Set(), techs: new Set(), lastUpdated: undefined });
        }
        const group = ecosystemGroups.get(ecosystem)!;
        group.repos.add(repo.full_name || repo.name);
        group.techs.add(tech);
        if (repo.updated_at && !group.lastUpdated) {
          const updated = new Date(repo.updated_at);
          if (!isNaN(updated.getTime())) group.lastUpdated = updated;
        }
      }
    }

    // Build badge entries from ecosystem groups
    const badgeEntries: { tech: string; repoCount: number; level: number; tier: string }[] = [];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    for (const [ecosystem, group] of ecosystemGroups) {
      const repoCount = group.repos.size;
      const varietyCount = group.techs.size;
      const isRecent = group.lastUpdated && group.lastUpdated > ninetyDaysAgo;

      // Calculate normalized score
      let score = 0;
      if (ecosystem === 'JS/TS') {
        // JS/TS gets variety bonus + recency bonus; cap per-language weight at 3
        score = Math.min(repoCount, 3) + (varietyCount - 1) * 0.5 + (isRecent ? 1 : 0);
      } else {
        // Other ecosystems: capped repo count
        score = Math.min(repoCount, 3) + (varietyCount - 1) * 0.5;
      }

      // Map ecosystem group to a representative tech name for display
      const representativeTech = ecosystem === 'JS/TS' ? 'JavaScript' :
        ecosystem === 'Python' ? 'Python' :
        ecosystem === 'Rust' ? 'Rust' :
        ecosystem === 'Go' ? 'Go' :
        ecosystem === 'Java' ? 'Java' :
        ecosystem === 'C/C++' ? 'C++' :
        ecosystem === 'Ruby' ? 'Ruby' :
        ecosystem === 'PHP' ? 'PHP' :
        ecosystem === 'Swift' ? 'Swift' :
        ecosystem === 'Kotlin' ? 'Kotlin' :
        ecosystem === 'C#' ? 'C#' : [...group.techs][0] || ecosystem;

      const badgeRank = this.getBadgeRankFromScore(Math.floor(score));
      badgeEntries.push({
        tech: representativeTech,
        repoCount,
        level: badgeRank.level,
        tier: badgeRank.tier as TechBadge['tier'],
      });
    }

    return (badgeEntries.map(entry => ({
        tech: entry.tech,
        repoCount: entry.repoCount,
        iconSlug: this.getSimpleIconSlug(entry.tech),
        iconUrl: this.getSimpleIconUrl(entry.tech),
        level: entry.level,
        tier: entry.tier,
      })) as TechBadge[])
      .sort((a, b) => b.level - a.level || b.repoCount - a.repoCount || a.tech.localeCompare(b.tech))
      .slice(0, 12);
  }

  private getEcosystemMap(): Record<string, string> {
    return {
      JavaScript: 'JS/TS', TypeScript: 'JS/TS',
      React: 'JS/TS', Vue: 'JS/TS', Svelte: 'JS/TS', Astro: 'JS/TS',
      'Next.js': 'JS/TS', Remix: 'JS/TS', Vite: 'JS/TS',
      NestJS: 'JS/TS', Express: 'JS/TS', 'Tailwind CSS': 'JS/TS',
      Prisma: 'JS/TS', Supabase: 'JS/TS', 'Three.js': 'JS/TS',
      MDX: 'JS/TS', 'Jupyter Notebook': 'Python',
    };
  }

  private getBadgeRankFromScore(score: number): Pick<TechBadge, 'level' | 'tier'> {
    if (score >= 10) return { level: 5, tier: 'Legend' };
    if (score >= 7) return { level: 4, tier: 'Platinum' };
    if (score >= 4) return { level: 3, tier: 'Gold' };
    if (score >= 2) return { level: 2, tier: 'Silver' };
    return { level: 1, tier: 'Bronze' };
  }

  private getSimpleIconSlug(tech: string): string | null {
    const slugMap: Record<string, string> = {
      Astro: 'astro',
      Angular: 'angular',
      C: 'c',
      'C#': 'dotnet',
      'C++': 'cplusplus',
      CSS: 'css',
      Dart: 'dart',
      Dockerfile: 'docker',
      Elixir: 'elixir',
      Express: 'express',
      Firebase: 'firebase',
      Go: 'go',
      HTML: 'html5',
      Java: 'openjdk',
      JavaScript: 'javascript',
      'Jupyter Notebook': 'jupyter',
      Kotlin: 'kotlin',
      Lua: 'lua',
      MDX: 'mdx',
      PHP: 'php',
      NestJS: 'nestjs',
      'Next.js': 'nextdotjs',
      Python: 'python',
      Prisma: 'prisma',
      React: 'react',
      Remix: 'remix',
      R: 'r',
      Ruby: 'ruby',
      Rust: 'rust',
      Sass: 'sass',
      Shell: 'gnubash',
      Svelte: 'svelte',
      Swift: 'swift',
      Supabase: 'supabase',
      'Tailwind CSS': 'tailwindcss',
      'Three.js': 'threedotjs',
      TypeScript: 'typescript',
      Vite: 'vite',
      Vue: 'vuedotjs',
    };

    return slugMap[tech] || null;
  }

  private getSimpleIconUrl(tech: string): string | null {
    const slug = this.getSimpleIconSlug(tech);
    return slug ? `https://cdn.simpleicons.org/${slug}?viewbox=auto` : null;
  }

  private getBadgeRank(repoCount: number): Pick<TechBadge, 'level' | 'tier'> {
    if (repoCount >= 20) return { level: 5, tier: 'Legend' };
    if (repoCount >= 10) return { level: 4, tier: 'Platinum' };
    if (repoCount >= 5) return { level: 3, tier: 'Gold' };
    if (repoCount >= 3) return { level: 2, tier: 'Silver' };
    return { level: 1, tier: 'Bronze' };
  }

  private calculateAchievements(state: PetState): AchievementBadge[] {
    const achievements: AchievementBadge[] = [];
    const topBadgeLevel = Math.max(0, ...state.techBadges.map((badge) => badge.level));

    if (state.recentCommitsCount > 0) {
      achievements.push({
        name: 'First Signal',
        description: 'GitHub activity detected. The creature has stopped sulking.',
        icon: 'bolt',
      });
    }

    if (state.careState === 'Thriving') {
      achievements.push({
        name: 'Freshly Fed',
        description: 'Activity landed today. The pet is insufferably pleased.',
        icon: 'restaurant',
      });
    }

    if (state.careState === 'Neglected') {
      achievements.push({
        name: 'Needs Attention',
        description: 'No recent push signal. The pet has begun judging silently.',
        icon: 'sentiment_dissatisfied',
      });
    }

    if (state.commitStreak >= 7) {
      achievements.push({
        name: 'Streak Keeper',
        description: `${state.commitStreak} active days in sequence.`,
        icon: 'local_fire_department',
      });
    }

    if (state.techBadges.length >= 4) {
      achievements.push({
        name: 'Polyglot',
        description: `${state.techBadges.length} active tech lanes detected.`,
        icon: 'hub',
      });
    }

    if (topBadgeLevel >= 4) {
      achievements.push({
        name: 'Specialist',
        description: 'At least one tech badge reached platinum or better.',
        icon: 'workspace_premium',
      });
    }

    if (state.level >= 10) {
      achievements.push({
        name: 'Elder Maintainer',
        description: 'Reached the elder evolution tier.',
        icon: 'auto_awesome',
      });
    }

    return achievements.slice(0, 5);
  }

  private getPersonalityLine(state: PetState): string {
    if (state.careState === 'Neglected') return 'Neglected. No recent push signal, and the pet has noticed.';
    if (state.careState === 'Resting') return 'Resting. Not abandoned, but definitely eyeing the commit log.';
    if (state.careState === 'Thriving') return 'Freshly fed by recent activity. The pet is dangerously smug.';
    if (state.health === 0) return 'The pet is not angry. Just disappointed. Terminally.';
    if (state.level >= 10) return 'Ancient commit energy detected. Slightly terrifying, mostly useful.';
    if (state.commitStreak >= 7) return 'A proper streak. The pet has stopped drafting resignation letters.';
    if (state.techBadges.some((badge) => badge.level >= 4)) return 'Specialist detected. The badge cabinet is no longer decorative.';
    if (state.techBadges.length >= 4) return 'Polyglot behavior confirmed. Chaotic, but marketable.';
    if (state.daysSinceLastCommit > 14) return 'The repository garden appears to need watering.';
    if (state.mood === 'Ecstatic') return 'Suspiciously productive. Continue before someone schedules a meeting.';
    if (state.mood === 'Happy') return 'Healthy commit pulse. The pet approves, quietly.';
    return 'Stable, but not exactly setting the leaderboard on fire.';
  }

  private getCareState(daysSinceLastCommit: number): PetState['careState'] {
    if (daysSinceLastCommit === 0) return 'Thriving';
    if (daysSinceLastCommit <= 3) return 'Active';
    if (daysSinceLastCommit <= 14) return 'Resting';
    return 'Neglected';
  }

  private getFreshnessXp(careState: PetState['careState']): number {
    if (careState === 'Thriving') return 150;
    if (careState === 'Active') return 90;
    if (careState === 'Resting') return 25;
    return 0;
  }
}
