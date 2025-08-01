import React from 'react';
import { Badge } from '@/components/ui/badge';
import { extractRoleName } from '@/utils/rbac-utils';

interface RoleBadgeProps {
  role: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  showPrefix?: boolean;
}

const getRoleColor = (role: string): RoleBadgeProps['variant'] => {
  const cleanRole = extractRoleName(role);
  
  switch (cleanRole) {
    case 'ADMIN':
      return 'destructive';
    case 'MANAGER':
      return 'default';
    case 'TEACHER':
      return 'secondary';
    case 'STUDENT':
      return 'outline';
    case 'PARENT':
      return 'outline';
    default:
      return 'secondary';
  }
};

const formatRoleDisplay = (role: string, showPrefix: boolean = false): string => {
  const cleanRole = extractRoleName(role);
  
  if (showPrefix && !role.startsWith('ROLE_')) {
    return `ROLE_${cleanRole}`;
  }
  
  return cleanRole;
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  variant,
  className = '',
  showPrefix = false
}) => {
  const displayRole = formatRoleDisplay(role, showPrefix);
  const badgeVariant = variant || getRoleColor(role);
  
  return (
    <Badge variant={badgeVariant} className={className}>
      {displayRole}
    </Badge>
  );
};

interface MultiRoleBadgesProps {
  roles: string[];
  maxDisplay?: number;
  showPrefix?: boolean;
  className?: string;
  badgeClassName?: string;
}

export const MultiRoleBadges: React.FC<MultiRoleBadgesProps> = ({
  roles,
  maxDisplay = 3,
  showPrefix = false,
  className = '',
  badgeClassName = ''
}) => {
  const displayRoles = roles.slice(0, maxDisplay);
  const remainingCount = roles.length - maxDisplay;
  
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayRoles.map((role, index) => (
        <RoleBadge
          key={`${role}-${index}`}
          role={role}
          showPrefix={showPrefix}
          className={badgeClassName}
        />
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className={badgeClassName}>
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};

export default RoleBadge;