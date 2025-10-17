import { describe, it, expect } from 'vitest';
import { TagDeploymentFactory } from '../TagDeploymentFactory';
import { TagDeploymentManager } from '../TagDeploymentManager';
import { TagConfig } from '../../types';

describe('TagDeploymentFactory', () => {
  it('should create TagDeploymentManager with all strategies', () => {
    // Arrange
    const tagConfigs: TagConfig[] = [
      { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
      { id: '2', platform: 'meta', tagId: 'FB-456', enabled: true },
    ];

    // Act
    const manager = TagDeploymentFactory.createManager(tagConfigs);

    // Assert
    expect(manager).toBeInstanceOf(TagDeploymentManager);
  });

  it('should accept empty tag configs array', () => {
    // Arrange
    const tagConfigs: TagConfig[] = [];

    // Act
    const manager = TagDeploymentFactory.createManager(tagConfigs);

    // Assert
    expect(manager).toBeInstanceOf(TagDeploymentManager);
  });

  it('should create manager with multiple tag configs', () => {
    // Arrange
    const tagConfigs: TagConfig[] = [
      { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
      { id: '2', platform: 'meta', tagId: 'FB-456', enabled: true },
      { id: '3', platform: 'microsoft', tagId: 'MS-789', enabled: true },
      { id: '4', platform: 'linkedin', tagId: 'LI-101', enabled: false },
      { id: '5', platform: 'twitter', tagId: 'TW-202', enabled: true },
      { id: '6', platform: 'tiktok', tagId: 'TT-303', enabled: true },
    ];

    // Act
    const manager = TagDeploymentFactory.createManager(tagConfigs);

    // Assert
    expect(manager).toBeInstanceOf(TagDeploymentManager);
  });
});
