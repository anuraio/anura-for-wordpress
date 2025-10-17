import { describe, it, expect, vi } from 'vitest';
import { TagDeploymentManager } from '../TagDeploymentManager';
import { TagDeploymentStrategy, TagConfig } from '../../types';

describe('TagDeploymentManager', () => {
  it('should call deploy on all strategies when handleGoodResult is called', () => {
    // Arrange
    const mockStrategy1: TagDeploymentStrategy = {
      deploy: vi.fn(),
      getPlatform: vi.fn(() => 'platform1'),
    };
    const mockStrategy2: TagDeploymentStrategy = {
      deploy: vi.fn(),
      getPlatform: vi.fn(() => 'platform2'),
    };
    const tagConfigs: TagConfig[] = [
      { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
    ];
    const manager = new TagDeploymentManager([mockStrategy1, mockStrategy2], tagConfigs);

    // Act
    manager.handleGoodResult();

    // Assert
    expect(mockStrategy1.deploy).toHaveBeenCalledWith(tagConfigs);
    expect(mockStrategy2.deploy).toHaveBeenCalledWith(tagConfigs);
  });

  it('should pass tag configs to each strategy', () => {
    // Arrange
    const mockStrategy: TagDeploymentStrategy = {
      deploy: vi.fn(),
      getPlatform: vi.fn(() => 'test'),
    };
    const tagConfigs: TagConfig[] = [
      { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
      { id: '2', platform: 'meta', tagId: 'FB-456', enabled: false },
    ];
    const manager = new TagDeploymentManager([mockStrategy], tagConfigs);

    // Act
    manager.handleGoodResult();

    // Assert
    expect(mockStrategy.deploy).toHaveBeenCalledWith(tagConfigs);
    expect(mockStrategy.deploy).toHaveBeenCalledTimes(1);
  });

  it('should work with empty strategies array', () => {
    // Arrange
    const tagConfigs: TagConfig[] = [
      { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
    ];
    const manager = new TagDeploymentManager([], tagConfigs);

    // Act & Assert - should not throw
    expect(() => manager.handleGoodResult()).not.toThrow();
  });

  it('should work with empty tag configs', () => {
    // Arrange
    const mockStrategy: TagDeploymentStrategy = {
      deploy: vi.fn(),
      getPlatform: vi.fn(() => 'test'),
    };
    const manager = new TagDeploymentManager([mockStrategy], []);

    // Act
    manager.handleGoodResult();

    // Assert
    expect(mockStrategy.deploy).toHaveBeenCalledWith([]);
  });
});
