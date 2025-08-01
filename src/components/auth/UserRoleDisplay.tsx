import React from 'react';
import { TAccount } from '@/feature/auth/types/auth.type';
import { accountHelpers } from '@/utils/rbac-utils';
import { MultiRoleBadges, RoleBadge } from './RoleBadge';

interface UserRoleDisplayProps {
  account: TAccount | null;
  displayMode?: 'badges' | 'text' | 'primary-only';
  maxRoles?: number;
  className?: string;
  showPrefix?: boolean;
}

export const UserRoleDisplay: React.FC<UserRoleDisplayProps> = ({
  account,
  displayMode = 'badges',
  maxRoles = 3,
  className = '',
  showPrefix = false
}) => {
  if (!account) {
    return <span className={`text-muted-foreground ${className}`}>No roles assigned</span>;
  }

  const allRoles = accountHelpers.getAllRoleNames(account);
  const primaryRole = accountHelpers.getCurrentRoleName(account);

  if (displayMode === 'primary-only') {
    return (
      <RoleBadge 
        role={primaryRole} 
        showPrefix={showPrefix}
        className={className}
      />
    );
  }

  if (displayMode === 'text') {
    const roleText = allRoles.length > 1 
      ? `${primaryRole} (+${allRoles.length - 1} more)`
      : primaryRole;
    
    return (
      <span className={className}>
        {showPrefix ? `ROLE_${roleText}` : roleText}
      </span>
    );
  }

  // Default: badges mode
  return (
    <MultiRoleBadges
      roles={allRoles}
      maxDisplay={maxRoles}
      showPrefix={showPrefix}
      className={className}
    />
  );
};

interface DetailedUserRoleDisplayProps {
  account: TAccount | null;
  showRoleIds?: boolean;
  className?: string;
}

export const DetailedUserRoleDisplay: React.FC<DetailedUserRoleDisplayProps> = ({
  account,
  showRoleIds = false,
  className = ''
}) => {
  if (!account) {
    return (
      <div className={`text-muted-foreground ${className}`}>
        <p>No account data available</p>
      </div>
    );
  }

  const allRoles = accountHelpers.getAllRoleNames(account);
  const primaryRole = accountHelpers.getCurrentRoleName(account);

  return (
    <div className={`space-y-2 ${className}`}>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Primary Role:</label>
        <div className="mt-1">
          <RoleBadge role={primaryRole} />
        </div>
      </div>
      
      {allRoles.length > 1 && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">All Roles:</label>
          <div className="mt-1">
            <MultiRoleBadges roles={allRoles} maxDisplay={10} />
          </div>
        </div>
      )}
      
      {showRoleIds && account.role_ids && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Role IDs:</label>
          <div className="mt-1 text-sm text-muted-foreground">
            {account.role_ids.join(', ')}
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        Total roles: {allRoles.length}
      </div>
    </div>
  );
};

export default UserRoleDisplay;