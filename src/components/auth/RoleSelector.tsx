import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TRole } from '@/feature/auth/types/auth.type';
import { extractRoleName } from '@/utils/rbac-utils';

interface RoleSelectorProps {
  availableRoles: TRole[];
  selectedRoleIds: number[];
  onChange: (roleIds: number[]) => void;
  multiSelect?: boolean;
  disabled?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  availableRoles,
  selectedRoleIds,
  onChange,
  multiSelect = true,
  disabled = false,
  title = "Select Roles",
  description = "Choose the roles to assign to this user",
  className = ''
}) => {
  const [localSelected, setLocalSelected] = useState<number[]>(selectedRoleIds);

  useEffect(() => {
    setLocalSelected(selectedRoleIds);
  }, [selectedRoleIds]);

  const handleRoleToggle = (roleId: number) => {
    if (disabled) return;

    let newSelection: number[];
    
    if (multiSelect) {
      newSelection = localSelected.includes(roleId)
        ? localSelected.filter(id => id !== roleId)
        : [...localSelected, roleId];
    } else {
      newSelection = localSelected.includes(roleId) ? [] : [roleId];
    }
    
    setLocalSelected(newSelection);
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allRoleIds = availableRoles.map(role => role.id);
    setLocalSelected(allRoleIds);
    onChange(allRoleIds);
  };

  const handleClearAll = () => {
    if (disabled) return;
    setLocalSelected([]);
    onChange([]);
  };

  const getRoleDisplayName = (roleName: string): string => {
    return extractRoleName(roleName);
  };

  const getRoleDescription = (roleName: string): string => {
    const cleanRole = extractRoleName(roleName);
    
    const descriptions: Record<string, string> = {
      'ADMIN': 'Full system access and user management',
      'MANAGER': 'Operational management and oversight',
      'TEACHER': 'Class management and teaching tools',
      'STUDENT': 'Learning access and progress tracking',
      'PARENT': 'Child monitoring and communication'
    };
    
    return descriptions[cleanRole] || 'Standard user access';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline">
              {localSelected.length} selected
            </Badge>
          </div>
        </div>
        
        {multiSelect && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={disabled || localSelected.length === availableRoles.length}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled || localSelected.length === 0}
            >
              Clear All
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {availableRoles.map((role) => {
            const isSelected = localSelected.includes(role.id);
            const displayName = getRoleDisplayName(role.name);
            const description = getRoleDescription(role.name);
            
            return (
              <div
                key={role.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  isSelected 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'hover:bg-muted/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => handleRoleToggle(role.id)}
              >
                <Checkbox
                  id={`role-${role.id}`}
                  checked={isSelected}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <Label 
                    htmlFor={`role-${role.id}`}
                    className={`text-sm font-medium ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {displayName}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    ID: {role.id} | Full name: {role.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {availableRoles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No roles available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SimpleRoleSelectorProps {
  availableRoles: TRole[];
  selectedRoleIds: number[];
  onChange: (roleIds: number[]) => void;
  placeholder?: string;
  className?: string;
}

export const SimpleRoleSelector: React.FC<SimpleRoleSelectorProps> = ({
  availableRoles,
  selectedRoleIds,
  onChange,
  placeholder = "Select roles...",
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {availableRoles.map((role) => {
          const isSelected = selectedRoleIds.includes(role.id);
          const displayName = extractRoleName(role.name);
          
          return (
            <Badge
              key={role.id}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                const newSelection = isSelected
                  ? selectedRoleIds.filter(id => id !== role.id)
                  : [...selectedRoleIds, role.id];
                onChange(newSelection);
              }}
            >
              {displayName}
            </Badge>
          );
        })}
      </div>
      
      {selectedRoleIds.length === 0 && (
        <p className="text-sm text-muted-foreground">{placeholder}</p>
      )}
    </div>
  );
};

export default RoleSelector;