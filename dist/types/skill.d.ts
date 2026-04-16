export interface Skill {
    id: string;
    name: string;
    description: string;
    source: 'claude' | 'codex' | 'openclaw' | 'agents';
    path: string;
    isSymlink: boolean;
    enabled: boolean;
    tags: string[];
    installedAt?: string;
}
export interface SkillIndex {
    version: string;
    lastScan: string;
    skills: Skill[];
}
export interface Operation {
    id: string;
    type: 'remove' | 'disable' | 'enable';
    skillId: string;
    skillName: string;
    originalPath: string;
    backupPath: string;
    timestamp: string;
    expiresAt: string;
}
//# sourceMappingURL=skill.d.ts.map